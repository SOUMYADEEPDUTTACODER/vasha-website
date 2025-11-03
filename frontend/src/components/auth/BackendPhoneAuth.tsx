import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Phone, Shield, CheckCircle } from 'lucide-react';
import { toast } from '../ui/use-toast';

interface BackendPhoneAuthProps {
  onVerificationComplete: (phoneNumber: string) => void;
  onError: (error: string) => void;
}

export const BackendPhoneAuth: React.FC<BackendPhoneAuthProps> = ({
  onVerificationComplete,
  onError
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

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
      const response = await fetch('http://localhost:8000/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setCountdown(300); // 5 minutes countdown
        toast({
          title: "OTP Sent Successfully",
          description: `Check the backend console for the OTP code. For testing: The OTP will be logged in the backend terminal.`,
        });
        console.log('OTP sent successfully to backend');
      } else {
        throw new Error(data.detail || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      const errorMessage = err.message || 'Failed to send OTP';
      setError(errorMessage);
      onError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
      const response = await fetch('http://localhost:8000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`,
          otp: otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerified(true);
        toast({
          title: "Phone Verified Successfully",
          description: "Your phone number has been verified!",
        });
        onVerificationComplete(phoneNumber);
      } else {
        throw new Error(data.detail || 'Invalid OTP');
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      const errorMessage = err.message || 'Failed to verify OTP';
      setError(errorMessage);
      onError(errorMessage);
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    setOtp('');
    setOtpSent(false);
    setVerified(false);
    sendOTP();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (verified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Phone Verified Successfully!</h3>
            <p className="text-muted-foreground">
              Your phone number {phoneNumber} has been verified.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                className="text-center text-lg tracking-widest"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
              {countdown > 0 && (
                <p className="text-xs text-muted-foreground">
                  OTP expires in {formatTime(countdown)}
                </p>
              )}
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
                {countdown > 0 ? formatTime(countdown) : 'Resend'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded">
              💡 For testing: Check the backend console for the OTP code
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
