# Vasha AI Authentication Flow

## Overview
This document describes the enhanced authentication system for Vasha AI, which includes:
1. Email confirmation for user signup
2. SMS OTP verification for phone number validation
3. Captcha verification for login security

## Authentication Flow

### 1. User Signup Process

#### Step 1: Initial Registration
- **Endpoint**: `POST /signup`
- **Payload**:
```json
{
  "username": "user123",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "securepassword"
}
```
- **Response**:
```json
{
  "message": "User registered successfully. Please verify your phone number with OTP.",
  "user_id": "507f1f77bcf86cd799439011",
  "phone": "+1234567890",
  "email": "user@example.com",
  "requires_verification": true
}
```

#### Step 2: Welcome Email
- A welcome email is automatically sent to the user's email address
- Email includes HTML and plain text versions
- Sent asynchronously (doesn't block the signup process)

#### Step 3: SMS OTP Generation
- A 6-digit OTP is generated and stored temporarily
- OTP is printed to console (in production, integrate with SMS service)
- OTP expires after 5 minutes
- Maximum 3 verification attempts allowed

#### Step 4: Complete Signup with OTP
- **Endpoint**: `POST /complete-signup`
- **Payload**:
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "otp": "123456"
}
```
- **Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "username": "user123",
  "message": "Account verified successfully"
}
```

### 2. SMS OTP Management

#### Send OTP
- **Endpoint**: `POST /send-otp`
- **Payload**: `{"phone": "+1234567890"}`
- **Response**: `{"message": "OTP sent successfully", "phone": "+1234567890"}`

#### Verify OTP
- **Endpoint**: `POST /verify-otp`
- **Payload**: `{"phone": "+1234567890", "otp": "123456"}`
- **Response**: `{"message": "OTP verified successfully"}`

#### Resend OTP
- **Endpoint**: `POST /resend-otp`
- **Payload**: `{"phone": "+1234567890"}`
- **Response**: `{"message": "OTP resent successfully", "phone": "+1234567890"}`

### 3. Login with Captcha

#### Standard Login
- **Endpoint**: `POST /login`
- **Payload**:
```json
{
  "username": "user123",
  "password": "securepassword"
}
```

#### Login with Captcha Verification
- **Endpoint**: `POST /login-with-captcha`
- **Payload**:
```json
{
  "username": "user123",
  "password": "securepassword",
  "captcha_token": "firebase_recaptcha_token_here"
}
```

#### Verify Captcha Separately
- **Endpoint**: `POST /verify-captcha`
- **Payload**: `{"captcha_token": "firebase_recaptcha_token_here"}`
- **Response**: `{"message": "Captcha verified successfully"}`

## Security Features

### Email Verification
- Welcome emails sent automatically upon signup
- HTML and plain text email formats
- Asynchronous sending to prevent blocking

### SMS OTP Security
- 6-digit numeric OTP
- 5-minute expiration
- Maximum 3 verification attempts
- Temporary storage (in production, use Redis with TTL)

### Captcha Protection
- Firebase reCAPTCHA integration (placeholder)
- Required for login security
- Token validation

## Database Schema

### User Document
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "hashed_string",
  "email_verified": "boolean",
  "phone_verified": "boolean",
  "created_at": "datetime"
}
```

## Production Considerations

### SMS Integration
Replace the console logging with actual SMS service:
- Twilio
- AWS SNS
- MessageBird
- Other SMS providers

### Captcha Integration
Implement Firebase reCAPTCHA verification:
```python
# Example Firebase reCAPTCHA verification
import requests

def verify_recaptcha(token, secret_key):
    response = requests.post(
        'https://www.google.com/recaptcha/api/siteverify',
        data={'secret': secret_key, 'response': token}
    )
    return response.json()['success']
```

### OTP Storage
Use Redis for OTP storage in production:
```python
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Store OTP with expiration
redis_client.setex(f"otp:{phone}", 300, otp)  # 5 minutes

# Retrieve OTP
stored_otp = redis_client.get(f"otp:{phone}")
```

## Testing

### Test Email Functionality
Run the test script:
```bash
python test_email.py
```

### Test OTP Generation
The OTP will be printed to console during signup process.

## Error Handling

### Common Error Responses
- `400`: Invalid input data
- `401`: Authentication failed
- `404`: User not found
- `409`: User already exists

### Email Failures
- Email sending failures don't block signup
- Errors are logged to console
- User can still complete signup process

### OTP Failures
- Expired OTP: "OTP expired"
- Invalid OTP: "Invalid OTP"
- Too many attempts: "Too many attempts"
- OTP not found: "OTP not found or expired"
