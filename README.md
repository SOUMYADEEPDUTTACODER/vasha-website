# VashaFront

This repository contains a frontend (TypeScript + Vite) and a Python backend for speech/ASR/TTS/machine-translation features.

Layout
- `frontend/` — Vite + TypeScript frontend (UI components, pages, services).
- `backend/` — Python services (ASR, TTS, MT) and supporting scripts.

Quick setup

1) Frontend (node)

   - Using npm:

     cd frontend
     npm install
     npm run dev

   - Or using Bun (if you have Bun installed):

     cd frontend
     bun install
     bun dev

2) Backend (Python)

   Create a virtual environment and install requirements:

     cd backend
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1  # PowerShell
     pip install -r requirements.txt

   Configure `backend/.env` as needed (do not commit secrets).

Pushing to GitHub

1. Initialize and push (if you haven't already):

   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main

Notes
- `.gitignore` already excludes `backend/.env`, `node_modules/`, Python caches, and backend output folders such as `backend/tts_output/` and `backend/chunks/` to avoid committing large or sensitive files.
- Review `bun.lockb` and lockfiles before forcing choices; they may be intentionally checked in.

If you want, I can also create a LICENSE file, add a more detailed development README, or prepare a GitHub Actions workflow for CI.
