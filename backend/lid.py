import whisper
import torch
import torchaudio
import tempfile
import subprocess
import yt_dlp
import sounddevice as sd
from scipy.io.wavfile import write
import spacy
from transformers import AutoModel

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
