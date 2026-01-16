import os
import re
from typing import List

from googletrans import Translator
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

translator = Translator()

# Meta NLLB-200 Model
NLLB_MODEL_NAME = "facebook/nllb-200-distilled-1.3B"

# Optional IndicProcessor
try:
    from IndicTransToolkit.processor import IndicProcessor
    HAS_INDIC_PROCESSOR = True
except ImportError:
    HAS_INDIC_PROCESSOR = False

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

INDICTRANS_TO_GOOGLE = {
    "hin_Deva": "hi", "mar_Deva": "mr", "guj_Gujr": "gu", "ben_Beng": "bn",
    "pan_Guru": "pa", "asm_Beng": "as", "ory_Orya": "or", "npi_Deva": "ne",
    "kas_Arab": "ks", "kas_Deva": "ks", "gom_Deva": "gom", "mai_Deva": "mai",
    "snd_Arab": "sd", "snd_Deva": "sd", "san_Deva": "sa", "urd_Arab": "ur",
    "brx_Deva": "brx", "doi_Deva": "doi", "sat_Olck": "sat",
    "tam_Taml": "ta", "tel_Telu": "te", "kan_Knda": "kn", "mal_Mlym": "ml",
    "mni_Beng": "mni", "mni_Mtei": "mni",
    "eng_Latn": "en", "spa_Latn": "es", "fra_Latn": "fr", "ita_Latn": "it",
    "por_Latn": "pt", "deu_Latn": "de", "rus_Cyrl": "ru", "tur_Latn": "tr",
    "fas_Arab": "fa", "ind_Latn": "id", "jpn_Jpan": "ja", "kor_Hang": "ko",
    "zho_Hans": "zh-cn", "ara_Arab": "ar",
}

# Build inverse mapping for ISO->IndicTrans where known
GOOGLE_TO_INDICTRANS = {v: k for k, v in INDICTRANS_TO_GOOGLE.items()}

# Mapping from common language codes to NLLB flores codes
# NLLB uses ISO 639-3 codes in most cases
LANG_TO_NLLB = {
    "en": "eng_Latn", "hi": "hin_Deva", "mr": "mar_Deva", "gu": "guj_Gujr",
    "bn": "ben_Beng", "pa": "pan_Guru", "as": "asm_Beng", "or": "ory_Orya",
    "ne": "nep_Deva", "ta": "tam_Taml", "te": "tel_Telu", "kn": "kan_Knda",
    "ml": "mal_Mlym", "ur": "urd_Arab", "sa": "san_Deva", "ks": "kas_Arab",
    "sd": "snd_Arab", "brx": "brx_Deva", "doi": "doi_Deva", "sat": "sat_Olck",
    "gom": "gom_Deva", "mai": "mai_Deva", "mni": "mni_Beng",
    "es": "spa_Latn", "fr": "fra_Latn", "it": "ita_Latn", "pt": "por_Latn",
    "de": "deu_Latn", "ru": "rus_Cyrl", "tr": "tur_Latn", "fa": "pes_Arab",
    "id": "ind_Latn", "ja": "jpn_Jpan", "ko": "kor_Hang", "zh": "zho_Hans",
    "ar": "arb_Arab",
    # IndicTrans codes -> NLLB codes (direct pass-through if already in format)
    "hin_Deva": "hin_Deva", "mar_Deva": "mar_Deva", "guj_Gujr": "guj_Gujr",
    "ben_Beng": "ben_Beng", "pan_Guru": "pan_Guru", "asm_Beng": "asm_Beng",
    "ory_Orya": "ory_Orya", "npi_Deva": "nep_Deva", "kas_Arab": "kas_Arab",
    "kas_Deva": "kas_Arab", "gom_Deva": "gom_Deva", "mai_Deva": "mai_Deva",
    "snd_Arab": "snd_Arab", "snd_Deva": "snd_Arab", "san_Deva": "san_Deva",
    "urd_Arab": "urd_Arab", "brx_Deva": "brx_Deva", "doi_Deva": "doi_Deva",
    "sat_Olck": "sat_Olck", "tam_Taml": "tam_Taml", "tel_Telu": "tel_Telu",
    "kan_Knda": "kan_Knda", "mal_Mlym": "mal_Mlym", "mni_Beng": "mni_Beng",
    "mni_Mtei": "mni_Beng", "eng_Latn": "eng_Latn", "spa_Latn": "spa_Latn",
    "fra_Latn": "fra_Latn", "ita_Latn": "ita_Latn", "por_Latn": "por_Latn",
    "deu_Latn": "deu_Latn", "rus_Cyrl": "rus_Cyrl", "tur_Latn": "tur_Latn",
    "pes_Arab": "pes_Arab", "ind_Latn": "ind_Latn", "jpn_Jpan": "jpn_Jpan",
    "kor_Hang": "kor_Hang", "zho_Hans": "zho_Hans", "arb_Arab": "arb_Arab",
}

def normalize_code_for_google(code: str) -> str:
    if not code:
        return "en"
    if code in INDICTRANS_TO_GOOGLE:
        return INDICTRANS_TO_GOOGLE[code]
    return code.split("_")[0]


def normalize_code_for_indictrans(code: str) -> str:
    """Convert ISO codes like 'en','hi' to IndicTrans tags like 'eng_Latn','hin_Deva'."""
    if not code:
        return "eng_Latn"
    if "_" in code:
        return code  # already IndicTrans-style
    # Prefer explicit mapping
    if code in GOOGLE_TO_INDICTRANS:
        return GOOGLE_TO_INDICTRANS[code]
    # Common fallbacks
    fallback = {
        "en": "eng_Latn",
        "hi": "hin_Deva",
        "bn": "ben_Beng",
        "ta": "tam_Taml",
        "te": "tel_Telu",
        "mr": "mar_Deva",
        "gu": "guj_Gujr",
        "kn": "kan_Knda",
        "ml": "mal_Mlym",
        "pa": "pan_Guru",
        "or": "ory_Orya",
        "ne": "npi_Deva",
        "ur": "urd_Arab",
    }
    return fallback.get(code, "eng_Latn")


def _split_into_sentences(text: str) -> List[str]:
    """Split text into sentences for batch processing."""
    text = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r'(?<=[\.\?\!।])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def _group_sentences(sentences: List[str], char_limit: int = 2000) -> List[str]:
    """Group sentences into chunks that respect character limits."""
    chunks, cur, cur_len = [], [], 0
    for s in sentences:
        if cur_len + len(s) + 1 <= char_limit:
            cur.append(s)
            cur_len += len(s) + 1
        else:
            if cur:
                chunks.append(" ".join(cur))
            cur, cur_len = [s], len(s)
    if cur:
        chunks.append(" ".join(cur))
    return chunks

def split_into_sentences(text: str) -> List[str]:
    """Legacy function for backward compatibility."""
    return _split_into_sentences(text)

def normalize_code_for_nllb(code: str) -> str:
    """Convert language codes to NLLB flores codes."""
    if not code:
        return "eng_Latn"
    if code in LANG_TO_NLLB:
        return LANG_TO_NLLB[code]
    # Fallback: try to extract base code
    base_code = code.split("_")[0] if "_" in code else code
    if base_code in LANG_TO_NLLB:
        return LANG_TO_NLLB[base_code]
    # Default fallback
    return "eng_Latn"


def translate_google(texts: List[str], src_lang: str, tgt_lang: str) -> List[str]:
    src = normalize_code_for_google(src_lang)
    tgt = normalize_code_for_google(tgt_lang)
    outputs: List[str] = []
    for t in texts:
        try:
            res = translator.translate(t, src=src, dest=tgt)
            outputs.append(res.text)
        except Exception:
            outputs.append(t)
    return outputs

# Cache for NLLB model and tokenizer to avoid reloading
_nllb_tokenizer = None
_nllb_model = None

# Cache for IndicTrans models (avoid reloading on every request)
_indic_tokenizers = {}
_indic_models = {}

def _load_nllb_model():
    """Lazy load NLLB model and tokenizer."""
    global _nllb_tokenizer, _nllb_model
    if _nllb_tokenizer is None or _nllb_model is None:
        _nllb_tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL_NAME, trust_remote_code=True)
        _nllb_model = AutoModelForSeq2SeqLM.from_pretrained(
            NLLB_MODEL_NAME,
            trust_remote_code=True,
            torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
        ).to(DEVICE)
    return _nllb_tokenizer, _nllb_model

def _get_forced_bos_token_id(tokenizer, tgt_flores_code):
    """Robust method to get forced BOS token ID for NLLB target language."""
    # Try multiple methods to find the token ID
    try:
        lang_map = getattr(tokenizer, "lang_code_to_id", None)
        if lang_map and tgt_flores_code in lang_map:
            return lang_map[tgt_flores_code]
    except Exception:
        pass
    
    # Try with 3-letter ISO code if flores format (e.g., "hin_Deva" -> "hin")
    try:
        iso_code = tgt_flores_code.split("_")[0] if "_" in tgt_flores_code else tgt_flores_code
        lang_map = getattr(tokenizer, "lang_code_to_id", None)
        if lang_map and iso_code in lang_map:
            return lang_map[iso_code]
    except Exception:
        pass
    
    # Try convert_tokens_to_ids
    try:
        tok_id = tokenizer.convert_tokens_to_ids(tgt_flores_code)
        unk_id = getattr(tokenizer, "unk_token_id", None)
        if tok_id is not None and (unk_id is None or tok_id != unk_id):
            return tok_id
    except Exception:
        pass
    
    # Try with ISO code
    try:
        iso_code = tgt_flores_code.split("_")[0] if "_" in tgt_flores_code else tgt_flores_code
        tok_id = tokenizer.convert_tokens_to_ids(iso_code)
        unk_id = getattr(tokenizer, "unk_token_id", None)
        if tok_id is not None and (unk_id is None or tok_id != unk_id):
            return tok_id
    except Exception:
        pass
    
    # Try vocab lookup
    try:
        vocab = tokenizer.get_vocab()
        if tgt_flores_code in vocab:
            return vocab[tgt_flores_code]
    except Exception:
        pass
    
    # Try with ISO code in vocab
    try:
        iso_code = tgt_flores_code.split("_")[0] if "_" in tgt_flores_code else tgt_flores_code
        vocab = tokenizer.get_vocab()
        if iso_code in vocab:
            return vocab[iso_code]
    except Exception:
        pass
    
    raise ValueError(f"Could not map target FLORES code '{tgt_flores_code}' to a token id.")

def translate_nllb(texts: List[str], src_lang: str, tgt_lang: str) -> List[str]:
    """Translate using Meta NLLB-200 model."""
    src_flores = normalize_code_for_nllb(src_lang)
    tgt_flores = normalize_code_for_nllb(tgt_lang)
    
    try:
        tokenizer, model = _load_nllb_model()
        
        # Set source language for tokenizer (try flores format first, then ISO code)
        if hasattr(tokenizer, 'src_lang'):
            try:
                tokenizer.src_lang = src_flores
            except Exception:
                # Fallback to ISO code if flores format doesn't work
                iso_src = src_flores.split("_")[0] if "_" in src_flores else src_flores
                tokenizer.src_lang = iso_src
        
        # Get target language token ID using robust method
        forced_bos_token_id = _get_forced_bos_token_id(tokenizer, tgt_flores)
        
        translations = []
        for text in texts:
            inputs = tokenizer(text, return_tensors="pt", truncation=True, padding="longest")
            inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
            
            with torch.no_grad():
                generated_tokens = model.generate(
                    **inputs,
                    forced_bos_token_id=forced_bos_token_id,
                    max_new_tokens=1024,
                    no_repeat_ngram_size=3,
                    repetition_penalty=2.0,
                    early_stopping=True,
                    num_beams=4,
                    use_cache=False,
                )
            translated = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
            translations.append(translated)
        
        return translations
    except Exception as e:
        print(f"⚠️ NLLB translation error: {e}")
        raise


MODEL_MAP = {
    ("eng_Latn", "indic"): "ai4bharat/indictrans2-en-indic-1B",
    ("indic", "eng_Latn"): "ai4bharat/indictrans2-indic-en-1B",
    ("indic", "indic"): "ai4bharat/indictrans2-indic-indic-1B",
}

def detect_model(src_lang: str, tgt_lang: str) -> str:
    if src_lang == "eng_Latn" and tgt_lang != "eng_Latn":
        return MODEL_MAP[("eng_Latn", "indic")]
    elif src_lang != "eng_Latn" and tgt_lang == "eng_Latn":
        return MODEL_MAP[("indic", "eng_Latn")]
    else:
        return MODEL_MAP[("indic", "indic")]


def translate_indictrans(texts: List[str], src_lang: str, tgt_lang: str) -> List[str]:
    # Normalize to IndicTrans tags
    src_lang = normalize_code_for_indictrans(src_lang)
    tgt_lang = normalize_code_for_indictrans(tgt_lang)
    model_name = detect_model(src_lang, tgt_lang)
    # Lazy-load and cache the tokenizer/model for this model_name
    global _indic_tokenizers, _indic_models
    if model_name not in _indic_tokenizers or model_name not in _indic_models:
        try:
            _indic_tokenizers[model_name] = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
            _indic_models[model_name] = AutoModelForSeq2SeqLM.from_pretrained(
                model_name,
                trust_remote_code=True,
                torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
            ).to(DEVICE)
        except Exception as e:
            print(f"⚠️ Failed to load IndicTrans model {model_name}: {e}")
            raise

    tokenizer = _indic_tokenizers[model_name]
    model = _indic_models[model_name]

    try:
        if HAS_INDIC_PROCESSOR:
            ip = IndicProcessor(inference=True)
            batch = ip.preprocess_batch(texts, src_lang=src_lang, tgt_lang=tgt_lang)
            inputs = tokenizer(batch, truncation=True, padding="longest", return_tensors="pt", return_attention_mask=True).to(DEVICE)
            with torch.no_grad():
                # Use slightly faster generation defaults to reduce latency
                outputs = model.generate(**inputs, use_cache=True, min_length=0, max_length=512, num_beams=3, num_return_sequences=1)
            decoded = tokenizer.batch_decode(outputs, skip_special_tokens=True, clean_up_tokenization_spaces=True)
            translations = ip.postprocess_batch(decoded, lang=tgt_lang)
        else:
            tagged = [f"<{src_lang}><{tgt_lang}> {s}" for s in texts]
            inputs = tokenizer(tagged, truncation=True, padding=True, return_tensors="pt").to(DEVICE)
            with torch.no_grad():
                outputs = model.generate(**inputs, max_length=512, num_beams=3, use_cache=True)
            translations = tokenizer.batch_decode(outputs, skip_special_tokens=True, clean_up_tokenization_spaces=True)
    except Exception as e:
        print(f"⚠️ IndicTrans generation error for model {model_name}: {e}")
        raise
    return translations


def translate_text(text: str, src_lang: str, tgt_lang: str, mt_model_choice: str = "auto") -> str:
    """Translate text using specified model with automatic chunking for long texts."""
    sentences = _split_into_sentences(text)
    chunks = _group_sentences(sentences, char_limit=1800)
    
    outputs = []
    for chunk in chunks:
        try:
            if mt_model_choice == "google":
                chunk_sentences = _split_into_sentences(chunk)
                out_list = translate_google(chunk_sentences, src_lang, tgt_lang)
                out = " ".join(out_list)
            elif mt_model_choice == "indictrans":
                chunk_sentences = _split_into_sentences(chunk)
                out_list = translate_indictrans(chunk_sentences, src_lang, tgt_lang)
                out = " ".join(out_list)
            elif mt_model_choice == "nllb":
                chunk_sentences = _split_into_sentences(chunk)
                out_list = translate_nllb(chunk_sentences, src_lang, tgt_lang)
                out = " ".join(out_list)
            else:  # auto - default to indictrans
                chunk_sentences = _split_into_sentences(chunk)
                out_list = translate_indictrans(chunk_sentences, src_lang, tgt_lang)
                out = " ".join(out_list)
            outputs.append(out)
        except Exception as e:
            print(f"⚠️ Batch translation error on chunk: {e}")
            outputs.append("[translation_error]")
    return " ".join(outputs).strip()

def translate_with_fallback(text: str, src_lang: str, tgt_lang: str, primary: str = "indictrans"):
    """Translate with automatic fallback if primary model fails."""
    try:
        print(f"\n🔁 MT request: primary={primary} src={src_lang} tgt={tgt_lang}")
        if primary == "google":
            translated = translate_text(text, src_lang, tgt_lang, mt_model_choice="google")
        elif primary == "nllb":
            translated = translate_text(text, src_lang, tgt_lang, mt_model_choice="nllb")
        else:  # indictrans or default
            translated = translate_text(text, src_lang, tgt_lang, mt_model_choice="indictrans")
        return translated, primary
    except Exception as e:
        print(f"⚠️ Primary MT ({primary}) failed: {e}, falling back to google")
        # For NLLB, fallback to Google. For others, fallback to Google too.
        try:
            fb_out = translate_text(text, src_lang, tgt_lang, mt_model_choice="google")
            return fb_out, "google"
        except Exception as e2:
            print(f"⚠️ Fallback Google also failed: {e2}")
            # Last resort: try indictrans if primary wasn't indictrans
            if primary != "indictrans":
                try:
                    fb_out = translate_text(text, src_lang, tgt_lang, mt_model_choice="indictrans")
                    return fb_out, "indictrans"
                except Exception as e3:
                    print(f"⚠️ All translation methods failed: {e3}")
                    raise
            raise


