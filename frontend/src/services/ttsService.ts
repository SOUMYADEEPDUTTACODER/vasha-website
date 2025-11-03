const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface TTSResponse {
  success: boolean;
  audio_path: string;
  message: string;
  model_used: string;
}

class TTSService {
  async generateSpeech(
    text: string,
    langCode: string,
    model: 'xtts' | 'gtts' | 'indic' | 'auto' = 'auto'
  ): Promise<TTSResponse> {
    const res = await fetch(`${API_BASE_URL}/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang_code: langCode, model })
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `HTTP ${res.status}`);
    }
    
    return res.json();
  }

  getAudioUrl(audioPath: string): string {
    // Extract filename from path (handle both Windows \ and Unix / separators)
    const filename = audioPath.split(/[/\\]/).pop() || audioPath;
    return `${API_BASE_URL}/tts/audio/${filename}`;
  }
}

export const ttsService = new TTSService();

