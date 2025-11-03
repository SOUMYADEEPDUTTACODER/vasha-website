#!/usr/bin/env python3
"""
Test script to verify email functionality
"""

import smtplib
import ssl
from email.message import EmailMessage

# SMTP Configuration
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "vashaaimajor@gmail.com"
SMTP_PASS = "lppo ovti qong ngla"

def test_email_send():
    """Test sending a welcome email"""
    try:
        msg = EmailMessage()
        msg["Subject"] = "Test Welcome Email from Vasha AI 🎉"
        msg["From"] = SMTP_USER
        msg["To"] = "soumyadeepattud947@gmail.com"  # Test recipient

        msg.set_content(
            "Hi Test User,\n\n"
            "Welcome to Vasha AI! We're excited to have you on board.\n\n"
            "You can sign in anytime and start chatting.\n\n"
            "— The Vasha AI Team"
        )

        html = """
        <div style="font-family: Arial, sans-serif; line-height:1.6">
          <h2>Welcome to Vasha AI 🎉</h2>
          <p>Hi Test User,</p>
          <p>We're excited to have you on board. You can sign in anytime and start chatting.</p>
          <p>— The Vasha AI Team</p>
        </div>
        """
        msg.add_alternative(html, subtype="html")

        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        
        print("✅ Test email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to send test email: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing email functionality...")
    test_email_send()
