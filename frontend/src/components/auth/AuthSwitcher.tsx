import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { SignupForm } from "./SignupForm"

export function AuthSwitcher({ onClose }: { onClose?: () => void }) {
  const [view, setView] = useState<"login" | "signup">("login")

  return (
    <>
      {view === "login" && (
        <LoginForm
          onClose={onClose}
          onSignupClick={() => setView("signup")}
          onForgotClick={() => alert("Forgot password functionality here.")}
        />
      )}
      {view === "signup" && (
        <SignupForm
          onClose={onClose}
          onLoginClick={() => setView("login")}
        />
      )}
    </>
  )
}