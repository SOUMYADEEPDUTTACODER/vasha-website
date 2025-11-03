import os
import torch
import soundfile as sf
import numpy as np
import subprocess
from transformers import AutoTokenizer

# ✅ CRITICAL: Register safe globals BEFORE importing TTS for PyTorch 2.6 compatibility
try:
    from torch.serialization import add_safe_globals
    try:
        from TTS.tts.configs.xtts_config import XttsConfig
        from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
        from TTS.config.shared_configs import BaseDatasetConfig
        add_safe_globals([XttsConfig, XttsAudioConfig, XttsArgs, BaseDatasetConfig])
    except ImportError:
        # Try minimal registration
        try:
            from TTS.tts.configs.xtts_config import XttsConfig
            add_safe_globals([XttsConfig])
        except:
            pass
except ImportError:
    pass

# Monkey-patch torch.load for TTS model compatibility
_original_torch_load = torch.load
def _patched_torch_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        if args and isinstance(args[0], (str, os.PathLike)):
            filepath = str(args[0])
            if 'tts_models' in filepath or 'xtts' in filepath.lower() or 'coqui' in filepath.lower():
                kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)
torch.load = _patched_torch_load

# Now import TTS after setup
from TTS.api import TTS

# Import local modules
try:
    from .tts_gtts import run_gtts
    from .indic_tts import run_indic_tts, INDIC_LANGS
except ImportError:
    # Fallback for direct import
    from tts_gtts import run_gtts
    from indic_tts import run_indic_tts, INDIC_LANGS

# =========================================================
# 🧩 Auto-fix missing dependencies for Japanese tokenizer
# =========================================================
try:
    import cutlet
    import fugashi
    import unidic_lite
    os.environ["UNIDIC_DIR"] = unidic_lite.DICDIR
    os.environ["MECABRC"] = ""  # prevent MeCab system lookup
    print("✅ Japanese tokenizer (cutlet + fugashi + unidic-lite) ready.")
except Exception:
    print("⚙️ Installing missing Japanese text dependencies...")
    subprocess.run(["pip", "install", "cutlet", "fugashi[unidic-lite]", "unidic-lite"], check=False)
    try:
        import cutlet, fugashi, unidic_lite
        os.environ["UNIDIC_DIR"] = unidic_lite.DICDIR
        os.environ["MECABRC"] = ""
    except:
        pass


# =========================================================
# 🪶 Tokenizer for XTTS
# =========================================================
_xtts_tokenizer = AutoTokenizer.from_pretrained("facebook/mbart-large-50")


# =========================================================
# 🌐 Supported XTTS languages
# =========================================================
XTTS_LANGS = {
    "en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl",
    "cs", "ar", "zh-cn", "hu", "ko", "ja", "hi"
}


# =========================================================
# 🌏 FLORES → ISO mapping (Indic + Global)
# =========================================================
FLORES_TO_ISO = {
    "eng_Latn": "en", "spa_Latn": "es", "fra_Latn": "fr", "ita_Latn": "it",
    "por_Latn": "pt", "deu_Latn": "de", "rus_Cyrl": "ru", "tur_Latn": "tr",
    "fas_Arab": "fa", "ind_Latn": "id", "jpn_Jpan": "ja", "kor_Hang": "ko",
    "zho_Hans": "zh-cn", "ara_Arab": "ar", "hin_Deva": "hi",

    # Indic
    "hi": "hin_Deva", "mr": "mar_Deva", "gu": "guj_Gujr", "bn": "ben_Beng",
    "pa": "pan_Guru", "as": "asm_Beng", "or": "ory_Orya", "ne": "npi_Deva",
    "sd": "snd_Arab", "sa": "san_Deva", "ur": "urd_Arab",
    "ta": "tam_Taml", "te": "tel_Telu", "kn": "kan_Knda", "ml": "mal_Mlym",

    # Latin transliterations
    "hi_Latn": "hin_Deva", "bn_Latn": "ben_Beng", "pa_Latn": "pan_Guru",
    "ta_Latn": "tam_Taml", "te_Latn": "tel_Telu", "kn_Latn": "kan_Knda",
    "ml_Latn": "mal_Mlym", "en": "eng_Latn"
}


# =========================================================
# 🗣️ gTTS language normalization (ISO → gTTS supported)
# =========================================================
GTTS_LANG_MAP = {
    # Indic (639-1)
    "hi": "hi", "hin": "hi",
    "bn": "bn", "ben": "bn",
    "gu": "gu", "guj": "gu",
    "kn": "kn", "kan": "kn",
    "ml": "ml", "mal": "ml",
    "mr": "mr", "mar": "mr",
    "ne": "ne", "npi": "ne",
    "pa": "pa", "pan": "pa",
    "ta": "ta", "tam": "ta",
    "te": "te", "tel": "te",
    "ur": "ur", "urd": "ur",

    # Global
    "en": "en", "es": "es", "fr": "fr", "de": "de", "it": "it",
    "pt": "pt", "tr": "tr", "ru": "ru", "ja": "ja", "ko": "ko",
    "zh": "zh-CN", "zh-cn": "zh-CN", "ar": "ar", "id": "id", "fa": "fa",
}


# =========================================================
# ✂️ Token-safe text splitter
# =========================================================
def split_text_by_tokens(text, max_tokens=350):
    if not text.strip():
        return []
    tokens = _xtts_tokenizer.encode(text)
    total = len(tokens)
    if total <= max_tokens:
        return [text]

    chunks, start = [], 0
    while start < total:
        end = min(start + max_tokens, total)
        sub_text = _xtts_tokenizer.decode(tokens[start:end])
        chunks.append(sub_text.strip())
        start = end
    return chunks


# =========================================================
# 🧠 Smarter sentence splitter for Japanese / Indic
# =========================================================
def smart_split_text(text, lang, max_len=120):
    text = text.strip().replace("\n", " ")
    import re
    if lang == "ja":
        sentences = re.split(r'(?<=[。！？])', text)
    else:
        sentences = re.split(r'(?<=[.!?])\s+', text)

    chunks, current = [], ""
    for s in sentences:
        if len(current) + len(s) <= max_len:
            current += s
        else:
            if current:
                chunks.append(current.strip())
            current = s
    if current:
        chunks.append(current.strip())
    return chunks


# =========================================================
# 🔉 Main TTS Runner
# =========================================================
def run_tts(text, lang_code, reference_audio=None,
            out_dir="tts_output", out_name="final_tts.wav", prefer="auto"):

    os.makedirs(out_dir, exist_ok=True)

    # Normalize FLORES → ISO → gTTS code
    lang = FLORES_TO_ISO.get(lang_code, lang_code)
    lang = lang.split("_")[0] if "_" in lang else lang  # e.g. "hin_Deva" → "hin"
    lang = GTTS_LANG_MAP.get(lang, lang)  # normalize to gTTS if possible

    # 1️⃣ Indic Parler-TTS
    if prefer == "indic" or (prefer == "auto" and lang in INDIC_LANGS):
        print(f"🇮🇳 Using Indic Parler-TTS for: {lang}")
        try:
            return run_indic_tts(text, out_dir=out_dir, out_name=out_name)
        except Exception as e:
            print(f"⚠️ Indic TTS failed ({e}) — falling back to gTTS.")
            return run_gtts(text, lang=lang, out_dir=out_dir,
                            out_name=out_name.replace(".wav", ".mp3"))

    # 2️⃣ XTTS
    if prefer == "xtts" or (prefer == "auto" and lang in XTTS_LANGS):
        print(f"🎙️ Using XTTS for language: {lang}")
        try:
            tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
            tts.to("cuda" if torch.cuda.is_available() else "cpu")

            # Reference voice
            ref_wav = None
            if reference_audio and os.path.exists(reference_audio):
                try:
                    data, sr = sf.read(reference_audio)
                    if len(data) > 0:
                        ref_wav = reference_audio
                        print(f"🎧 Using reference voice: {reference_audio}")
                except Exception as e:
                    print(f"⚠️ Reference audio failed: {e}")

            # Split text safely
            chunks = split_text_by_tokens(text, 300)
            if len(chunks) == 1 and len(text) > 200:
                chunks = smart_split_text(text, lang, 120)
            print(f"🔹 {len(chunks)} text chunks prepared for XTTS.")

            audios = []
            for i, chunk in enumerate(chunks):
                try:
                    print(f"🗣️ Generating chunk {i+1}/{len(chunks)}...")
                    wav = tts.tts(text=chunk, speaker_wav=ref_wav, language=lang)
                    audios.append(wav)
                except Exception as e:
                    print(f"⚠️ XTTS chunk {i+1} failed ({e}) — using gTTS fallback.")
                    run_gtts(chunk, lang=lang, out_dir=out_dir,
                             out_name=f"_chunk_fallback_{i}.mp3")

            if not audios:
                print("⚠️ XTTS fully failed — using gTTS fallback for full text.")
                return run_gtts(text, lang=lang, out_dir=out_dir,
                                out_name=out_name.replace(".wav", ".mp3"))

            final_wav = np.concatenate(audios)
            out_path = os.path.join(out_dir, out_name)
            sf.write(out_path, final_wav, 24000)
            print(f"✅ XTTS output saved to: {out_path}")
            return out_path

        except Exception as e:
            print(f"❌ XTTS crashed ({e}) — using gTTS fallback.")
            return run_gtts(text, lang=lang, out_dir=out_dir,
                            out_name=out_name.replace(".wav", ".mp3"))

    # 3️⃣ Universal gTTS Fallback
    print(f"🌐 Using Google TTS fallback for language: {lang}")
    return run_gtts(text, lang=lang, out_dir=out_dir,
                    out_name=out_name.replace(".wav", ".mp3"))

