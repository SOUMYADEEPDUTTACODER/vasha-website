# tts_gtts.py
import os
from gtts import gTTS
from pydub import AudioSegment

def chunk_text(text, max_chars=2500):
    """
    Splits text into safe chunks for gTTS.
    Tries to split on sentence boundaries before hitting max_chars.
    """
    chunks, current = [], []
    current_len = 0

    sentences = text.split(". ")  # naive sentence-based split
    for sentence in sentences:
        if current_len + len(sentence) + 2 <= max_chars:
            current.append(sentence)
            current_len += len(sentence) + 2
        else:
            chunks.append(". ".join(current) + ".")
            current = [sentence]
            current_len = len(sentence)
    if current:
        chunks.append(". ".join(current) + ".")

    return chunks


def run_gtts(text, lang="en", out_dir="tts_output", out_name="gtts_out.mp3"):
    """
    Run Google TTS with safe chunking.
    Combines multiple audio segments if input is long.
    """
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, out_name)

    chunks = chunk_text(text)
    print(f"🌐 gTTS: splitting into {len(chunks)} chunks (lang={lang})")

    combined = AudioSegment.silent(duration=500)  # small pause at start

    for i, chunk in enumerate(chunks, 1):
        print(f"  🎙️ Synthesizing chunk {i}/{len(chunks)} ({len(chunk)} chars)...")
        try:
            tts = gTTS(chunk, lang=lang)
            temp_path = os.path.join(out_dir, f"_tmp_chunk_{i}.mp3")
            tts.save(temp_path)
            segment = AudioSegment.from_file(temp_path, format="mp3")
            combined += segment + AudioSegment.silent(duration=250)  # small gap
            os.remove(temp_path)
        except Exception as e:
            print(f"❌ gTTS failed on chunk {i}: {e}")

    combined.export(out_path, format="mp3")
    print(f"✅ gTTS final audio saved to {out_path}")
    return out_path


if __name__ == "__main__":
    sample_text = "This is a long demo text. " * 500
    run_gtts(sample_text, lang="en", out_name="demo_long.mp3")

