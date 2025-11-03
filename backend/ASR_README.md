# ASR (Automatic Speech Recognition) Backend

This backend provides ASR functionality with support for multiple input types and models, including automatic fallback from AI4Bharat to Whisper when needed.

## Features

- **Multiple Input Types**: File upload, YouTube URLs, and live microphone recording
- **Multiple ASR Models**: Whisper, Faster-Whisper, and AI4Bharat Indic Conformer
- **Language Support**: 22+ languages including Indic and global languages
- **Automatic Fallback**: AI4Bharat automatically falls back to Whisper on failure
- **Language Detection**: Automatic language identification using Whisper
- **Chunked Processing**: Long audio files are processed in chunks for better performance

## Setup

### 1. Install Dependencies

Run the setup script to install all required dependencies:

```bash
python setup_asr.py
```

Or install manually:

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_lg
```

### 2. Install FFmpeg

FFmpeg is required for video processing:

- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt install ffmpeg`

### 3. Start the Server

```bash
uvicorn main:app --reload
```

## API Endpoints

### 1. Get Supported Languages

```http
GET /languages
```

Returns a list of all supported languages for ASR.

### 2. Get Available Models

```http
GET /asr/models
```

Returns information about available ASR models.

### 3. File Upload ASR

```http
POST /asr/upload
```

Process audio files for ASR.

**Parameters:**
- `file`: Audio file (multipart/form-data)
- `language`: Language code (e.g., 'en', 'hi', 'bn')
- `model`: ASR model ('whisper', 'faster_whisper', 'ai4bharat')
- `whisper_size`: Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
- `decoding`: Decoding strategy for AI4Bharat ('ctc', 'rnnt')

**Supported file formats:**
- Audio: `.wav`, `.mp3`
- Video: `.mp4`, `.mkv`, `.mov`, `.avi`

### 4. YouTube ASR

```http
POST /asr/youtube
```

Process YouTube videos for ASR.

**Parameters:**
- `youtube_url`: YouTube video URL
- `language`: Language code
- `model`: ASR model
- `whisper_size`: Whisper model size
- `decoding`: Decoding strategy

### 5. Microphone ASR

```http
POST /asr/microphone
```

Process live microphone audio for ASR.

**Parameters:**
- `duration`: Recording duration in seconds (1-60)
- `language`: Language code
- `model`: ASR model
- `whisper_size`: Whisper model size
- `decoding`: Decoding strategy

## Response Format

All ASR endpoints return a JSON response with the following structure:

```json
{
  "success": true,
  "transcription": "The transcribed text...",
  "language": "en",
  "language_name": "English",
  "model_used": "whisper",
  "message": "Audio processed successfully"
}
```

## Supported Languages

The system supports 22+ languages including:

### Indic Languages
- Hindi (hi), Bengali (bn), Tamil (ta), Telugu (te)
- Gujarati (gu), Marathi (mr), Punjabi (pa), Malayalam (ml)
- Kannada (kn), Odia (or), Assamese (as), Nepali (npi)
- And more...

### Global Languages
- English (en), Spanish (es), French (fr), German (de)
- Italian (it), Portuguese (pt), Russian (ru), Chinese (zh)
- Japanese (ja), Korean (ko), Arabic (ar), Persian (fa)
- Turkish (tr), Indonesian (id)

## ASR Models

### 1. Whisper
- **Description**: OpenAI's Whisper model
- **Strengths**: High accuracy, good multilingual support
- **Fallback**: No (primary model)

### 2. Faster-Whisper
- **Description**: Optimized Whisper implementation
- **Strengths**: Faster processing, lower memory usage
- **Fallback**: No (primary model)

### 3. AI4Bharat Indic Conformer
- **Description**: Specialized for Indic languages
- **Strengths**: Excellent performance on Indic languages
- **Fallback**: Yes (falls back to Whisper on failure)

## Fallback Mechanism

When using AI4Bharat model:
1. System attempts to process with AI4Bharat
2. If AI4Bharat fails, automatically falls back to Whisper
3. Response indicates which model was actually used

## Testing

Run the test script to verify functionality:

```bash
python test_asr_api.py
```

## Usage Examples

### Python Client Example

```python
import requests

# File upload
with open('audio.wav', 'rb') as f:
    files = {'file': f}
    data = {
        'language': 'en',
        'model': 'whisper',
        'whisper_size': 'base'
    }
    response = requests.post('http://localhost:8000/asr/upload', files=files, data=data)
    result = response.json()
    print(result['transcription'])

# YouTube processing
data = {
    'youtube_url': 'https://www.youtube.com/watch?v=example',
    'language': 'hi',
    'model': 'ai4bharat'
}
response = requests.post('http://localhost:8000/asr/youtube', data=data)
result = response.json()
print(result['transcription'])
```

### cURL Examples

```bash
# File upload
curl -X POST "http://localhost:8000/asr/upload" \
  -F "file=@audio.wav" \
  -F "language=en" \
  -F "model=whisper"

# YouTube processing
curl -X POST "http://localhost:8000/asr/youtube" \
  -F "youtube_url=https://www.youtube.com/watch?v=example" \
  -F "language=hi" \
  -F "model=ai4bharat"
```

## Performance Notes

- **Chunking**: Long audio files are automatically split into 30-second chunks
- **Parallel Processing**: Chunks are processed in parallel for better performance
- **Memory Usage**: AI4Bharat model is loaded lazily to save memory
- **GPU Support**: Automatically uses CUDA if available

## Troubleshooting

### Common Issues

1. **spaCy model not found**
   ```bash
   python -m spacy download en_core_web_lg
   ```

2. **FFmpeg not found**
   - Install FFmpeg and ensure it's in PATH

3. **CUDA out of memory**
   - Use smaller model sizes (e.g., 'base' instead of 'large')
   - Reduce chunk size in the code

4. **AI4Bharat model download fails**
   - Check internet connection
   - Ensure sufficient disk space

### Logs

Check server logs for detailed error messages and processing information.

## Development

### Adding New Languages

1. Add language code to `TARGET_LANGS` in `lid.py`
2. Add mapping to `LID2INDICTRANS` in `asr_pipeline.py` if needed
3. Test with sample audio in the new language

### Adding New Models

1. Implement transcription function in `asr_pipeline.py`
2. Add model to `run_asr_with_fallback` function
3. Update API endpoints to include new model
4. Add model information to `/asr/models` endpoint

## License

This ASR backend is part of the Vasha AI project.
