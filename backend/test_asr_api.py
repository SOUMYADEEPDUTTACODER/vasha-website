#!/usr/bin/env python3
"""
Test script for ASR API endpoints
Run this after starting the FastAPI server to test the ASR functionality
"""

import requests
import json
import os

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_languages_endpoint():
    """Test the languages endpoint"""
    print("🔍 Testing languages endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/languages")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Languages endpoint working. Found {len(data['languages'])} languages")
            print(f"Sample languages: {list(data['languages'].items())[:5]}")
            return True
        else:
            print(f"❌ Languages endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing languages endpoint: {e}")
        return False

def test_models_endpoint():
    """Test the models endpoint"""
    print("\n🔍 Testing models endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/asr/models")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Models endpoint working. Found {len(data['models'])} models")
            for model in data['models']:
                print(f"  - {model['name']} ({model['id']}): {model['description']}")
            return True
        else:
            print(f"❌ Models endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing models endpoint: {e}")
        return False

def test_youtube_endpoint():
    """Test the YouTube endpoint with a sample URL"""
    print("\n🔍 Testing YouTube endpoint...")
    try:
        # Use a short YouTube video for testing
        test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Roll (short video)
        
        data = {
            "youtube_url": test_url,
            "language": "en",
            "model": "whisper",
            "whisper_size": "base",  # Use smaller model for testing
            "decoding": "ctc"
        }
        
        response = requests.post(f"{BASE_URL}/asr/youtube", data=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ YouTube endpoint working")
            print(f"Transcription: {result['transcription'][:100]}...")
            print(f"Language: {result['language_name']}")
            print(f"Model used: {result['model_used']}")
            return True
        else:
            print(f"❌ YouTube endpoint failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing YouTube endpoint: {e}")
        return False

def test_file_upload():
    """Test file upload endpoint (requires a test audio file)"""
    print("\n🔍 Testing file upload endpoint...")
    
    # Check if we have a test audio file
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
    
    if not test_file:
        print("⚠️ No test audio file found. Skipping file upload test.")
        print("Create a test_audio.wav file to test file upload functionality.")
        return False
    
    try:
        with open(test_file, 'rb') as f:
            files = {'file': f}
            data = {
                'language': 'en',
                'model': 'whisper',
                'whisper_size': 'base',
                'decoding': 'ctc'
            }
            
            response = requests.post(f"{BASE_URL}/asr/upload", files=files, data=data)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ File upload endpoint working")
                print(f"Transcription: {result['transcription'][:100]}...")
                print(f"Language: {result['language_name']}")
                print(f"Model used: {result['model_used']}")
                return True
            else:
                print(f"❌ File upload endpoint failed: {response.status_code}")
                print(f"Error: {response.text}")
                return False
    except Exception as e:
        print(f"❌ Error testing file upload endpoint: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting ASR API Tests")
    print("=" * 50)
    
    # Test basic endpoints
    tests = [
        test_languages_endpoint,
        test_models_endpoint,
        test_youtube_endpoint,
        test_file_upload
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! ASR API is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the error messages above.")
    
    print("\n💡 To test the API manually:")
    print("1. Start the server: uvicorn main:app --reload")
    print("2. Visit: http://localhost:8000/docs for interactive API documentation")
    print("3. Use the /asr/upload, /asr/youtube, or /asr/microphone endpoints")

if __name__ == "__main__":
    main()
