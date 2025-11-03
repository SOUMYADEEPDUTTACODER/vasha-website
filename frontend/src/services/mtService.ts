const API_BASE_URL = 'http://localhost:8000';

export interface MTResponse {
  success: boolean;
  text: string;
  translation: string;
  src_lang: string;
  tgt_lang: string;
  model_used: 'google' | 'indictrans' | 'nllb';
}

class MTService {
  async translate(
    text: string,
    srcLang: string,
    tgtLang: string,
    model: 'google' | 'indictrans' | 'nllb'
  ): Promise<MTResponse> {
    const res = await fetch(`${API_BASE_URL}/mt/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, src_lang: srcLang, tgt_lang: tgtLang, model })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `HTTP ${res.status}`);
    }
    return res.json();
  }
}

export const mtService = new MTService();


