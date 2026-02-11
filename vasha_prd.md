# Product Requirements Document (PRD): Vasha AI

| Project Name | Vasha AI |
| :--- | :--- |
| **Version** | 1.0 (Research Edition) |
| **Status** | Final |
| **Last Updated** | 2026-02-11 |

---

## 1. Introduction

### 1.1 Executive Summary
**Vasha AI** is a comprehensive, web-based multilingual speech-to-speech translation platform. It is designed to break down language barriers by providing a seamless interface for converting spoken audio in one language to spoken audio in another, with a specific focus on low-resource **Indic languages**. The system integrates state-of-the-art AI models for Automatic Speech Recognition (ASR), Machine Translation (MT), and Text-to-Speech (TTS) into a unified pipeline.

### 1.2 Purpose
The primary goal is to provide a "Speech-in, Speech-out" experience that preserves the original speaker's intent and, where possible, their voice characteristics through cloning. This document details the architectural, functional, and non-functional requirements for the system, suitable for research documentation and development guidance.

---

## 2. System Architecture

The system follows a classic **Client-Server** architecture, with a decoupled frontend and backend communicating via RESTful APIs.

### 2.1 Technology Stack

#### **Backend (The Core Intelligence)**
*   **Framework**: **FastAPI** (Python 3.10+) - Chosen for its high performance (Starlette), native async support, and automatic OpenAPI documentation.
*   **Database**: **MongoDB** - NoSQL database used for storing flexible user profiles and chat history.
*   **Authentication**: **JWT** (JSON Web Tokens) for stateless session management and **Firebase Auth** for phone verification.
*   **Task Queue**: `BackgroundTasks` (FastAPI native) for handling non-blocking operations like sending emails (SMTP).
*   **Audio Processing**: **FFmpeg** (via `ffmpeg-python`) for server-side audio conversion, normalization (16kHz mono), and chunking.

#### **Frontend (The User Interface)**
*   **Framework**: **React.js (v18)** - Component-based UI library.
*   **Build Tool**: **Vite** - For extremely fast HMR (Hot Module Replacement) and optimized bundling.
*   **Language**: **TypeScript** - For type safety and better developer experience.
*   **Styling**: **Tailwind CSS** + **shadcn-ui** - For a modern, accessible, and responsive design system.
*   **State Management**: **React Query** (TanStack Query) - For server state management, caching, and optimistic updates.
*   **Audio Handling**: `RecordRTC` / `MediaRecorder API` for capturing microphone input in the browser.

---

## 3. Backend Detailed Specification

The backend is modularized into specific pipelines for each AI task.

### 3.1 Automatic Speech Recognition (ASR) Pipeline
This module converts audio to text.

*   **Endpoint**: `/asr/upload`, `/asr/microphone`, `/asr/youtube`
*   **Logic Flow**:
    1.  **Input Handling**: Accepts `.wav`, `.mp3`, `.webm` (mic), or YouTube URLs (processed via `yt-dlp`).
    2.  **Preprocessing**:
        *   Convert audio to **16kHz, Mono, WAV** using FFmpeg.
        *   **Chunking**: Split audio > 30 seconds into 30s segments to fit in GPU memory and allow parallel processing using `ThreadPoolExecutor`.
    3.  **Language Identification (LID)**:
        *   Uses `Whisper`'s internal detection or `facebook/mms-lid-1024` to identify the source language if not specified.
    4.  **Inference (Model Selection)**:
        *   **Primary**: `AI4Bharat Indic Conformer` (Specific for Indian languages).
        *   **Secondary/Fallback**: `Faster-Whisper` / `OpenAI Whisper` (Base/Large-v2).
        *   *Fallback Strategy*: If Indic Conformer fails, the system automatically retries with Whisper.
    5.  **Post-Processing**:
        *   Text normalization.
        *   **Proper Noun Filtering**: Uses `spaCy` (`en_core_web_lg`) to identify names/places to prevent erratic translation of proper nouns.

### 3.2 Machine Translation (MT) Pipeline
This module translates text between languages.

*   **Endpoint**: `/mt/translate`
*   **Logic Flow**:
    1.  **Input**: Source Text, Source Language Code, Target Language Code.
    2.  **Model Selection**:
        *   **Indic-Indic/English**: `IndicTrans2` (AI4Bharat) - State-of-the-art for Indic languages.
        *   **Global**: `Meta NLLB-200` (No Language Left Behind) - Massive multilingual support.
        *   **Robust Fallback**: `Google Translate` (via `deep-translator`).
    3.  **Batching**:
        *   Long text is split into sentences using regex (boundary detection on `.`, `?`, `!`, `|`).
        *   Sentences are grouped into chunks (< 2000 chars) for batched inference.
    4.  **Fallback**: If the primary model (e.g., IndicTrans2) errors out, the request is seamless retried with Google Translate.

### 3.3 Text-to-Speech (TTS) Pipeline
This module synthesizes speech from text.

*   **Endpoint**: `/tts/generate`
*   **Features**:
    *   **Voice Cloning**: Supports `Coqui XTTS v2` which takes a 6-second reference audio (uploaded or preset) to clone the speaker's voice.
*   **Models**:
    *   **Indic Parler-TTS**: For high-quality, natural Indic speech.
    *   **Coqui XTTS v2**: For multilingual voice cloning.
    *   **gTTS**: Google Text-to-Speech as a lightweight, reliable fallback.
*   **Output**: Generates a static `.wav` file served via a public URL.

### 3.4 Text Analysis & OCR
*   **LID (Text)**: Uses `FastText` (`facebook/fasttext-language-identification`) to detect the language of input text.
*   **OCR**: Uses `PaddleOCR` (English models configured) to extract text from uploaded images.

### 3.5 Database Schema (MongoDB)
*   **Users Collection**:
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "hashed_string",
      "email_verified": "boolean",
      "auth_provider": "local/google",
      "created_at": "datetime"
    }
    ```
*   **Chats Collection**:
    ```json
    {
      "user_id": "ObjectId",
      "text": "string", // Original text
      "timestamp": "datetime"
    }
    ```

---

## 4. Frontend Important Aspects

### 4.1 Component Architecture
The UI is built using atomic design principles with highly reusable components.

*   **`AudioRecorder.tsx`**: Manages the `MediaRecorder` API state. Visualizes recording status and handles the blob creation for `.webm` uploads.
*   **`ModelSelector.tsx`**: A sophisticated dropdown allowing users to override default model choices (e.g., forcing usage of `IndicTrans2` over `Google`).
*   **`Chat.tsx`**: The central hub. It orchestrates the flow:
    *   `Record Audio` $\rightarrow$ `POST /asr` $\rightarrow$ `Receive Text`.
    *   `Click Translate` $\rightarrow$ `POST /mt` $\rightarrow$ `Receive Translation`.
    *   `Click Speak` $\rightarrow$ `POST /tts` $\rightarrow$ `Receive Audio URL`.

### 4.2 API Service Layer
All API calls are encapsulated in dedicated service files (`src/services/`) to maintain separation of concerns.
*   **`asrService.ts`**: Handles multipart/form-data requests for audio uploads.
*   **`mtService.ts`**: Handles JSON payloads for translation.
*   **`ttsService.ts`**: manages generating and constructing the audio playback URL.

### 4.3 State Management
**React Query** is used extensively to:
*   Cache list of supported languages (`/languages`).
*   Handle `isLoading` and `isError` states for all mutations (ASR/MT/TTS).
*   Prevent "prop drilling" by persisting server settings across components.

---

## 5. Non-Functional Requirements

*   **Performance**:
    *   ASR processing should aim for a Real-Time Factor (RTF) of < 0.5 (process 10s audio in < 5s).
    *   UI interaction must be non-blocking; heavy processing shows clear loading indicators (skeletons/spinners).
*   **Scalability**:
    *   The backend's stateless design allows for horizontal scaling (adding more API workers) behind a load balancer.
    *   Model inference is the bottleneck; GPU availability is critical for scaling `Whisper` and `IndicTrans2`.
*   **Security**:
    *   **CORS**: Strictly configured to allow only trusted frontend origins (`API_BASE_URL`).
    *   **Input Validation**: All incoming files are checked for MIME types.
    *   **Passwords**: Never stored in plain text; always hashed using `bcrypt`.
*   **Reliability**:
    *   **Graceful Degradation**: The system is designed to never fail silently. If a complex model (like AI4Bharat) fails, it *must* fallback to a simpler one (like Google/Whisper) to return *some* result to the user.

---
*Vasha AI Research Documentation*
