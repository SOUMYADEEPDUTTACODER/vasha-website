# 🔥 Firebase Phone Authentication Setup Guide

## Overview
This guide will help you set up Firebase Phone Authentication for SMS OTP verification in your Vasha AI application.

## 🚀 **Step 1: Create Firebase Project**

### 1.1 Go to Firebase Console
- Visit [Firebase Console](https://console.firebase.google.com/)
- Click **"Create a project"** or **"Add project"**

### 1.2 Project Setup
- **Project name**: `vasha-ai` (or your preferred name)
- **Enable Google Analytics**: Optional (recommended)
- Click **"Create project"**

## 📱 **Step 2: Enable Phone Authentication**

### 2.1 Navigate to Authentication
- In Firebase Console, go to **Authentication**
- Click **"Get started"**

### 2.2 Enable Phone Provider
- Click **"Sign-in method"** tab
- Find **"Phone"** in the list
- Click **"Enable"**
- **Save** the changes

### 2.3 Configure Phone Auth (Optional)
- **Test phone numbers**: Add your test phone numbers
- **SMS template**: Customize the SMS message if needed

## 🔧 **Step 3: Get Firebase Config**

### 3.1 Project Settings
- Click the **gear icon** (⚙️) next to "Project Overview"
- Select **"Project settings"**

### 3.2 Web App Configuration
- Scroll down to **"Your apps"** section
- Click **"Add app"** → **"Web"** (</>) icon
- **App nickname**: `vasha-ai-web`
- **Register app**

### 3.3 Copy Configuration
You'll get a config object like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "vasha-ai.firebaseapp.com",
  projectId: "vasha-ai",
  storageBucket: "vasha-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 📝 **Step 4: Update Frontend Configuration**

### 4.1 Update Firebase Config
Replace the placeholder in `vashafront/frontend/src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4.2 Install Firebase Dependencies
```bash
cd vashafront/frontend
npm install firebase
```

## 🎯 **Step 5: Test Phone Authentication**

### 5.1 Start Backend
```bash
cd vashafront/backend
python main.py
```

### 5.2 Start Frontend
```bash
cd vashafront/frontend
npm run dev
```

### 5.3 Test the Flow
1. Go to your app
2. Try signing up with a phone number
3. Firebase will send an SMS (if you're in test mode, use test numbers)

## 🔒 **Step 6: Security Rules (Optional)**

### 6.1 Firebase Security Rules
In Firebase Console → **Firestore Database** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 💰 **Step 6: Pricing & Limits**

### Free Tier Limits:
- **10,000 phone verifications per month**
- **No cost for basic usage**
- **Automatic SMS delivery**

### Paid Tier:
- **$0.01 per verification** after free tier
- **No setup fees**
- **Pay only for what you use**

## 🚨 **Important Notes**

### 6.1 Test Mode
- **Default**: Only test phone numbers work
- **Production**: Enable for all users in Firebase Console

### 6.2 Phone Number Format
- **Always use E.164 format**: `+91XXXXXXXXXX`
- **Include country code**: `+91` for India

### 6.3 reCAPTCHA
- **Automatic**: Firebase handles reCAPTCHA
- **Invisible**: No user interaction required
- **Security**: Prevents abuse

## 🔧 **Troubleshooting**

### Common Issues:

#### 1. "reCAPTCHA not solved"
- **Solution**: Make sure reCAPTCHA is properly initialized
- **Check**: Browser console for errors

#### 2. "Invalid phone number"
- **Solution**: Use E.164 format (`+91XXXXXXXXXX`)
- **Check**: Country code is included

#### 3. "SMS not received"
- **Solution**: Check if number is in test mode
- **Check**: Firebase Console → Authentication → Phone → Test numbers

#### 4. "Firebase not initialized"
- **Solution**: Check Firebase config in `firebase.ts`
- **Check**: All required fields are filled

## 📞 **Support**

### Firebase Support:
- [Firebase Documentation](https://firebase.google.com/docs/auth)
- [Firebase Community](https://firebase.google.com/community)

### Phone Auth Specific:
- [Phone Auth Guide](https://firebase.google.com/docs/auth/web/phone-auth)
- [Troubleshooting](https://firebase.google.com/docs/auth/web/phone-auth#troubleshooting)

## ✅ **Next Steps**

1. **Set up Firebase project** ✅
2. **Enable Phone Authentication** ✅
3. **Update frontend config** ✅
4. **Test the integration** ✅
5. **Deploy to production** 🚀

---

**🎉 Congratulations!** You now have Firebase Phone Authentication working with your Vasha AI app!
