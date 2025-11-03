#!/usr/bin/env python3
"""
Test script to verify logo embedding in welcome emails
"""

import smtplib, ssl
from email.message import EmailMessage
import base64
import os

# SMTP Configuration
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "vashaaimajor@gmail.com"
SMTP_PASS = "lppo ovti qong ngla"
SMTP_FROM = SMTP_USER

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
            print(f"Logo file not found at: {logo_path}")
            return None
    except Exception as e:
        print(f"Error reading logo: {e}")
        return None

def test_logo_email():
    """Test sending welcome email with logo"""
    
    print("🧪 Testing Logo Email")
    print("=" * 30)
    
    # Test email
    test_email = "soumyadeepattud947@gmail.com"  # Change this to your email for testing
    test_username = "TestUser"
    
    # Get logo
    logo_data = get_logo_base64()
    
    try:
        msg = EmailMessage()
        msg["Subject"] = "Test: Welcome to Vasha AI with Logo 🎉"
        msg["From"] = SMTP_FROM
        msg["To"] = test_email

        msg.set_content(
            f"Hi {test_username},\n\n"
            "This is a test email to verify the logo embedding.\n\n"
            "— The Vasha AI Team"
        )

        # Attach logo and reference by CID
        logo_path = "../frontend/public/logo.png"
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as img:
                msg.add_related(img.read(), maintype='image', subtype='png', cid='logoimg')
            logo_html = '<img src="cid:logoimg" alt="Vasha AI Logo" style="width: 60px; height: 60px; object-fit: contain;">'
        else:
            logo_html = '''
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                        color: white; font-weight: bold; font-size: 18px;">
                VA
            </div>
            '''

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
            <h2 style="color: #333; margin-top: 0;">🎉 Test Email with Logo</h2>
            <p style="color: #555; font-size: 16px;">Hi <strong>{test_username}</strong>,</p>
            <p style="color: #555; font-size: 16px;">This is a test email to verify that the Vasha AI logo is properly embedded in the welcome email.</p>
            
            <!-- Logo Status -->
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📊 Logo Status:</h3>
              <p style="color: #555; font-size: 15px;">
                {'✅ Logo embedded successfully!' if logo_data else '⚠️ Using fallback logo (VA initials)'}
              </p>
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

        # Send email
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        
        print(f"✅ Test email sent successfully to {test_email}")
        print("📧 Check your email to see the logo!")
        
    except Exception as e:
        print(f"❌ Failed to send test email: {str(e)}")

if __name__ == "__main__":
    print("🚀 Testing Logo Email Functionality")
    print("Make sure to update the test_email variable with your email address")
    print()
    
    test_logo_email()
    
    print("\n✅ Test completed!")
