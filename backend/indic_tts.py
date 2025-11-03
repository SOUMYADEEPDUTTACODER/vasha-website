import torch
import soundfile as sf
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import os

# Supported Indian Languages Auto Detected
INDIC_LANGS = {
    "as", "bn", "brx", "doi", "en", "gu", "hi", "kn", "kok", "mai", "ml",
    "mni", "mr", "ne", "or", "sa", "sat", "sd", "ta", "te", "ur"
}

def run_indic_tts(text, description=None, out_dir="tts_output", out_name="indic_tts.wav"):
    """
    Use Indic Parler-TTS (HuggingFace, AI4Bharat)
    description: e.g. "Divya's voice is monotone yet slightly fast with no background noise."
    """
    os.makedirs(out_dir, exist_ok=True)
    device = "cuda" if torch.cuda.is_available() else "cpu"

    print("🎙️ Loading Indic Parler-TTS...")
    model = ParlerTTSForConditionalGeneration.from_pretrained("ai4bharat/indic-parler-tts").to(device)
    tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indic-parler-tts")
    description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)

    if description is None:
        description = "A neutral Indian speaker with moderate pitch and speed, clear and high-quality voice."

    # Tokenize
    description_ids = description_tokenizer(description, return_tensors="pt").to(device)
    prompt_ids = tokenizer(text, return_tensors="pt").to(device)

    # Generate
    print("🔊 Generating speech...")
    generation = model.generate(
        input_ids=description_ids.input_ids,
        attention_mask=description_ids.attention_mask,
        prompt_input_ids=prompt_ids.input_ids,
        prompt_attention_mask=prompt_ids.attention_mask
    )

    audio_arr = generation.cpu().numpy().squeeze()
    out_path = os.path.join(out_dir, out_name)
    sf.write(out_path, audio_arr, model.config.sampling_rate)

    print(f"✅ Indic-TTS saved to {out_path}")
    return out_path

