# Eraser.io Prompt for Vasha AI Backend & Model Pipeline Flowchart

## Prompt for Eraser.io

Create a simple, colorful flowchart diagram showing the Vasha AI backend and model pipeline. The diagram should be easy to understand for non-technical audiences.

### Design Requirements:
- **Background**: White background
- **Style**: Modern, clean, minimalist design
- **Colors**: Use vibrant, distinct colors for each stage
- **Arrows**: Use thick, colorful arrows (3-4px thickness) connecting stages
- **Text**: Bold, clear labels (14-16px font size)
- **Icons**: Use simple emoji icons where appropriate

### Flow Stages (Left to Right):

1. **Input Stage** (Red/Pink #FF6B6B)
   - Box: "🎤 Audio Input"
   - Subtitle: "Microphone/File/YouTube"
   - Shape: Rounded rectangle

2. **Backend API** (Blue #4A90E2)
   - Box: "Backend API"
   - Subtitle: "FastAPI Server"
   - Shape: Rounded rectangle

3. **Audio Processing** (Orange #FFB84D)
   - Box: "Audio Processing"
   - Subtitle: "Convert to WAV Format"
   - Shape: Rounded rectangle

4. **Language Detection** (Turquoise #4ECDC4)
   - Box: "Language Detection"
   - Subtitle: "Identify Spoken Language"
   - Shape: Rounded rectangle
   - Side note: "Detects Language: Hindi, English, Tamil, Bengali, Telugu, etc. (200+ languages)"

5. **Speech Recognition** (Pink #FF6B9D)
   - Box: "Speech Recognition"
   - Subtitle: "Convert Speech to Text"
   - Shape: Rounded rectangle
   - Side note: "Models: Whisper (OpenAI), AI4Bharat (Indic), Automatic selection"

6. **Machine Translation** (Light Green #95E1D3)
   - Box: "Machine Translation"
   - Subtitle: "Translate Text"
   - Shape: Rounded rectangle
   - Side note: "Models: IndicTrans2 (Indic), Meta NLLB-200 (Global), Google Translate (Fallback)"

7. **Text-to-Speech** (Coral #F38181)
   - Box: "Text-to-Speech"
   - Subtitle: "Convert Text to Audio"
   - Shape: Rounded rectangle
   - Side note: "Models: Coqui XTTS (Voice Cloning), Indic Parler-TTS, Google TTS (Fallback)"

8. **Output Stage** (Green #6BCB77)
   - Box: "📝 Translated Text 🔊 Translated Audio"
   - Shape: Rounded rectangle

### Flow Connections:
- Connect stages 1→2→3→4→5→6→7→8 with thick colored arrows
- Each arrow should match the color of the source stage
- Arrow thickness: 3-4px
- Use smooth, curved arrows for better visual flow

### Layout:
- Horizontal flow from left to right
- Equal spacing between boxes (approximately 40-50px)
- Center-aligned vertically
- Side notes should be positioned to the right of their respective boxes

### Color Legend:
Add a legend at the bottom right showing:
- Input (Red)
- Backend API (Blue)
- Audio Processing (Orange)
- Language Detection (Turquoise)
- Speech Recognition (Pink)
- Translation (Light Green)
- Speech Generation (Coral)
- Output (Green)

### Additional Notes:
- Keep text minimal and clear
- Use rounded corners (20px radius) for all boxes
- Add subtle shadows for depth
- Ensure high contrast for readability
- Make it suitable for presentations and documentation
