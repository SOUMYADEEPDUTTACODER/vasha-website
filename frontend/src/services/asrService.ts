// ASR Service for connecting frontend to backend
const API_BASE_URL = 'http://localhost:8000';

export interface ASRResponse {
  success: boolean;
  transcription: string;
  language: string;
  language_name: string;
  model_used: string;
  message: string;
  error?: string;
}

export interface Language {
  [key: string]: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  supports_fallback: boolean;
  fallback_to?: string;
}

export interface ModelsResponse {
  models: Model[];
  message: string;
}

export interface LanguagesResponse {
  languages: Language;
  message: string;
}

class ASRService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`ASR API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async getLanguages(): Promise<LanguagesResponse> {
    return this.makeRequest<LanguagesResponse>('/languages');
  }

  async getModels(): Promise<ModelsResponse> {
    return this.makeRequest<ModelsResponse>('/asr/models');
  }

  async processFileUpload(
    file: File,
    model: string = 'whisper',
    whisperSize: string = 'base',
    decoding: string = 'ctc'
  ): Promise<ASRResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);
    formData.append('whisper_size', whisperSize);
    formData.append('decoding', decoding);

    return this.makeRequest<ASRResponse>('/asr/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async processYouTubeAudio(
    youtubeUrl: string,
    model: string = 'whisper',
    whisperSize: string = 'base',
    decoding: string = 'ctc'
  ): Promise<ASRResponse> {
    const formData = new FormData();
    formData.append('youtube_url', youtubeUrl);
    formData.append('model', model);
    formData.append('whisper_size', whisperSize);
    formData.append('decoding', decoding);

    return this.makeRequest<ASRResponse>('/asr/youtube', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async processMicrophoneAudio(
    audioBlob: Blob,
    model: string = 'whisper',
    whisperSize: string = 'base',
    decoding: string = 'ctc',
    duration: number = 5
  ): Promise<ASRResponse> {
    // Convert blob to file for upload
    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    
    return this.processFileUpload(audioFile, model, whisperSize, decoding);
  }

  // Helper method to check if backend is available
  async checkBackendHealth(): Promise<boolean> {
    try {
      await this.getLanguages();
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

export const asrService = new ASRService();
