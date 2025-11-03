#!/usr/bin/env python3
"""
Setup script for ASR dependencies
This script helps install and configure the required dependencies for ASR functionality
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def install_python_dependencies():
    """Install Python dependencies from requirements.txt"""
    print("📦 Installing Python dependencies...")
    
    # Upgrade pip first
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install requirements
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing requirements"):
        return False
    
    return True

def download_spacy_model():
    """Download the required spaCy model"""
    print("📥 Downloading spaCy English model...")
    
    try:
        import spacy
        # Try to load the model first
        nlp = spacy.load("en_core_web_lg")
        print("✅ spaCy English model already available")
        return True
    except OSError:
        # Model not found, download it
        print("📥 Downloading en_core_web_lg model...")
        if run_command(f"{sys.executable} -m spacy download en_core_web_lg", "Downloading spaCy model"):
            print("✅ spaCy model downloaded successfully")
            return True
        else:
            print("❌ Failed to download spaCy model")
            return False

def check_ffmpeg():
    """Check if FFmpeg is available"""
    print("🎬 Checking FFmpeg installation...")
    
    try:
        result = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ FFmpeg is available")
            return True
        else:
            print("❌ FFmpeg not found")
            return False
    except FileNotFoundError:
        print("❌ FFmpeg not found")
        print("💡 Please install FFmpeg:")
        print("   - Windows: Download from https://ffmpeg.org/download.html")
        print("   - macOS: brew install ffmpeg")
        print("   - Ubuntu/Debian: sudo apt install ffmpeg")
        return False

def create_directories():
    """Create necessary directories"""
    print("📁 Creating necessary directories...")
    
    directories = ["chunks", "temp_audio"]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Created directory: {directory}")
        else:
            print(f"✅ Directory already exists: {directory}")
    
    return True

def test_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing imports...")
    
    required_modules = [
        "torch",
        "torchaudio", 
        "whisper",
        "faster_whisper",
        "transformers",
        "spacy",
        "jiwer",
        "scipy",
        "sounddevice",
        "yt_dlp"
    ]
    
    failed_imports = []
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"✅ {module}")
        except ImportError as e:
            print(f"❌ {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        return False
    else:
        print("\n✅ All modules imported successfully")
        return True

def main():
    """Main setup function"""
    print("🚀 ASR Backend Setup")
    print("=" * 50)
    
    steps = [
        ("Installing Python dependencies", install_python_dependencies),
        ("Downloading spaCy model", download_spacy_model),
        ("Checking FFmpeg", check_ffmpeg),
        ("Creating directories", create_directories),
        ("Testing imports", test_imports)
    ]
    
    success_count = 0
    
    for description, function in steps:
        print(f"\n📋 {description}")
        print("-" * 30)
        if function():
            success_count += 1
        else:
            print(f"⚠️ {description} failed")
    
    print("\n" + "=" * 50)
    print(f"📊 Setup Results: {success_count}/{len(steps)} steps completed successfully")
    
    if success_count == len(steps):
        print("🎉 Setup completed successfully!")
        print("\n💡 Next steps:")
        print("1. Start the server: uvicorn main:app --reload")
        print("2. Test the API: python test_asr_api.py")
        print("3. Visit: http://localhost:8000/docs for API documentation")
    else:
        print("⚠️ Setup completed with some issues.")
        print("Please check the error messages above and resolve them.")
    
    print("\n🔧 Manual installation commands if needed:")
    print("pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118")
    print("pip install -r requirements.txt")
    print("python -m spacy download en_core_web_lg")

if __name__ == "__main__":
    main()
