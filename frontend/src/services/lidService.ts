import { API_BASE_URL } from '@/config/api';

export interface LIDResponse {
    success: boolean;
    detected_languages: Array<{ language: string; confidence: number }>;
    top_language: string;
    language_name: string;
    error?: string;
}

class LIDService {
    async detectTextLanguage(text: string): Promise<LIDResponse> {
        const res = await fetch(`${API_BASE_URL}/lid/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || `HTTP ${res.status}`);
        }
        return res.json();
    }
}

export const lidService = new LIDService();
