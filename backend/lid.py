import whisper
import torch
import torchaudio
import tempfile
import subprocess
import yt_dlp
import sounddevice as sd
from scipy.io.wavfile import write
import spacy
from transformers import AutoModel, AutoFeatureExtractor, Wav2Vec2ForSequenceClassification

# Load spaCy English large model for proper noun filtering
nlp = spacy.load("en_core_web_lg")

# Supported target languages for LID filtering
TARGET_LANGS = {
    # --- Indic languages ---
    'as': 'Assamese',
    'bn': 'Bengali',
    'brx': 'Bodo',
    'doi': 'Dogri',
    'gu': 'Gujarati',
    'hi': 'Hindi',
    'kn': 'Kannada',
    'kas_Arab': 'Kashmiri (Arabic)',
    'kas_Deva': 'Kashmiri (Devanagari)',
    'gom': 'Konkani',
    'mai': 'Maithili',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'mni_Beng': 'Manipuri (Bengali)',
    'mni_Mtei': 'Manipuri (Meitei)',
    'npi': 'Nepali',
    'or': 'Odia',
    'pa': 'Punjabi',
    'sa': 'Sanskrit',
    'sat': 'Santali',
    'snd_Arab': 'Sindhi (Arabic)',
    'snd_Deva': 'Sindhi (Devanagari)',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ur': 'Urdu',

    # --- Global languages ---
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese (Simplified)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'fa': 'Persian',
    'tr': 'Turkish',
    'id': 'Indonesian',
}

class LanguageIdentifier:
    def __init__(self, model_size="small", device=None, lid_model="whisper"):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.lid_model = lid_model
        if lid_model == "whisper":
            self.model = whisper.load_model(model_size, device=self.device)
        elif lid_model == "ai4bharat":
            # AI4Bharat does not support LID, fallback to Whisper or raise error
            raise NotImplementedError("AI4Bharat Indic Conformer does not support LID. Use Whisper for LID.")
        elif lid_model in ("facebook_mms", "mms"):
            # Load Facebook MMS LID model
            model_id = "facebook/mms-lid-1024"
            self.processor = AutoFeatureExtractor.from_pretrained(model_id)
            self.model = Wav2Vec2ForSequenceClassification.from_pretrained(model_id)
            self.model.to(self.device)
        else:
            raise ValueError("Unsupported LID model")

    def filter_proper_nouns(self, text):
        doc = nlp(text)
        tokens = [token.text for token in doc if token.pos_ != "PROPN"]
        return " ".join(tokens)

    def detect(self, audio_path):
        if self.lid_model == "whisper":
            # Step 1: Transcribe audio to get raw text
            result = self.model.transcribe(audio_path, task="transcribe", language=None)
            raw_text = result["text"].strip()

            if not raw_text:
                print("⚠️ No transcription available for language detection.")
                return None, {}

            # Step 2: Try filtering proper nouns
            filtered_text = self.filter_proper_nouns(raw_text)

            # Step 3: Decide whether to fallback
            if not filtered_text.strip():
                print("⚠️ Not enough non-proper noun content; falling back to full text for detection.")
                text_for_detection = raw_text
            else:
                text_for_detection = filtered_text

            # Step 4: Load and prepare audio for language detection
            audio = whisper.load_audio(audio_path)
            audio = whisper.pad_or_trim(audio)
            mel = whisper.log_mel_spectrogram(audio).to(self.model.device)

            # Step 5: Detect language using Whisper
            _, probs = self.model.detect_language(mel)

            # Step 6: Filter only supported languages
            filtered_probs = {lang: prob for lang, prob in probs.items() if lang in TARGET_LANGS}

            if not filtered_probs:
                print("⚠️ Could not find any supported language in detected results.")
                return None, {}

            detected_lang = max(filtered_probs, key=filtered_probs.get)
            return detected_lang, filtered_probs
        elif self.lid_model == "ai4bharat":
            # Example: AI4Bharat LID (pseudo-code, adjust as per actual API)
            wav, sr = torchaudio.load(audio_path)
            wav = torch.mean(wav, dim=0, keepdim=True)
            target_sr = 16000
            if sr != target_sr:
                resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sr)
                wav = resampler(wav)
            # The actual AI4Bharat model may have a method for LID, e.g.:
            lid_result = self.model.detect_language(wav)
            # lid_result should be a dict: {lang_code: probability}
            filtered_probs = {lang: prob for lang, prob in lid_result.items() if lang in TARGET_LANGS}
            if not filtered_probs:
                print("⚠️ Could not find any supported language in detected results.")
                return None, {}
            detected_lang = max(filtered_probs, key=filtered_probs.get)
            return detected_lang, filtered_probs
        elif self.lid_model in ("facebook_mms", "mms"):
            # Load waveform
            wav, sr = torchaudio.load(audio_path)
            # Convert to mono
            if wav.shape[0] > 1:
                wav = torch.mean(wav, dim=0, keepdim=True)
            wav = wav.squeeze().cpu().numpy()

            # Resample to processor expected sample rate if needed
            target_sr = getattr(self.processor, "sampling_rate", 16000)
            if sr != target_sr:
                resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sr)
                wav_tensor = torch.from_numpy(wav).unsqueeze(0)
                wav_tensor = resampler(wav_tensor)
                wav = wav_tensor.squeeze().cpu().numpy()

            # Feature extraction / preprocessing
            try:
                inputs = self.processor(wav, sampling_rate=target_sr, return_tensors="pt")
            except TypeError:
                # Some feature extractors expect a list of arrays
                inputs = self.processor([wav], sampling_rate=target_sr, return_tensors="pt")

            # Move tensors to device
            for k, v in list(inputs.items()):
                if isinstance(v, torch.Tensor):
                    inputs[k] = v.to(self.device)

            # Forward
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits[0]
                probs = torch.softmax(logits, dim=-1).cpu().numpy()

            # Map model labels to TARGET_LANGS keys
            id2label = getattr(self.model.config, "id2label", {})
            filtered_probs = {}

            def _label_to_target_code(label):
                lab = label.lower()
                # direct match
                if lab in TARGET_LANGS:
                    return lab
                # split on common separators and check parts
                parts = lab.replace('-', '_').split('_')
                for p in parts:
                    if p in TARGET_LANGS:
                        return p
                # try first two letters
                if lab[:2] in TARGET_LANGS:
                    return lab[:2]
                return None

            for idx, p in enumerate(probs):
                label = id2label.get(str(idx), id2label.get(idx, None))
                if label is None:
                    continue
                target_code = _label_to_target_code(str(label))
                if target_code:
                    # accumulate if multiple labels map to same code
                    filtered_probs[target_code] = max(filtered_probs.get(target_code, 0.0), float(p))

            if not filtered_probs:
                print("⚠️ Could not find any supported language in detected results (MMS).")
                return None, {}

            detected_lang = max(filtered_probs, key=filtered_probs.get)
            return detected_lang, filtered_probs
        else:
            raise ValueError("Unsupported LID model")

# --- Utility functions for audio sources ---

def extract_audio_ffmpeg(video_path):
    temp_audio = tempfile.mktemp(suffix=".wav")
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-ar", "16000",  # 16kHz sample rate
        "-ac", "1",      # Mono
        "-vn",           # No video
        temp_audio
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return temp_audio

def download_youtube_audio(url):
    out_path = tempfile.mktemp(suffix=".wav")
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': out_path.replace('.wav', '.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
        }],
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return out_path.replace('.wav', '.wav')

def record_live_audio(duration=5, sample_rate=16000):
    print("🎤 Speak now...")
    audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1)
    sd.wait()
    print("✅ Recording complete.")
    out_path = tempfile.mktemp(suffix=".wav")
    write(out_path, sample_rate, audio)
    return out_path
