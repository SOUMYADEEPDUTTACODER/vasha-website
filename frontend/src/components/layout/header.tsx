import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { username, logout } = useAuth()

  const navigation = [
    { name: "Developer Docs", href: "/docs/dev" },
    { name: "Documentation", href: "/docs/user" },
    { name: "Evaluation Plots", href: "/evaluation-plots" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative" style={{ perspective: 900 }}>
              <div className="relative transform-gpu hover:-translate-y-1 hover:rotate-3 transition-transform duration-300">
                <video
                  src="/logovid.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-12 w-12 object-contain rounded-full shadow-2xl"
                />
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-white/5 to-black/5 shadow-lg -z-10 transform translate-x-1 translate-y-1" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-md">
              VASHA AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative group",
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
                <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {username ? (
              <div className="flex items-center gap-3">
                <span className="font-medium text-primary">{username}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:shadow-glow transition-shadow duration-300"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <AuthDialog defaultTab="login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:shadow-glow transition-shadow duration-300"
                  >
                    Login
                  </Button>
                </AuthDialog>
                <AuthDialog defaultTab="signup">
                  <Button size="sm" className="gradient-primary text-primary-foreground hover:shadow-glow transition-shadow duration-300">
                    Sign Up
                  </Button>
                </AuthDialog>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="border-border/50"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40 animate-in slide-in-from-top-2 duration-300">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded",
                    location.pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border/40">
                {username ? (
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-medium text-primary">{username}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <AuthDialog defaultTab="login">
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </AuthDialog>
                    <AuthDialog defaultTab="signup">
                      <Button size="sm" className="w-full gradient-primary text-primary-foreground">
                        Sign Up
                      </Button>
                    </AuthDialog>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Decorative 3D bar under header */}
      <div className="flex justify-center mt-2">
        <div className="h-2 w-52 rounded-full bg-gradient-to-r from-primary to-accent shadow-2xl transform rotate-1" />
      </div>
    </header>
  )
}