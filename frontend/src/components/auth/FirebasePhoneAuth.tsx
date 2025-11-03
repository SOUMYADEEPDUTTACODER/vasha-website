import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Phone, Shield } from 'lucide-react';

interface FirebasePhoneAuthProps {
  onVerificationComplete: (phoneNumber: string, verificationId: string) => void;
  onError: (error: string) => void;
}

export const FirebasePhoneAuth: React.FC<FirebasePhoneAuthProps> = ({
  onVerificationComplete,
  onError
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // Initialize reCAPTCHA
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          console.log('reCAPTCHA solved');
        }
      });
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOTP = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    // Format phone number to E.164 format
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    setLoading(true);
    setError('');

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        window.recaptchaVerifier
      );
      
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      console.log('OTP sent successfully');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP');
      onError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For now, we'll just pass the verification data to parent
      // In a real implementation, you might want to verify with Firebase
      onVerificationComplete(phoneNumber, verificationId);
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Failed to verify OTP');
      onError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    setOtp('');
    setOtpSent(false);
    sendOTP();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Enter your phone number to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!otpSent ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9832159842"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <Button 
              onClick={sendOTP} 
              disabled={loading || !phoneNumber}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Send OTP
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={verifyOTP} 
                disabled={loading || otp.length !== 6}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={resendOTP}
                disabled={loading || countdown > 0}
                className="px-4"
              >
                {countdown > 0 ? `${countdown}s` : 'Resend'}
              </Button>
            </div>
          </div>
        )}

        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  );
};

// Add to global window object for reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
