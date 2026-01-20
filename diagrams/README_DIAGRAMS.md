# Vasha AI Pipeline Flowcharts

This directory contains PlantUML flowcharts that visualize the complete Vasha AI system architecture and data flow.

## Files

- **`vasha_pipeline_flowchart.puml`** - Complete end-to-end pipeline flowchart showing frontend, backend, ASR, MT, TTS, and authentication flows

## How to View/Edit

### Option 1: Online PlantUML Editor
1. Go to [http://www.plantuml.com/plantuml/uml/](http://www.plantuml.com/plantuml/uml/)
2. Copy the contents of `vasha_pipeline_flowchart.puml`
3. Paste into the editor
4. The diagram will render automatically

### Option 2: VS Code Extension
1. Install the "PlantUML" extension in VS Code
2. Open the `.puml` file
3. Press `Alt+D` (or `Cmd+D` on Mac) to preview
4. Or right-click and select "Preview PlantUML Diagram"

### Option 3: Command Line
```bash
# Install PlantUML (requires Java)
# On macOS: brew install plantuml
# On Ubuntu: sudo apt-get install plantuml

# Generate PNG
plantuml -tpng vasha_pipeline_flowchart.puml

# Generate SVG (scalable)
plantuml -tsvg vasha_pipeline_flowchart.puml
```

### Option 4: IntelliJ IDEA / PyCharm
1. Install PlantUML plugin
2. Open `.puml` file
3. Preview will show automatically

## Diagram Features

The flowchart includes:
- ✅ **Color-coded components** (Frontend, Backend, ASR, MT, TTS, Auth, DB)
- ✅ **Complete user journey** from authentication to final TTS output
- ✅ **All API endpoints** and their connections
- ✅ **Model selection logic** with fallback mechanisms
- ✅ **Database interactions** (MongoDB)
- ✅ **External services** (Firebase, SMTP, YouTube)
- ✅ **Detailed notes** explaining each pipeline stage

## Color Legend

- 🔵 **Blue** - Frontend Components (React/TypeScript)
- 🟣 **Purple** - Backend API (FastAPI)
- 🟣 **Pink** - ASR Pipeline
- 🔵 **Light Blue** - Language Identification
- 🟢 **Green** - Machine Translation
- 🌸 **Pink** - Text-to-Speech
- 🟡 **Yellow** - Authentication
- 🔵 **Cyan** - Database (MongoDB)

## Flow Overview

1. **Authentication Flow**: User signup/login → Email OTP → JWT token
2. **ASR Flow**: Audio input → LID → ASR models → Transcription
3. **MT Flow**: Text → Language normalization → Translation models → Translated text
4. **TTS Flow**: Text → TTS models → Audio generation → Playback

## Notes

- The diagram shows the complete pipeline from user interaction to final output
- All fallback mechanisms are clearly marked
- Database operations are shown for persistence
- External service integrations are highlighted
