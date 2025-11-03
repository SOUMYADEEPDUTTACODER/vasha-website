import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "./LoginForm"
import { SignupForm } from "./SignupForm"

interface AuthDialogProps {
  children: React.ReactNode
  defaultTab?: "login" | "signup"
}

export function AuthDialog({ children, defaultTab = "login" }: AuthDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-6">
            <LoginForm onClose={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <SignupForm onClose={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}