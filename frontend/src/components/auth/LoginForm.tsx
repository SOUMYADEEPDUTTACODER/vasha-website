import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface LoginFormProps {
  onClose?: () => void
  onSignupClick?: () => void
  onForgotClick?: () => void
}

export function LoginForm({ onClose, onSignupClick, onForgotClick }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUsername } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("access_token", data.access_token)
        setUsername(data.username)
        toast({
          title: "Login successful!",
          description: "Welcome back to Vasha AI",
        })
        setIsLoading(false)
        onClose?.()
        navigate("/") // redirect to home page
      } else {
        toast({ title: "Login failed", description: data.detail })
        setIsLoading(false)
      }
    } catch (err) {
      toast({ title: "Login error", description: "Network error" })
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
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access Vasha AI
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
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              className="text-sm text-blue-600 underline"
              onClick={onForgotClick}
            >
              Forgot password?
            </button>
            <span className="text-sm">
              New here?{" "}
              <Link
                to="/signup"
                className="text-blue-600 underline"
              >
                Sign up
              </Link>
            </span>
          </div>
          <Button 
            type="submit" 
            className="w-full gradient-primary text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}