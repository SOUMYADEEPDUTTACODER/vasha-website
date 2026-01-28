import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class FFmpegService {
    private ffmpeg: FFmpeg | null = null;
    private isLoading = false;

    async load() {
        if (this.ffmpeg) return this.ffmpeg;
        if (this.isLoading) {
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.ffmpeg;
        }

        this.isLoading = true;
        const ffmpeg = new FFmpeg();

        // In Vite, we often need to point to the WASM files explicitly if they are not picked up
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        this.ffmpeg = ffmpeg;
        this.isLoading = false;
        return ffmpeg;
    }

    async convertToWav(file: File | Blob, onProgress?: (progress: number) => void): Promise<Blob> {
        const ffmpeg = await this.load();
        if (!ffmpeg) throw new Error('FFmpeg failed to load');

        const inputName = 'input.media';
        const outputName = 'output.wav';

        if (onProgress) {
            ffmpeg.on('progress', ({ progress }) => {
                onProgress(Math.round(progress * 100));
            });
        }

        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // Convert to WAV 16kHz Mono (Whisper requirement)
        await ffmpeg.exec([
            '-i', inputName,
            '-ar', '16000',
            '-ac', '1',
            outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        // @ts-ignore - data can be Uint8Array or string
        return new Blob([data], { type: 'audio/wav' });
    }
}

export const ffmpegService = new FFmpegService();
