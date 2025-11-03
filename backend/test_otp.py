#!/usr/bin/env python3
"""
Test script to demonstrate SMS OTP functionality
"""

import requests
import json

# Backend API URL (adjust if needed)
BASE_URL = "http://localhost:8000"

def test_signup_flow():
    """Test the complete signup flow with OTP verification"""
    
    print("🧪 Testing SMS OTP Signup Flow")
    print("=" * 50)
    
    # Step 1: User signup
    signup_data = {
        "username": "testuser123",
        "email": "test@example.com",
        "phone": "+919832159842",
        "password": "testpassword123"
    }
    
    print("1. Creating user account...")
    try:
        response = requests.post(f"{BASE_URL}/signup", json=signup_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Signup successful!")
            print(f"   User ID: {result['user_id']}")
            print(f"   Phone: {result['phone']}")
            print(f"   Message: {result['message']}")
            
            # The OTP should be printed in the backend console
            print(f"   📱 Check backend console for OTP: SMS OTP for {result['phone']}")
            
            return result
        else:
            print(f"❌ Signup failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Signup error: {str(e)}")
        return None

def test_otp_verification(user_id, phone):
    """Test OTP verification"""
    
    print("\n2. Testing OTP verification...")
    
    # For testing, we'll use a dummy OTP (in real scenario, user gets it via SMS)
    test_otp = "123456"  # This should match what's printed in backend console
    
    verify_data = {
        "user_id": user_id,
        "otp": test_otp
    }
    
    try:
        response = requests.post(f"{BASE_URL}/complete-signup", json=verify_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ OTP verification successful!")
            print(f"   Access Token: {result['access_token'][:50]}...")
            print(f"   Username: {result['username']}")
            print(f"   Message: {result['message']}")
            return result
        else:
            print(f"❌ OTP verification failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ OTP verification error: {str(e)}")
        return None

def test_standalone_otp():
    """Test standalone OTP sending and verification"""
    
    print("\n3. Testing standalone OTP functionality...")
    
    phone = "+1234567890"
    
    # Send OTP
    print("   Sending OTP...")
    try:
        response = requests.post(f"{BASE_URL}/send-otp", json={"phone": phone})
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ OTP sent: {result['message']}")
            print(f"   📱 Check backend console for OTP: SMS OTP for {phone}")
            
            # Test verification with dummy OTP
            test_otp = "123456"
            verify_response = requests.post(f"{BASE_URL}/verify-otp", json={
                "phone": phone,
                "otp": test_otp
            })
            
            if verify_response.status_code == 200:
                print(f"   ✅ OTP verification successful!")
            else:
                print(f"   ❌ OTP verification failed: {verify_response.text}")
                
        else:
            print(f"   ❌ Failed to send OTP: {response.text}")
    except Exception as e:
        print(f"   ❌ OTP test error: {str(e)}")

def main():
    print("🚀 SMS OTP Testing Suite")
    print("=" * 50)
    
    # Test 1: Complete signup flow
    signup_result = test_signup_flow()
    
    if signup_result:
        # Test 2: OTP verification
        test_otp_verification(signup_result['user_id'], signup_result['phone'])
    
    # Test 3: Standalone OTP
    test_standalone_otp()
    
    print("\n" + "=" * 50)
    print("📋 Instructions for testing:")
    print("1. Start the backend server: python main.py")
    print("2. Run this test script: python test_otp.py")
    print("3. Check the backend console for OTP codes")
    print("4. Use the OTP codes shown in console for verification")

if __name__ == "__main__":
    main()
