#!/usr/bin/env python3
"""
Test script for the new email-based signup flow
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_email_signup():
    """Test the complete email signup flow"""
    
    print("🧪 Testing Email-Based Signup Flow")
    print("=" * 50)
    
    # Test data
    signup_data = {
        "username": "testuser_email",
        "email": "test@example.com",
        "phone": "+919832159842",  # Optional
        "password": "testpass123"
    }
    
    print(f"📝 Signing up user: {signup_data['username']}")
    print(f"📧 Email: {signup_data['email']}")
    print(f"📱 Phone: {signup_data['phone']}")
    
    # Step 1: Signup
    try:
        response = requests.post(f"{BASE_URL}/signup", json=signup_data)
        print(f"✅ Signup Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Signup successful!")
            print(f"📋 User ID: {data.get('user_id')}")
            print(f"📧 Email: {data.get('email')}")
            print(f"💬 Message: {data.get('message')}")
            
            user_id = data.get('user_id')
            
            # Step 2: Check backend console for OTP
            print("\n🔍 Check the backend console for the OTP code!")
            print("💡 Look for: '✅ Email verification OTP sent to test@example.com: XXXXXX'")
            
            # Wait for user to check console
            input("\n⏳ Press Enter after you see the OTP in the backend console...")
            
            # Step 3: Complete signup with OTP
            otp = input("🔢 Enter the OTP from console: ").strip()
            
            complete_data = {
                "user_id": user_id,
                "otp": otp
            }
            
            print(f"\n🔐 Completing signup with OTP: {otp}")
            complete_response = requests.post(f"{BASE_URL}/complete-signup", json=complete_data)
            
            if complete_response.status_code == 200:
                complete_data = complete_response.json()
                print(f"✅ Account verified successfully!")
                print(f"👤 Username: {complete_data.get('username')}")
                print(f"🔑 Access Token: {complete_data.get('access_token')[:20]}...")
                print(f"💬 Message: {complete_data.get('message')}")
                
                # Step 4: Test login
                print(f"\n🔑 Testing login with verified account...")
                login_data = {
                    "username": signup_data["username"],
                    "password": signup_data["password"]
                }
                
                login_response = requests.post(f"{BASE_URL}/login", json=login_data)
                
                if login_response.status_code == 200:
                    login_result = login_response.json()
                    print(f"✅ Login successful!")
                    print(f"👤 Username: {login_result.get('username')}")
                    print(f"🔑 Access Token: {login_result.get('access_token')[:20]}...")
                else:
                    print(f"❌ Login failed: {login_response.text}")
                
            else:
                print(f"❌ Verification failed: {complete_response.text}")
                
        else:
            print(f"❌ Signup failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure the backend server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_resend_email_otp():
    """Test resending email OTP"""
    
    print("\n🔄 Testing Resend Email OTP")
    print("=" * 30)
    
    resend_data = {
        "email": "test@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/resend-email-otp", json=resend_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Email OTP resent successfully!")
            print(f"📧 Email: {data.get('email')}")
            print(f"💬 Message: {data.get('message')}")
            print("🔍 Check backend console for new OTP")
        else:
            print(f"❌ Resend failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Email Signup Flow Test")
    print("Make sure your backend server is running: python main.py")
    print()
    
    # Test main signup flow
    test_email_signup()
    
    # Test resend functionality
    test_resend_email_otp()
    
    print("\n✅ Test completed!")
