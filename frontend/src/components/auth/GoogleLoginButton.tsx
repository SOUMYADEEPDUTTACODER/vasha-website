import { Button } from "@/components/ui/button"
import { useGoogleLogin } from "@react-oauth/google"
import { toast } from "@/components/ui/use-toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { API_BASE_URL } from "@/config/api"

interface GoogleLoginButtonProps {
    text?: string
    className?: string
    onSuccess?: () => void
}

export function GoogleLoginButton({ text = "Continue with Google", className, onSuccess }: GoogleLoginButtonProps) {
    const navigate = useNavigate()
    // @ts-ignore
    const { setUsername } = useAuth()

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("Google login success", tokenResponse);
            const accessToken = tokenResponse.access_token;

            try {
                // Send access token to backend
                const res = await fetch(`${API_BASE_URL}/google-auth`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: accessToken }),
                })

                const data = await res.json()

                if (res.ok) {
                    localStorage.setItem("access_token", data.access_token)
                    if (setUsername) {
                        setUsername(data.username)
                    }
                    toast({
                        title: "Login successful!",
                        description: `Welcome back, ${data.username}`,
                    })
                    onSuccess?.()
                    navigate("/")
                } else {
                    console.error("Backend auth failed:", data);
                    toast({ title: "Login failed", description: data.detail || "Google authentication failed on backend" })
                }
            } catch (error: any) {
                console.error("Backend request error:", error)
                toast({
                    title: "Login failed",
                    description: "Could not connect to backend server"
                })
            }
        },
        onError: (error) => {
            console.error("Google login failed:", error);
            toast({
                title: "Login failed",
                description: "Google popup closed or blocked"
            })
        }
    });

    return (
        <Button
            type="button"
            variant="outline"
            className={`w-full relative ${className}`}
            onClick={() => login()}
        >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            {text}
        </Button>
    )
}
