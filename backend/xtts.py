import os
import argparse
import torch
from torch.serialization import add_safe_globals

# ✅ CRITICAL: Register safe globals BEFORE importing TTS
# PyTorch 2.6 requires this for model loading
try:
    from TTS.tts.configs.xtts_config import XttsConfig
    from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
    from TTS.config.shared_configs import BaseDatasetConfig
    # Register all known XTTS classes
    add_safe_globals([XttsConfig, XttsAudioConfig, XttsArgs, BaseDatasetConfig])
except ImportError:
    # If imports fail, try to register what we can
    try:
        from TTS.tts.configs.xtts_config import XttsConfig
        add_safe_globals([XttsConfig])
    except:
        pass

# Monkey-patch torch.load to handle TTS model files with weights_only=False
# This is a fallback if safe_globals registration doesn't work
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    # For TTS model files, use weights_only=False if not explicitly set
    if 'weights_only' not in kwargs:
        # Check if this might be a TTS model file
        if args and isinstance(args[0], (str, os.PathLike)):
            filepath = str(args[0])
            if 'tts_models' in filepath or 'xtts' in filepath.lower() or 'coqui' in filepath.lower():
                kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)

# Apply the patch
torch.load = _patched_torch_load

# Now import TTS after safe globals are set up
from TTS.api import TTS

# 🌍 Supported language codes for XTTS
SUPPORTED_LANGS = {
    "en": "Hello, this is English.",
    "es": "Hola, esto es español.",
    "fr": "Bonjour, ceci est le français.",
    "de": "Hallo, das ist Deutsch.",
    "it": "Ciao, questo è italiano.",
    "pt": "Olá, isto é português.",
    "pl": "Cześć, to jest polski.",
    "tr": "Merhaba, bu Türkçe.",
    "ru": "Привет, это русский.",
    "nl": "Hallo, dit is Nederlands.",
    "cs": "Ahoj, to je čeština.",
    "ar": "مرحبًا، هذه هي اللغة العربية.",
    "zh-cn": "你好，这是中文。",
    "ja": "こんにちは、これは日本語です。",
    "hu": "Helló, ez magyar.",
    "ko": "안녕하세요, 이것은 한국어입니다.",
    "hi": "नमस्ते, यह हिंदी है।"
}

def run_xtts(text, reference_audio, lang="en", out_dir="tts_output", out_name=None):
    """
    Run XTTS-v2 voice cloning with Coqui TTS API (GPU if available).
    Includes auto-fix for PyTorch safe globals.
    """
    os.makedirs(out_dir, exist_ok=True)

    try:
        # 🔹 Initialize XTTS-v2 (auto-downloads from HF if missing)
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
        tts.to("cuda" if torch.cuda.is_available() else "cpu")
    except Exception as e:
        print("⚠️ PyTorch safe globals blocked:", e)
        print("👉 Add the missing class to add_safe_globals[] above.")
        raise

    # 🔹 Default name if not provided
    if out_name is None:
        out_name = f"xtts_{lang}.wav"

    out_path = os.path.join(out_dir, out_name)

    # 🔹 Generate speech
    tts.tts_to_file(
        text=text,
        speaker_wav=reference_audio,
        language=lang,
        file_path=out_path,
    )

    print(f"✅ XTTS TTS saved to {out_path}")
    return out_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="XTTS-v2 Multilingual Voice Cloning")
    parser.add_argument("--text", type=str, help="Text to synthesize", default="This is a test of XTTS voice cloning running on GPU.")
    parser.add_argument("--lang", type=str, help="Language code (e.g., en, es, fr, zh-cn)", default="en")
    parser.add_argument("--ref", type=str, help="Reference speaker audio", default="samples/female_clip.wav")
    parser.add_argument("--out", type=str, help="Output directory", default="tts_output")
    parser.add_argument("--batch_all", action="store_true", help="Run synthesis for ALL supported languages")

    args = parser.parse_args()

    if args.batch_all:
        for lang, sample_text in SUPPORTED_LANGS.items():
            run_xtts(sample_text, args.ref, lang=lang, out_dir=args.out)
    else:
        run_xtts(args.text, args.ref, lang=args.lang, out_dir=args.out)

