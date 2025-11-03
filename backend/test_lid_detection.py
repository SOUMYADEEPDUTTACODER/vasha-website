#!/usr/bin/env python3
"""
Test script for automatic language detection
This script tests the LID functionality with sample audio files
"""

import os
import sys
import tempfile
import requests
from asr_pipeline import run_asr_with_fallback

def test_lid_detection():
    """Test language detection with different scenarios"""
    print("🧪 Testing Language Detection (LID)")
    print("=" * 50)
    
    # Test 1: Test with a sample audio file (if available)
    test_files = [
        "test_audio.wav",
        "test_audio.mp3",
        "../frontend/public/asrvid.mp4"  # Check if there's a video in the frontend
    ]
    
    test_file = None
    for file_path in test_files:
        if os.path.exists(file_path):
            test_file = file_path
            break
    
    if test_file:
        print(f"📁 Testing with file: {test_file}")
        try:
            result = run_asr_with_fallback(
                audio_path=test_file,
                asr_model="whisper",
                whisper_size="base"
            )
            
            if result["success"]:
                print(f"✅ Language Detection Successful!")
                print(f"   Detected Language: {result['language_name']} ({result['language']})")
                print(f"   Model Used: {result['model_used']}")
                print(f"   Transcription: {result['transcription'][:100]}...")
            else:
                print(f"❌ Language Detection Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Error during testing: {e}")
    else:
        print("⚠️ No test audio file found. Skipping file test.")
        print("Create a test_audio.wav file to test language detection.")
    
    # Test 2: Test API endpoints
    print(f"\n🌐 Testing API Endpoints")
    print("-" * 30)
    
    try:
        # Test languages endpoint
        response = requests.get("http://localhost:8000/languages")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Languages endpoint working: {len(data['languages'])} languages supported")
        else:
            print(f"❌ Languages endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ API test failed: {e}")
    
    print(f"\n💡 To test with real audio:")
    print("1. Start the backend: uvicorn main:app --reload")
    print("2. Start the frontend: npm run dev")
    print("3. Upload audio files in different languages")
    print("4. Check the detected language in the UI")

def test_youtube_lid():
    """Test language detection with YouTube URL"""
    print(f"\n🎥 Testing YouTube Language Detection")
    print("-" * 40)
    
    # Use a short YouTube video for testing
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Roll (English)
    
    try:
        result = run_asr_with_fallback(
            audio_path=None,
            youtube=test_url,
            asr_model="whisper",
            whisper_size="base"
        )
        
        if result["success"]:
            print(f"✅ YouTube Language Detection Successful!")
            print(f"   Detected Language: {result['language_name']} ({result['language']})")
            print(f"   Model Used: {result['model_used']}")
            print(f"   Transcription: {result['transcription'][:100]}...")
        else:
            print(f"❌ YouTube Language Detection Failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ YouTube test failed: {e}")

if __name__ == "__main__":
    print("🚀 LID (Language Identification) Test Suite")
    print("=" * 60)
    
    # Test file-based detection
    test_lid_detection()
    
    # Test YouTube detection
    test_youtube_lid()
    
    print(f"\n🎯 Expected Behavior:")
    print("- Upload Bengali audio → Detects 'bn' (Bengali)")
    print("- Upload Hindi audio → Detects 'hi' (Hindi)")
    print("- Upload English audio → Detects 'en' (English)")
    print("- Upload Tamil audio → Detects 'ta' (Tamil)")
    print("- And so on for all 22+ supported languages...")
    
    print(f"\n✨ The system now automatically detects language!")
    print("   No manual language selection needed.")
