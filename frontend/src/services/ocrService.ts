import { API_BASE_URL } from '@/config/api';

export const ocrService = {
    async extractText(imageFile: File): Promise<{ text: string }> {
        const formData = new FormData();
        formData.append('image', imageFile);

        const res = await fetch(`${API_BASE_URL}/ocr`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || `OCR failed: ${res.status}`);
        }
        return res.json();
    }
};
