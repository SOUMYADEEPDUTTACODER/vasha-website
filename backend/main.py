from fastapi import FastAPI, Depends, HTTPException, status, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import pymongo
from bson import ObjectId
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import smtplib, ssl
from email.message import EmailMessage
from fastapi import BackgroundTasks
import base64
import os
import tempfile
import shutil
from asr_pipeline import run_asr_with_fallback
from lid import TARGET_LANGS, detect_language_text
from mt import translate_with_fallback
from tts_handler import run_tts

load_dotenv()

app = FastAPI()

# CORS configuration - allows environment variable for frontend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:5173",  # Local development (default Vite port)
    "http://localhost:5174",  # Local development (fallback Vite port)
]

# If FRONTEND_URL contains comma-separated URLs, split them
if "," in FRONTEND_URL:
    ALLOWED_ORIGINS = FRONTEND_URL.split(",") + ["http://localhost:5173", "http://localhost:5174"]

# Ensure backend Swagger/UI origins are allowed so docs can call the API
if "http://localhost:8000" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("http://localhost:8000")
if "http://127.0.0.1:8000" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("http://127.0.0.1:8000")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection - use environment variable or default to localhost
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGODB_URI)
db = client["vasha"]
users = db["users"]
chats = db["chats"]
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(username: str):
    try:
        return users.find_one({"username": username})
    except pymongo.errors.PyMongoError as e:
        print(f"❌ MongoDB error in get_user(): {e}")
        return None

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not verify_password(password, user["password"]):
        return False
    return user

@app.post("/signup")
async def signup(data: dict, background_tasks: BackgroundTasks):
    try:
        if get_user(data["username"]):
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Check if email already exists
        existing_user = users.find_one({"email": data["email"]})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Phone is optional now, so only check if provided
        phone = data.get("phone", "")
        if phone:
            existing_phone = users.find_one({"phone": phone})
            if existing_phone:
                raise HTTPException(status_code=400, detail="Phone number already registered")
        
        hashed_password = get_password_hash(data["password"])
        user = {
            "username": data["username"],
            "email": data["email"],
            "phone": phone,
            "password": hashed_password,
            "email_verified": False,
            "phone_verified": False,
            "created_at": datetime.utcnow()
        }
        
        # Insert user with verification status
        result = users.insert_one(user)
        user["_id"] = result.inserted_id
    except pymongo.errors.ServerSelectionTimeoutError as e:
        print(f"❌ MongoDB connection error during signup: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again later.")
    except pymongo.errors.PyMongoError as e:
        print(f"❌ MongoDB error during signup: {e}")
        raise HTTPException(status_code=500, detail="Database error during signup")

    # Generate and send email verification OTP
    try:
        otp = generate_otp()
        email_otp_store[user["email"]] = {
            "otp": otp,
            "created_at": datetime.utcnow(),
            "attempts": 0,
            "user_id": str(user["_id"])
        }
        
        # Send email verification OTP
        background_tasks.add_task(send_email_verification, user["email"], user["username"], otp)
        print(f"✅ Email verification OTP sent to {user['email']}: {otp}")
            
    except Exception as e:
        print(f"Failed to send email verification: {str(e)}")

    # Return user info without access token until verification is complete
    return {
        "message": "User registered successfully. Please verify your email with the OTP sent to your email.",
        "user_id": str(user["_id"]),
        "email": user["email"],
        "requires_verification": True
    }

@app.post("/complete-signup")
async def complete_signup(data: dict, background_tasks: BackgroundTasks):
    """Complete signup after email OTP verification"""
    user_id = data.get("user_id")
    otp = data.get("otp")
    
    if not user_id or not otp:
        raise HTTPException(status_code=400, detail="User ID and OTP are required")
    
    # Find user
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Verify email OTP
    stored_data = email_otp_store.get(user["email"])
    if not stored_data or stored_data.get("user_id") != user_id:
        raise HTTPException(status_code=400, detail="OTP not found or expired")
    
    # Check if OTP is expired (5 minutes)
    if datetime.utcnow() - stored_data["created_at"] > timedelta(minutes=5):
        del email_otp_store[user["email"]]
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Check attempts
    if stored_data["attempts"] >= 3:
        del email_otp_store[user["email"]]
        raise HTTPException(status_code=400, detail="Too many attempts")
    
    # Increment attempts
    stored_data["attempts"] += 1
    
    if stored_data["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Mark email as verified
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"email_verified": True}}
    )
    
    # Remove OTP from store
    del email_otp_store[user["email"]]
    
    # Send welcome email
    try:
        background_tasks.add_task(send_welcome_email, user["email"], user["username"])
    except Exception as e:
        print(f"Failed to send welcome email: {str(e)}")
    
    # Create access token
    token = create_access_token({"sub": user["username"]})
    
    return {
        "access_token": token,
        "username": user["username"],
        "message": "Account verified successfully"
    }

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# SMTP Configuration - Load from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)

# Validate SMTP configuration
if not SMTP_USER or not SMTP_PASS:
    print("⚠️ WARNING: SMTP_USER or SMTP_PASS not set in environment variables!")
    print("⚠️ Email sending will fail. Please set these in your .env file:")
    print("   SMTP_USER=your-email@gmail.com")
    print("   SMTP_PASS=your-app-password")
    print("   Note: For Gmail, you need to use an App Password, not your regular password.")
    print("   See: https://support.google.com/accounts/answer/185833")

def send_email_verification(to_email: str, username: str, otp: str):
    """Send email verification OTP"""
    try:
        msg = EmailMessage()
        msg["Subject"] = "Verify Your Email - Vasha AI"
        msg["From"] = SMTP_FROM
        msg["To"] = to_email

        msg.set_content(
            f"Hi {username},\n\n"
            f"Your verification code is: {otp}\n\n"
            "Please enter this code to verify your email address.\n\n"
            "This code will expire in 5 minutes.\n\n"
            "— The Vasha AI Team"
        )

        html = f"""
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Vasha AI</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Verify Your Email</h2>
            <p>Hi {username},</p>
            <p>Please use the verification code below to verify your email address:</p>
            <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 8px; margin: 0;">{otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
            <p>— The Vasha AI Team</p>
          </div>
        </div>
        """
        msg.add_alternative(html, subtype="html")

        # Check if SMTP credentials are configured
        if not SMTP_USER or not SMTP_PASS:
            raise ValueError("SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file")
        
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print(f"✅ Email verification OTP sent successfully to {to_email}")
    except smtplib.SMTPAuthenticationError as e:
        error_msg = str(e)
        print(f"❌ Gmail Authentication Failed for {to_email}")
        print(f"   Error: {error_msg}")
        print("   📝 Troubleshooting:")
        print("   1. Make sure you're using a Gmail App Password (not your regular password)")
        print("   2. Generate App Password: https://myaccount.google.com/apppasswords")
        print("   3. Enable 2-Step Verification first if you haven't")
        print("   4. Set SMTP_USER and SMTP_PASS in your .env file")
        print(f"   Current SMTP_USER: {SMTP_USER if SMTP_USER else 'NOT SET'}")
    except Exception as e:
        print(f"❌ Failed to send email verification to {to_email}: {str(e)}")
        print(f"   Error type: {type(e).__name__}")

def get_logo_base64():
    """Get the logo as base64 encoded string"""
    try:
        # Try to read the logo from the frontend public folder
        logo_path = "../frontend/public/logo.png"
        
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode()
                return f"data:image/png;base64,{encoded_string}"
        else:
            return None
    except Exception as e:
        print(f"Error reading logo: {e}")
        return None

def get_logo_html():
    logo_path = "../frontend/public/logo.png"
    if os.path.exists(logo_path):
        with open(logo_path, "rb") as img:
            encoded = base64.b64encode(img.read()).decode()
            return f'<img src="cid:logoimg" alt="Vasha AI Logo" style="width: 60px; height: 60px; object-fit: contain;">', logo_path
    else:
        return '''
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    color: white; font-weight: bold; font-size: 18px;">
            VA
        </div>
        ''', None

def send_welcome_email(to_email: str, username: str):
    """Send welcome email after verification"""
    try:
        msg = EmailMessage()
        msg["Subject"] = "Welcome to Vasha AI 🎉"
        msg["From"] = SMTP_FROM
        msg["To"] = to_email

        msg.set_content(
            f"Hi {username},\n\n"
            "Welcome to Vasha AI! We're excited to have you on board.\n\n"
            "You can now log in anytime and start chatting and use our services.\n\n"
            "— The Vasha AI Team.\n\n"
            "Developers:\n"
            "Deep Habiswashi\n"
            "Soumyadeep Dutta"
        )

        # --- LOGO LOGIC START (same as test_logo_email.py) ---
        logo_path = "../frontend/public/logo.png"
        if os.path.exists(logo_path):
            logo_html = '<img src="cid:logoimg" alt="Vasha AI Logo" style="width: 60px; height: 60px; object-fit: contain;">'
        else:
            logo_html = '''
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                        color: white; font-weight: bold; font-size: 18px;">
                VA
            </div>
            '''
        # --- LOGO LOGIC END ---

        html = f"""
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto;">
          <!-- Header with Logo -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <div style="display: inline-block; background: white; padding: 15px; border-radius: 50%; margin-bottom: 15px;">
              {logo_html}
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to Vasha AI</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your AI journey begins here</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">🎉 Welcome aboard!</h2>
            <p style="color: #555; font-size: 16px;">Hi <strong>{username}</strong>,</p>
            <p style="color: #555; font-size: 16px;">We're thrilled to have you join the Vasha AI community! Your account has been successfully verified and you're now ready to explore the amazing world of artificial intelligence.</p>
            
            <!-- Features Section -->
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">🚀 What you can do now:</h3>
              <ul style="color: #555; font-size: 15px;">
                <li>Chat with our advanced AI models</li>
                <li>Experience real-time conversations</li>
                <li>Access 22+ language support</li>
                <li>Use our ASR, MT, and TTS services</li>
              </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                🚀 Start Chatting Now
              </a>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                — The Vasha AI Team
              </p>
              <p style="color: #888; font-size: 12px; margin: 10px 0 0 0;">
                <strong>Developers:</strong> Deep Habiswashi & Soumyadeep Dutta
              </p>
            </div>
          </div>
        </div>
        """

        msg.add_alternative(html, subtype="html")
        # Attach logo as related part to the HTML alternative (same as test_logo_email.py)
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as img:
                msg.get_payload()[-1].add_related(img.read(), maintype='image', subtype='png', cid='logoimg')

        # Check if SMTP credentials are configured
        if not SMTP_USER or not SMTP_PASS:
            raise ValueError("SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file")
        
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print(f"✅ Welcome email sent successfully to {to_email}")
    except smtplib.SMTPAuthenticationError as e:
        error_msg = str(e)
        print(f"❌ Gmail Authentication Failed for welcome email to {to_email}")
        print(f"   Error: {error_msg}")
        print("   📝 Troubleshooting:")
        print("   1. Make sure you're using a Gmail App Password (not your regular password)")
        print("   2. Generate App Password: https://myaccount.google.com/apppasswords")
        print("   3. Enable 2-Step Verification first if you haven't")
        print("   4. Set SMTP_USER and SMTP_PASS in your .env file")
        print(f"   Current SMTP_USER: {SMTP_USER if SMTP_USER else 'NOT SET'}")
    except Exception as e:
        print(f"❌ Failed to send welcome email to {to_email}: {str(e)}")
        print(f"   Error type: {type(e).__name__}")

def send_feedback_email(username: str, email: str, message: str, rating: str = "N/A"):
    """Send user feedback to developers"""
    try:
        msg = EmailMessage()
        msg["Subject"] = f"New Feedback from {username} - Vasha AI"
        msg["From"] = SMTP_FROM
        msg["To"] = SMTP_USER # Send to the configured SMTP user (developer)
        
        # Add CC if desired, or just send to SMTP_USER
        
        content = f"""
        New Feedback received for Vasha AI:
        
        User: {username}
        Email: {email}
        Rating: {rating}
        
        Message:
        {message}
        
        ---
        Vasha AI System
        """
        msg.set_content(content)
        
        html = f"""
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">New User Feedback</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            <p><strong>User:</strong> {username}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Rating:</strong> {rating}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">{message}</div>
          </div>
        </div>
        """
        msg.add_alternative(html, subtype="html")
        
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print(f"✅ Feedback email sent to developers")
        return True
    except Exception as e:
        print(f"❌ Failed to send feedback email: {str(e)}")
        return False

@app.post("/feedback")
async def receive_feedback(data: dict, background_tasks: BackgroundTasks):
    """Receive feedback from frontend and send email"""
    username = data.get("username", "Anonymous")
    email = data.get("email", "Not provided")
    message = data.get("message")
    rating = data.get("rating", "N/A")
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
        
    background_tasks.add_task(send_feedback_email, username, email, message, rating)
    
    return {"success": True, "message": "Feedback received and developers notified"}



@app.post("/login")
async def login(data: dict):
    user = authenticate_user(data["username"], data["password"])
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "username": user["username"]}

@app.post("/logout")
async def logout():
    # For JWT, logout is handled client-side by deleting the token
    return {"message": "Logged out"}

@app.get("/me")
async def get_me(request: Request):
    auth = request.headers.get("authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user["username"], "email": user["email"], "phone": user["phone"]}


def _get_username_from_request(request: Request):
    auth = request.headers.get("authorization")
    if not auth or not auth.startswith("Bearer "):
        return None
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        return username
    except JWTError:
        return None


@app.post("/chats")
async def save_chat(request: Request, payload: dict):
    """Save a chat message (text only) for the authenticated user."""
    username = _get_username_from_request(request)
    if not username:
        raise HTTPException(status_code=401, detail="Not authenticated")

    text = payload.get("text")
    if not text or not isinstance(text, str):
        raise HTTPException(status_code=400, detail="'text' is required and must be a string")

    user = get_user(username)
    user_id = str(user["_id"]) if user else None

    doc = {
        "user_id": user_id,
        "username": username,
        "text": text,
        "timestamp": datetime.utcnow()
    }

    try:
        chats.insert_one(doc)
        return {"success": True, "message": "Chat saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save chat: {str(e)}")


@app.get("/chats")
async def get_chats(request: Request, limit: int = 50):
    """Retrieve recent chat messages for the authenticated user."""
    username = _get_username_from_request(request)
    if not username:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        cursor = chats.find({"username": username}).sort("timestamp", -1).limit(int(limit))
        items = []
        for doc in cursor:
            items.append({
                "text": doc.get("text"),
                "timestamp": doc.get("timestamp")
            })

        # Return messages oldest->newest
        return {"success": True, "messages": list(reversed(items))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chats: {str(e)}")

# SMS OTP functionality for user verification
import random
import string

# Store OTPs temporarily (in production, use Redis or database)
otp_store = {}
email_otp_store = {}

# Firebase Phone Authentication Integration
def verify_firebase_phone_token(id_token: str):
    """
    Verify Firebase phone authentication token
    """
    try:
        import requests
        
        # Firebase Admin SDK verification (you'll need to set up Firebase Admin)
        # For now, we'll do basic validation
        if len(id_token) > 100:  # Basic validation
            return True
        return False
        
    except Exception as e:
        print(f"❌ Failed to verify Firebase token: {str(e)}")
        return False

# SMS Service Integration (Fallback to console for testing)
def send_sms_otp(phone: str, otp: str):
    """
    Send SMS OTP (Firebase handles this on frontend)
    For backend verification, we'll use Firebase tokens
    """
    print(f"📱 Firebase Phone Auth: OTP {otp} would be sent to {phone}")
    print(f"✅ In production, Firebase handles SMS delivery automatically")
    return True

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

@app.post("/send-otp")
async def send_otp(data: dict):
    """Send SMS OTP to user's phone number"""
    phone = data.get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    
    # Generate OTP
    otp = generate_otp()
    
    # Store OTP with phone number (in production, use Redis with expiration)
    otp_store[phone] = {
        "otp": otp,
        "created_at": datetime.utcnow(),
        "attempts": 0
    }
    
    # Send SMS via Twilio
    sms_sent = send_sms_otp(phone, otp)
    if not sms_sent:
        print(f"⚠️ SMS failed, but OTP generated: {otp}")
    else:
        print(f"✅ SMS sent successfully to {phone}")
    
    return {"message": "OTP sent successfully", "phone": phone}

@app.post("/verify-otp")
async def verify_otp(data: dict):
    """Verify SMS OTP"""
    phone = data.get("phone")
    otp = data.get("otp")
    
    if not phone or not otp:
        raise HTTPException(status_code=400, detail="Phone and OTP are required")
    
    stored_data = otp_store.get(phone)
    if not stored_data:
        raise HTTPException(status_code=400, detail="OTP expired or not found")
    
    # Check if OTP is expired (5 minutes)
    if datetime.utcnow() - stored_data["created_at"] > timedelta(minutes=5):
        del otp_store[phone]
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Check attempts
    if stored_data["attempts"] >= 3:
        del otp_store[phone]
        raise HTTPException(status_code=400, detail="Too many attempts")
    
    # Increment attempts
    stored_data["attempts"] += 1
    
    if stored_data["otp"] == otp:
        # OTP is correct, remove from store
        del otp_store[phone]
        return {"message": "OTP verified successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP")

@app.post("/resend-email-otp")
async def resend_email_otp(data: dict, background_tasks: BackgroundTasks):
    """Resend email verification OTP"""
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # Find user by email
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove existing OTP if any
    if email in email_otp_store:
        del email_otp_store[email]
    
    # Generate new OTP
    otp = generate_otp()
    
    # Store new OTP
    email_otp_store[email] = {
        "otp": otp,
        "created_at": datetime.utcnow(),
        "attempts": 0,
        "user_id": str(user["_id"])
    }
    
    # Send email verification OTP
    try:
        background_tasks.add_task(send_email_verification, email, user["username"], otp)
        print(f"✅ Email verification OTP resent to {email}: {otp}")
    except Exception as e:
        print(f"Failed to resend email verification: {str(e)}")
    
    return {"message": "Email verification OTP resent successfully", "email": email}

@app.post("/resend-otp")
async def resend_otp(data: dict):
    """Resend SMS OTP"""
    phone = data.get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    
    # Remove existing OTP if any
    if phone in otp_store:
        del otp_store[phone]
    
    # Generate new OTP
    otp = generate_otp()
    
    # Store new OTP
    otp_store[phone] = {
        "otp": otp,
        "created_at": datetime.utcnow(),
        "attempts": 0
    }
    
    # Send SMS via Twilio
    sms_sent = send_sms_otp(phone, otp)
    if not sms_sent:
        print(f"⚠️ SMS failed, but OTP generated: {otp}")
    else:
        print(f"✅ SMS resent successfully to {phone}")
    
    return {"message": "OTP resent successfully", "phone": phone}

# Captcha verification for login security
@app.post("/verify-captcha")
async def verify_captcha(data: dict):
    """Verify captcha token from frontend"""
    captcha_token = data.get("captcha_token")
    
    if not captcha_token:
        raise HTTPException(status_code=400, detail="Captcha token is required")
    
    # TODO: Integrate with Firebase reCAPTCHA or similar service
    # For now, we'll do a basic validation
    # In production, verify with Firebase reCAPTCHA API
    
    try:
        # This is a placeholder for Firebase reCAPTCHA verification
        # You would typically make a request to Firebase to verify the token
        # For now, we'll assume it's valid if it's not empty
        if len(captcha_token) > 10:  # Basic validation
            return {"message": "Captcha verified successfully"}
        else:
            raise HTTPException(status_code=400, detail="Invalid captcha token")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Captcha verification failed")

@app.post("/login-with-captcha")
async def login_with_captcha(data: dict):
    """Login with captcha verification"""
    username = data.get("username")
    password = data.get("password")
    captcha_token = data.get("captcha_token")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    
    if not captcha_token:
        raise HTTPException(status_code=400, detail="Captcha verification is required")
    
    # Verify captcha first
    try:
        # TODO: Implement actual Firebase reCAPTCHA verification here
        if len(captcha_token) <= 10:
            raise HTTPException(status_code=400, detail="Invalid captcha token")
    except Exception:
        raise HTTPException(status_code=400, detail="Captcha verification failed")
    
    # Proceed with login
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "username": user["username"]}

@app.post("/verify-firebase-phone")
async def verify_firebase_phone(data: dict):
    """Verify Firebase phone authentication"""
    phone = data.get("phone")
    firebase_token = data.get("firebase_token")
    
    if not phone or not firebase_token:
        raise HTTPException(status_code=400, detail="Phone and Firebase token are required")
    
    # Verify Firebase token
    if not verify_firebase_phone_token(firebase_token):
        raise HTTPException(status_code=400, detail="Invalid Firebase token")
    
    # Find user by phone number
    user = users.find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mark phone as verified
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"phone_verified": True}}
    )
    
    # Create access token
    token = create_access_token({"sub": user["username"]})
    
    return {
        "access_token": token,
        "username": user["username"],
        "message": "Phone verified successfully"
    }

# ASR Endpoints
@app.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for ASR"""
    return {
        "languages": TARGET_LANGS,
        "message": "Supported languages retrieved successfully"
    }


class LIDRequest(BaseModel):
    text: str

@app.post("/lid/text")
async def lid_text(payload: LIDRequest):
    """Detect language from text using FastText."""
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="'text' is required")
    try:
        results = detect_language_text(payload.text)
        if results:
            # Map fasttext ISO 2-letter codes to TARGET_LANGS if possible
            # FastText codes are often __label__en, __label__hi, etc.
            # lid.py's detect_language_text already strips __label__
            detected = results[0]["language"]
            return {
                "success": True, 
                "detected_languages": results,
                "top_language": detected,
                "language_name": TARGET_LANGS.get(detected, "Unknown")
            }
        return {"success": False, "error": "Detection failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LID failed: {e}")

class MTRequest(BaseModel):
    text: str
    src_lang: str = "en"
    tgt_lang: str = "hi"
    # primary can be 'indictrans', 'nllb', or 'google'
    primary: str = "indictrans"


@app.post("/mt/indictrans")
async def mt_indictrans(payload: MTRequest):
    """Translate text using IndicTrans (visible in Swagger at /docs).

    Example request body:
    {
      "text": "Hello world",
      "src_lang": "en",
      "tgt_lang": "hi",
      "primary": "indictrans"
    }
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="'text' is required")

    try:
        translated, used = translate_with_fallback(payload.text, payload.src_lang, payload.tgt_lang, primary=payload.primary)
        return {"success": True, "translation": translated, "model_used": used}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MT failed: {e}")

@app.post("/asr/upload")
async def process_audio_upload(
    file: UploadFile = File(...),
    model: str = Form("whisper"),
    whisper_size: str = Form("large"),
    decoding: str = Form("ctc"),
    lid_model: str = Form("whisper")
):
    """
    Process audio file upload for ASR with automatic language detection
    Supports: .wav, .mp3, .mp4, .mkv, .mov, .avi files
    """
    try:
        # Validate file type (include .webm for browser mic recordings)
        allowed_extensions = ['.wav', '.mp3', '.mp4', '.mkv', '.mov', '.avi', '.webm']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Validate model
        valid_models = ["whisper", "faster_whisper", "ai4bharat"]
        if model not in valid_models:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model. Valid models: {', '.join(valid_models)}"
            )
        
        # Save uploaded file temporarily
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_extension)
        try:
            content = await file.read()
            temp_file.write(content)
            temp_file.close()

            # If uploaded file is .webm, convert to .wav before processing
            input_path = temp_file.name
            processed_path = input_path
            try:
                if file_extension == '.webm':
                    import subprocess, tempfile as _tf
                    wav_out = _tf.NamedTemporaryFile(delete=False, suffix='.wav')
                    wav_out.close()
                    # ffmpeg -y -i input.webm -ar 16000 -ac 1 output.wav
                    subprocess.run([
                        'ffmpeg', '-y',
                        '-i', input_path,
                        '-ar', '16000',
                        '-ac', '1',
                        wav_out.name
                    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    processed_path = wav_out.name
            except Exception:
                # Fall through; ASR may still handle if backend supports webm
                processed_path = input_path

            # Process with ASR pipeline (language will be auto-detected)
            result = run_asr_with_fallback(
                audio_path=processed_path,
                asr_model=model,
                whisper_size=whisper_size,
                decoding=decoding,
                lid_model=lid_model
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "transcription": result["transcription"],
                    "language": result["language"],
                    "language_name": result["language_name"],
                    "model_used": result["model_used"],
                    "message": "Audio processed successfully"
                }
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"ASR processing failed: {result.get('error', 'Unknown error')}"
                )
                
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.post("/asr/youtube")
async def process_youtube_audio(
    youtube_url: str = Form(...),
    model: str = Form("whisper"),
    whisper_size: str = Form("large"),
    decoding: str = Form("ctc"),
    lid_model: str = Form("whisper")
):
    """
    Process YouTube video for ASR with automatic language detection
    """
    try:
        # Validate model
        valid_models = ["whisper", "faster_whisper", "ai4bharat"]
        if model not in valid_models:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model. Valid models: {', '.join(valid_models)}"
            )
        
        # Process YouTube URL (language will be auto-detected)
        result = run_asr_with_fallback(
            audio_path=None,
            youtube=youtube_url,
            asr_model=model,
            whisper_size=whisper_size,
            decoding=decoding,
            lid_model=lid_model
        )
        
        if result["success"]:
            return {
                "success": True,
                "transcription": result["transcription"],
                "language": result["language"],
                "language_name": result["language_name"],
                "model_used": result["model_used"],
                "message": "YouTube audio processed successfully"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"ASR processing failed: {result.get('error', 'Unknown error')}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.post("/asr/microphone")
async def process_microphone_audio(
    duration: int = Form(5),
    model: str = Form("whisper"),
    whisper_size: str = Form("large"),
    decoding: str = Form("ctc"),
    lid_model: str = Form("whisper")
):
    """
    Process live microphone audio for ASR with automatic language detection
    """
    try:
        # Validate model
        valid_models = ["whisper", "faster_whisper", "ai4bharat"]
        if model not in valid_models:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model. Valid models: {', '.join(valid_models)}"
            )
        
        # Validate duration
        if duration < 1 or duration > 60:
            raise HTTPException(
                status_code=400,
                detail="Duration must be between 1 and 60 seconds"
            )
        
        # Process microphone audio (language will be auto-detected)
        result = run_asr_with_fallback(
            audio_path=None,
            mic=True,
            duration=duration,
            asr_model=model,
            whisper_size=whisper_size,
            decoding=decoding,
            lid_model=lid_model
        )
        
        if result["success"]:
            return {
                "success": True,
                "transcription": result["transcription"],
                "language": result["language"],
                "language_name": result["language_name"],
                "model_used": result["model_used"],
                "message": "Microphone audio processed successfully"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"ASR processing failed: {result.get('error', 'Unknown error')}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.get("/asr/models")
async def get_available_models():
    """Get list of available ASR models"""
    return {
        "models": [
            {
                "id": "whisper",
                "name": "Whisper",
                "description": "OpenAI's Whisper model",
                "supports_fallback": False
            },
            {
                "id": "faster_whisper",
                "name": "Faster Whisper",
                "description": "Optimized Whisper implementation",
                "supports_fallback": False
            },
            {
                "id": "ai4bharat",
                "name": "AI4Bharat Indic Conformer",
                "description": "Multilingual ASR for Indic languages",
                "supports_fallback": True,
                "fallback_to": "whisper"
            }
        ],
        "message": "Available models retrieved successfully"
    }

# MT Endpoint
@app.post("/mt/translate")
async def mt_translate(payload: dict):
    """Translate text with selectable model and fallback."""
    text = payload.get("text", "")
    src_lang = payload.get("src_lang", "eng_Latn")
    tgt_lang = payload.get("tgt_lang", "hin_Deva")
    model = payload.get("model", "indictrans")  # 'google', 'indictrans', or 'nllb'
    if not text or not tgt_lang:
        raise HTTPException(status_code=400, detail="'text' and 'tgt_lang' are required")
    try:
        translated, model_used = translate_with_fallback(text, src_lang, tgt_lang, primary=model)
        return {
            "success": True,
            "text": text,
            "translation": translated,
            "src_lang": src_lang,
            "tgt_lang": tgt_lang,
            "model_used": model_used,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MT failed: {str(e)}")

# TTS Endpoint
@app.post("/tts/generate")
async def tts_generate(payload: dict):
    """Generate speech from text using selected TTS model."""
    text = payload.get("text", "")
    lang_code = payload.get("lang_code", "eng_Latn")
    model = payload.get("model", "auto")  # 'xtts', 'gtts', 'indic', or 'auto'
    
    if not text:
        raise HTTPException(status_code=400, detail="'text' is required")
    
    try:
        # Determine reference audio path for XTTS (Coqui)
        reference_audio = None
        if model == "xtts" or model == "auto":
            # Use the sample voice from samples folder
            # Try multiple possible paths
            possible_paths = [
                os.path.join("samples", "female_clip.wav"),
                os.path.join("backend", "samples", "female_clip.wav"),
                os.path.join(os.path.dirname(__file__), "samples", "female_clip.wav"),
            ]
            for sample_path in possible_paths:
                if os.path.exists(sample_path):
                    reference_audio = sample_path
                    break
        
        # Generate unique output filename
        import uuid
        out_name = f"tts_{uuid.uuid4().hex[:8]}.wav"
        if model == "gtts":
            out_name = out_name.replace(".wav", ".mp3")
        
        # Ensure output directory exists
        os.makedirs("tts_output", exist_ok=True)
        
        # Generate TTS
        output_path = run_tts(
            text=text,
            lang_code=lang_code,
            reference_audio=reference_audio,
            out_dir="tts_output",
            out_name=out_name,
            prefer=model
        )
        
        # Check if file exists
        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="TTS generation failed - output file not created")
        
        # Extract just the filename for the frontend
        filename = os.path.basename(output_path)
        
        # Return the filename (frontend will fetch it via /tts/audio/{filename})
        return {
            "success": True,
            "audio_path": filename,
            "message": "TTS generated successfully",
            "model_used": model
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@app.get("/tts/audio/{filename:path}")
async def get_tts_audio(filename: str):
    """Serve TTS audio files."""
    audio_path = os.path.join("tts_output", filename)
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    # Determine content type based on extension
    if filename.endswith(".mp3"):
        media_type = "audio/mpeg"
    elif filename.endswith(".wav"):
        media_type = "audio/wav"
    else:
        media_type = "audio/mpeg"
    
    return FileResponse(audio_path, media_type=media_type)