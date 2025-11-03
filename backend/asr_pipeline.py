import os
import time
import re
import whisper
import spacy
import torchaudio
import torch
import faster_whisper
from transformers import AutoModel
from jiwer import wer
from concurrent.futures import ThreadPoolExecutor, as_completed

from lid import (
    LanguageIdentifier,
    extract_audio_ffmpeg,
    download_youtube_audio,
    record_live_audio,
    TARGET_LANGS
)

# Load spaCy English model (used for proper-noun highlighting)
nlp = spacy.load("en_core_web_lg")

# Map LID ISO codes to IndicTrans2 language tags
LID2INDICTRANS = {
    "hi": "hin_Deva", "mr": "mar_Deva", "gu": "guj_Gujr", "bn": "ben_Beng",
    "pa": "pan_Guru", "ta": "tam_Taml", "te": "tel_Telu", "kn": "kan_Knda",
    "ml": "mal_Mlym", "ne": "npi_Deva", "as": "asm_Beng", "or": "ory_Orya",
    "sd": "snd_Arab", "sa": "san_Deva", "ur": "urd_Arab", "en": "eng_Latn",
}

# Lazy load AI4Bharat ASR
ai4bharat_model = None
def load_ai4bharat_model():
    global ai4bharat_model
    if ai4bharat_model is None:
        # Optional: use Hugging Face token if provided (needed for gated repo access)
        hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")
        ai4bharat_model = AutoModel.from_pretrained(
            "ai4bharat/indic-conformer-600m-multilingual",
            trust_remote_code=True,
            token=hf_token if hf_token else None,
        )
    return ai4bharat_model

def get_proper_nouns(text):
    doc = nlp(text)
    return set(token.text for token in doc if token.pos_ == "PROPN")


# ------------------------
# ASR Functions
# ------------------------

def transcribe_whisper(audio_path, language_code=None, model_size="large"):
    print("\n🔠 Running Whisper ASR...")
    model = whisper.load_model(model_size)
    result = model.transcribe(audio_path, language=language_code)
    return result['text']

def transcribe_fasterwhisper(audio_path, language_code=None, model_size="large-v2"):
    print("\n⚡ Running Faster-Whisper ASR...")
    model = faster_whisper.WhisperModel(model_size, device="cuda" if torch.cuda.is_available() else "cpu")
    segments, _ = model.transcribe(audio_path, language=language_code)
    return " ".join([seg.text for seg in segments])

def transcribe_ai4bharat(audio_path, language_code, decoding_strategy="ctc"):
    print(f"\n🔠 Running AI4Bharat ASR with {decoding_strategy.upper()} decoding...")
    wav, sr = torchaudio.load(audio_path)
    wav = torch.mean(wav, dim=0, keepdim=True)  # Convert to mono

    target_sr = 16000
    if sr != target_sr:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sr)
        wav = resampler(wav)

    model = load_ai4bharat_model()
    transcription = model(wav, language_code, decoding_strategy)
    return transcription


# ------------------------
# Chunking + Parallel ASR
# ------------------------

def chunk_audio(audio_path, chunk_len=30):
    """Split audio into N-second chunks (WAV)."""
    wav, sr = torchaudio.load(audio_path)
    duration = wav.size(1) / sr
    chunks = []

    os.makedirs("chunks", exist_ok=True)
    for i in range(0, int(duration), chunk_len):
        start = i * sr
        end = min((i + chunk_len) * sr, wav.size(1))
        chunk_wav = wav[:, start:end]
        chunk_path = f"chunks/{os.path.basename(audio_path)}_{i//chunk_len}.wav"
        torchaudio.save(chunk_path, chunk_wav, sr)
        chunks.append(chunk_path)
    return chunks

def transcribe_in_chunks(audio_path, model_name, lang, whisper_size, decoding):
    """Run ASR in parallel on chunks."""
    chunks = chunk_audio(audio_path, chunk_len=30)
    print(f"🔪 Split into {len(chunks)} chunks...")

    results = []
    max_workers = 1 if model_name == "ai4bharat" else 1

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {}
        for c in chunks:
            if model_name == "faster_whisper":
                futures[executor.submit(transcribe_fasterwhisper, c, lang, whisper_size)] = c
            elif model_name == "whisper":
                futures[executor.submit(transcribe_whisper, c, lang, whisper_size)] = c
            else:  # ai4bharat
                futures[executor.submit(transcribe_ai4bharat, c, lang, decoding)] = c

        errors = []
        for fut in as_completed(futures):
            try:
                results.append((futures[fut], fut.result()))
            except Exception as e:
                print(f"❌ Error transcribing {futures[fut]}: {e}")
                errors.append(e)

    # If every chunk failed, raise to trigger fallback
    if len(results) == 0:
        if errors:
            # Surface the first error; outer layer will handle fallback
            raise errors[0]
        raise Exception("No chunks transcribed")

    results.sort(key=lambda x: x[0])  # keep chunk order
    return " ".join([r[1] for r in results])


# ------------------------
# Formatting & Saving
# ------------------------

def clean_and_paragraphize(text, max_chars=500):
    """
    Cleans ASR output and splits it into paragraphs.
    - max_chars controls paragraph length before inserting a break.
    """
    # Normalize spaces
    text = re.sub(r'\s+', ' ', text).strip()

    # Split into sentences (supports Indic + English punctuation)
    sentences = re.split(r'(?<=[।.!?])\s+', text)

    # Rebuild paragraphs
    paragraphs, current = [], ""
    for sent in sentences:
        if not sent.strip():
            continue
        if len(current) + len(sent) < max_chars:
            current += " " + sent
        else:
            paragraphs.append(current.strip())
            current = sent
    if current:
        paragraphs.append(current.strip())

    return "\n\n".join(paragraphs)


def process_transcription(audio_path, text):
    """
    Post-process transcription:
    - Extract proper nouns (spaCy)
    - Clean + reformat into paragraphs
    - Save to .txt file
    """
    proper_nouns = get_proper_nouns(text)
    final_output = clean_and_paragraphize(text)

    output_txt_path = os.path.splitext(audio_path)[0] + "_transcription.txt"
    with open(output_txt_path, "w", encoding="utf-8") as f:
        f.write(final_output)

    print(f"\n📝 Transcription (formatted):\n{final_output[:3000]}...")  # Print sample
    print(f"🔍 Proper Nouns: {', '.join(proper_nouns) if proper_nouns else 'None'}")
    print(f"💾 Saved to: {output_txt_path}")

    return final_output, output_txt_path


# ------------------------
# Final ASR Runner with Fallback
# ------------------------

def run_asr_with_fallback(audio_path, asr_model="whisper", whisper_size="large", decoding="ctc", 
                         duration=5, mic=False, youtube=None, lid_model="whisper", 
                         selected_language=None):
    """
    Run ASR with automatic language detection and fallback mechanism from Indic to Whisper
    """
    try:
        # Handle input
        if youtube:
            audio_path = download_youtube_audio(youtube)
        elif mic:
            print("\n🎤 Speak now...")
            time.sleep(1)
            audio_path = record_live_audio(duration=duration)
        elif audio_path.lower().endswith(('.mp4', '.mkv', '.mov', '.avi')):
            audio_path = extract_audio_ffmpeg(audio_path)

        # Language Identification - Always detect language automatically
        print(f"\n🔍 Detecting language using {lid_model} LID model...")
        lid = LanguageIdentifier(lid_model=lid_model)
        detected_lang, probs = lid.detect(audio_path)
        
        # Use detected language (ignore selected_language for ASR)
        lang = detected_lang
        print(f"\n✅ Detected Language: {TARGET_LANGS.get(lang, lang)} ({lang})")
        
        if probs:
            print(f"📊 Language probabilities: {dict(list(probs.items())[:3])}")  # Show top 3

        if not lang:
            raise Exception("Could not detect language from audio")

        # Run ASR with fallback mechanism
        text = None
        model_used = asr_model
        
        try:
            if asr_model == "ai4bharat":
                # Try AI4Bharat first
                print(f"\n🔠 Attempting AI4Bharat ASR...")
                text = transcribe_in_chunks(audio_path, "ai4bharat", lang, whisper_size, decoding)
                print(f"✅ AI4Bharat ASR completed successfully")
                
            elif asr_model == "faster_whisper":
                # Use Faster-Whisper
                print(f"\n⚡ Using Faster-Whisper ASR...")
                text = transcribe_in_chunks(audio_path, "faster_whisper", lang, whisper_size, decoding)
                print(f"✅ Faster-Whisper ASR completed successfully")
                
            else:  # whisper
                # Use Whisper
                print(f"\n🔠 Using Whisper ASR...")
                text = transcribe_in_chunks(audio_path, "whisper", lang, whisper_size, decoding)
                print(f"✅ Whisper ASR completed successfully")
                
        except Exception as e:
            print(f"❌ {asr_model} ASR failed: {str(e)}")
            
            # Fallback to Whisper if AI4Bharat fails
            if asr_model == "ai4bharat":
                print(f"\n🔄 Falling back to Whisper ASR...")
                try:
                    text = transcribe_in_chunks(audio_path, "whisper", lang, whisper_size, decoding)
                    model_used = "whisper"
                    print(f"✅ Whisper fallback completed successfully")
                except Exception as fallback_error:
                    print(f"❌ Whisper fallback also failed: {str(fallback_error)}")
                    raise Exception(f"Both AI4Bharat and Whisper failed: {str(e)} | {str(fallback_error)}")
            else:
                raise e

        if not text:
            raise Exception("No transcription generated")

        # Process + save
        final_text, output_file = process_transcription(audio_path, text)

        return {
            "transcription": final_text,
            "language": lang,
            "language_name": TARGET_LANGS.get(lang, lang),
            "model_used": model_used,
            "output_file": output_file,
            "success": True
        }

    except Exception as e:
        print(f"❌ ASR processing failed: {str(e)}")
        return {
            "transcription": "",
            "language": None,
            "language_name": None,
            "model_used": asr_model,
            "output_file": None,
            "success": False,
            "error": str(e)
        }


# ----------------
# Standalone mode
# ----------------
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Standalone ASR pipeline")
    parser.add_argument("--file", help="Audio file path")
    parser.add_argument("--youtube", help="YouTube video URL")
    parser.add_argument("--mic", action="store_true", help="Use microphone input")
    parser.add_argument("--duration", type=int, default=5)
    parser.add_argument("--asr_model", choices=["whisper", "faster_whisper", "ai4bharat"], default="whisper")
    parser.add_argument("--whisper_size", default="large")
    parser.add_argument("--decoding", choices=["ctc", "rnnt"], default="ctc")
    parser.add_argument("--language", help="Selected language code")
    args = parser.parse_args()

    result = run_asr_with_fallback(
        audio_path=args.file,
        youtube=args.youtube,
        mic=args.mic,
        duration=args.duration,
        asr_model=args.asr_model,
        whisper_size=args.whisper_size,
        decoding=args.decoding,
        selected_language=args.language,
    )
    
    print(f"\nResult: {result}")
