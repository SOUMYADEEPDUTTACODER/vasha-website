import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { PhoneMfaModal } from "@/components/auth/PhoneMfaModal"
import { OtpVerificationModal } from "@/components/auth/OtpVerificationModal"

import { CaptchaField } from "@/components/auth/CaptchaField"

interface SignupFormProps {
  onClose?: () => void
  onLoginClick?: () => void
}

export function SignupForm({ onClose }: SignupFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: ""
  })
  const [captchaValue, setCaptchaValue] = useState("")
  const [captchaValid, setCaptchaValid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)

  const [userData, setUserData] = useState<{
    user_id: string;
    email: string;
  } | null>(null)
  const navigate = useNavigate()
  const { setUsername } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!captchaValid) {
      toast({ 
        title: "Captcha Required", 
        description: "Please complete the captcha verification" 
      })
      return
    }
    
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      
      if (res.ok) {
        if (data.requires_verification) {
          // New flow: Show OTP verification modal
          setUserData({
            user_id: data.user_id,
            email: data.email
          })
          setShowOtpModal(true)
          toast({
            title: "Account created!",
            description: "Please verify your email with the OTP sent to your email.",
          })
        } else {
          // Legacy flow: Direct login
          localStorage.setItem("access_token", data.access_token)
          setUsername(data.username)
          toast({
            title: "Account created successfully!",
            description: "Welcome to Vasha AI",
          })
          onClose?.()
          navigate("/")
        }
      } else {
        toast({ title: "Signup failed", description: data.detail })
      }
    } catch (err) {
      toast({ title: "Signup error", description: "Network error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
        <CardDescription className="text-center">
          Create your account to get started with Vasha AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number (optional)"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <CaptchaField
            value={captchaValue}
            onChange={setCaptchaValue}
            onValidChange={setCaptchaValid}
          />
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 underline">
              Login
            </Link>
          </div>
          <Button 
            type="submit" 
            className="w-full gradient-primary text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="mt-4">
            <PhoneMfaModal />
          </div>
        </form>
      </CardContent>
      
      {/* OTP Verification Modal */}
      <OtpVerificationModal
        open={showOtpModal}
        onOpenChange={setShowOtpModal}
        userData={userData}
      />
      

    </Card>
  )
}