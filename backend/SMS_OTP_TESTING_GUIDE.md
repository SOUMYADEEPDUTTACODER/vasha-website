# SMS OTP Testing Guide

## Overview
This guide explains how to test the SMS OTP verification system for user signup.

## Prerequisites
1. Backend server running (`python main.py`)
2. Frontend server running (`npm run dev`)
3. MongoDB running locally

## Testing Steps

### 1. Start the Backend Server
```bash
cd vashafront/backend
python main.py
```

### 2. Test Email Functionality
```bash
python test_email.py
```
This will send a test welcome email to verify email functionality.

### 3. Test Complete OTP Flow
```bash
python test_otp.py
```
This will test the complete signup and OTP verification flow.

### 4. Frontend Testing

#### Step 1: Open the Frontend
- Navigate to your frontend URL (usually `http://localhost:5173`)
- Go to the signup page

#### Step 2: Create a New Account
- Fill in the signup form with:
  - Username: `testuser123`
  - Email: `test@example.com`
  - Phone: `+1234567890`
  - Password: `testpassword123`

#### Step 3: OTP Verification
- After signup, you'll see an OTP verification modal
- Check the **backend console** for the OTP code
- Enter the 6-digit OTP in the frontend
- Click "Verify OTP"

#### Step 4: Account Completion
- Upon successful verification, you'll be logged in
- Check that the user is redirected to the home page

## Backend Console Output

When you sign up, you should see output like this in the backend console:

```
Welcome email sent successfully to test@example.com
SMS OTP for +1234567890: 123456
```

## API Endpoints for Testing

### 1. Signup
```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "testpass123"
  }'
```

### 2. Complete Signup with OTP
```bash
curl -X POST http://localhost:8000/complete-signup \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID_FROM_SIGNUP",
    "otp": "123456"
  }'
```

### 3. Send OTP
```bash
curl -X POST http://localhost:8000/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

### 4. Verify OTP
```bash
curl -X POST http://localhost:8000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "otp": "123456"
  }'
```

### 5. Resend OTP
```bash
curl -X POST http://localhost:8000/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

## Expected Behavior

### Successful Flow
1. User fills signup form
2. Backend creates user account
3. Welcome email is sent
4. OTP is generated and printed to console
5. Frontend shows OTP verification modal
6. User enters OTP from console
7. Account is verified and user is logged in

### Error Scenarios
- **Invalid OTP**: Shows "Invalid OTP" error
- **Expired OTP**: Shows "OTP expired" error (after 5 minutes)
- **Too many attempts**: Shows "Too many attempts" error (after 3 failed attempts)
- **Network error**: Shows "Network error occurred"

## Production Integration

### SMS Service Integration
Replace the console logging with actual SMS service:

```python
# Example with Twilio
from twilio.rest import Client

def send_sms_otp(phone, otp):
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=f"Your Vasha AI verification code is: {otp}",
        from_=twilio_phone,
        to=phone
    )
```

### OTP Storage
Use Redis for production OTP storage:

```python
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Store OTP with expiration
redis_client.setex(f"otp:{phone}", 300, otp)  # 5 minutes

# Retrieve OTP
stored_otp = redis_client.get(f"otp:{phone}")
```

## Troubleshooting

### Common Issues

1. **Backend not running**
   - Error: "Network error occurred"
   - Solution: Start backend with `python main.py`

2. **MongoDB not running**
   - Error: Connection refused
   - Solution: Start MongoDB service

3. **Invalid OTP format**
   - Error: "Invalid OTP"
   - Solution: Use exactly 6 digits

4. **OTP expired**
   - Error: "OTP expired"
   - Solution: Request new OTP using resend function

### Debug Information
- Check backend console for OTP codes
- Check browser network tab for API calls
- Check browser console for JavaScript errors
- Verify MongoDB connection and user creation

## Security Notes

1. **OTP Expiration**: OTPs expire after 5 minutes
2. **Attempt Limits**: Maximum 3 verification attempts per OTP
3. **Rate Limiting**: Consider implementing rate limiting for OTP requests
4. **Phone Validation**: Validate phone number format
5. **Environment Variables**: Use environment variables for sensitive data in production
