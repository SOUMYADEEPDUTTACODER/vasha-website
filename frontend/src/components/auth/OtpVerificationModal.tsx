import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface OtpVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {
    user_id: string;
    email: string;
  } | null;
}

export function OtpVerificationModal({ open, onOpenChange, userData }: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { setUsername } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleVerifyOtp = async () => {
    if (!userData || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userData.user_id,
          otp: otp,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        setUsername(data.username);
        toast({
          title: "Account verified successfully!",
          description: "Welcome to Vasha AI",
        });
        onOpenChange(false);
        navigate("/");
      } else {
        toast({
          title: "Verification failed",
          description: data.detail || "Invalid OTP",
        });
      }
    } catch (error) {
      toast({
        title: "Verification error",
        description: "Network error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/resend-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }),
      });

      if (response.ok) {
        toast({
          title: "OTP resent",
          description: "Check your email for the new OTP",
        });
        setCountdown(300); // 5 minutes countdown
        setOtp(""); // Clear previous OTP
      } else {
        const data = await response.json();
        toast({
          title: "Failed to resend OTP",
          description: data.detail || "Please try again",
        });
      }
    } catch (error) {
      toast({
        title: "Resend error",
        description: "Network error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
                      <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We've sent a 6-digit code to {userData?.email}. Please enter it below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              className="text-center text-lg tracking-widest"
              disabled={isLoading}
            />
          </div>

          <div className="text-sm text-muted-foreground text-center">
            {countdown > 0 ? (
              <span>OTP expires in {formatTime(countdown)}</span>
            ) : (
              <span>OTP expires in 5 minutes</span>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isLoading}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOtp}
              disabled={isLoading || countdown > 0}
              className="w-full"
            >
              {countdown > 0 ? `Resend in ${formatTime(countdown)}` : "Resend OTP"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>Didn't receive the code?</p>
            <p>Check your email inbox or try resending</p>
            <p className="mt-2 font-mono bg-muted p-2 rounded">
              💡 For testing: Check the backend console for OTP
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
