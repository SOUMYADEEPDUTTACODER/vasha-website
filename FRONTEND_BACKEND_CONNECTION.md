# Frontend-Backend Connection Guide

This guide explains how to connect and test the frontend with the ASR backend.

## 🚀 Quick Start

### 1. Start Backend Server

Open **Terminal 1** and run:

```bash
cd "C:\Users\SOEE\Desktop\vahsa web - Copy\vashafront\backend"

# Install dependencies (if not done)
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Start Frontend Server

Open **Terminal 2** and run:

```bash
cd "C:\Users\SOEE\Desktop\vahsa web - Copy\vashafront\frontend"

# Install dependencies (if not done)
npm install

# Start the frontend server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3. Test the Connection

1. **Open your browser** and go to `http://localhost:5173`
2. **Check the console** (F12) for any errors
3. **Look for the backend status** - you should see either:
   - ✅ No error messages (backend connected)
   - ❌ Red alert saying "Backend server is not available"

## 🔧 Features Available

### ASR Input Types

1. **🎤 Microphone Recording**
   - Click the microphone button
   - Speak for up to 60 seconds
   - Click stop to finish recording

2. **📁 File Upload**
   - Click the file upload button
   - Select audio/video files (.wav, .mp3, .mp4, .mkv, .mov, .avi)
   - Files up to 50MB supported

3. **🔗 YouTube URL**
   - Click the link button
   - Enter a YouTube URL
   - The system will download and process the audio

### Automatic Language Detection & Model Selection

1. **🔍 Automatic Language Detection**
   - **No manual selection needed!** The system automatically detects the language
   - Uses Whisper's LID (Language Identification) model
   - Supports 22+ languages including Indic and global languages
   - Shows detected language in the UI after processing

2. **🤖 Model Selection**
   - **Whisper**: OpenAI's model with different sizes
   - **Faster Whisper**: Optimized Whisper implementation
   - **AI4Bharat**: Specialized for Indic languages (with fallback to Whisper)

3. **⚙️ Model Configuration**
   - **Whisper Size**: tiny, base, small, medium, large
   - **Decoding Strategy**: CTC or RNN-T (for AI4Bharat)

## 🧪 Testing the ASR Functionality

### Test 1: Basic Connection
1. Open browser console (F12)
2. Run: `testBackendConnection()`
3. Should see all tests passing

### Test 2: File Upload
1. Record a short audio or prepare an audio file
2. Select a model (e.g., Whisper)
3. Upload the file
4. Click Send
5. Should see language detection and transcription in the chat

### Test 3: YouTube Processing
1. Click the link button
2. Enter a YouTube URL (e.g., a short video)
3. Select model
4. Click Send
5. Should detect language and process the YouTube audio

### Test 4: Microphone Recording
1. Click the microphone button
2. Allow microphone access
3. Speak for a few seconds
4. Click stop
5. Select model
6. Click Send
7. Should detect language and transcribe your speech

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process using port 8000
taskkill /PID <PID_NUMBER> /F

# Try starting again
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Problem**: Import errors
```bash
# Install missing dependencies
pip install -r requirements.txt

# Install ASR dependencies one by one
pip install torch torchaudio
pip install whisper faster-whisper
pip install transformers spacy
pip install jiwer scipy sounddevice yt-dlp
```

**Problem**: spaCy model not found
```bash
python -m spacy download en_core_web_lg
```

### Frontend Issues

**Problem**: Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Problem**: CORS errors
- Make sure backend is running on port 8000
- Check that backend CORS is configured for localhost:5173

**Problem**: ASR not working
- Check browser console for errors
- Verify backend is running and accessible
- Test backend directly: `curl http://localhost:8000/languages`

## 📊 Expected Behavior

### Successful Connection
- ✅ No red alert in the UI
- ✅ Console shows "Backend health: Available"
- ✅ Language and model selectors load
- ✅ ASR processing works for all input types

### Failed Connection
- ❌ Red alert: "Backend server is not available"
- ❌ Console shows connection errors
- ❌ ASR features disabled
- ❌ Toast notifications about backend issues

## 🔍 API Endpoints Used

The frontend connects to these backend endpoints:

- `GET /languages` - Get supported languages
- `GET /asr/models` - Get available ASR models
- `POST /asr/upload` - Process uploaded files
- `POST /asr/youtube` - Process YouTube URLs
- `POST /asr/microphone` - Process microphone recordings

## 📝 Development Notes

### File Structure
```
frontend/src/
├── services/
│   └── asrService.ts          # Backend API service
├── components/chat/
│   ├── ModelSelector.tsx      # Model selection component
│   ├── LanguageSelector.tsx   # Language selection component
│   ├── FileUpload.tsx         # File upload component
│   ├── AudioRecorder.tsx      # Microphone recording component
│   └── LinkInput.tsx          # YouTube URL input component
└── pages/
    └── Chat.tsx               # Main chat page with ASR integration
```

### Key Features
- **Automatic Backend Detection**: Checks if backend is available on startup
- **Error Handling**: Graceful fallback when backend is unavailable
- **Real-time Processing**: Shows processing status during ASR
- **Model Fallback**: AI4Bharat automatically falls back to Whisper on failure
- **Multiple Input Types**: Supports file upload, microphone, and YouTube URLs

## 🎯 Next Steps

1. **Test all input types** with different languages and models
2. **Verify fallback mechanism** by testing AI4Bharat with unsupported content
3. **Test with different file formats** and sizes
4. **Monitor performance** with different model sizes
5. **Check error handling** by stopping the backend during processing

The frontend is now fully connected to the ASR backend and ready for testing!
