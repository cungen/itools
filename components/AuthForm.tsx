import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { LogIn, UserPlus } from "lucide-react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"

type AuthMode = "signin" | "signup"

interface AuthFormProps {
  onClose?: () => void
}

export function AuthForm({ onClose }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signIn, signUp, error: authError } = useAuth()

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
      setEmailError(null)
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError("Invalid email format")
      return false
    }
    setEmailError(null)
    return true
  }

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError(null)
      return false
    }
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    // Clear error when user starts typing again
    if (emailError) {
      setEmailError(null)
    }
  }

  const handleEmailBlur = () => {
    validateEmail(email)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    // Clear error when user starts typing again
    if (passwordError) {
      setPasswordError(null)
    }
  }

  const handlePasswordBlur = () => {
    validatePassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate before submission
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      setIsSubmitting(false)
      return
    }

    if (mode === "signin") {
      const result = await signIn(email, password)
      if (!result.error && onClose) {
        onClose()
      }
    } else {
      const result = await signUp(email, password)
      if (!result.error && onClose) {
        onClose()
      }
    }

    setIsSubmitting(false)
  }

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin")
    setEmailError(null)
    setPasswordError(null)
  }

  return (
    <div className="relative w-96">
      <div className="flex items-center gap-3 mb-6">
        {mode === "signin" ? (
          <LogIn className="text-blue-400" size={24} />
        ) : (
          <UserPlus className="text-blue-400" size={24} />
        )}
        <h2 className="text-xl font-semibold text-white">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-blue-500/50 hover:bg-white/15 ${
              emailError ? "border-red-400" : ""
            }`}
            placeholder="you@example.com"
            disabled={isSubmitting}
            autoComplete="email"
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-400">{emailError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-blue-500/50 hover:bg-white/15 ${
              passwordError ? "border-red-400" : ""
            }`}
            placeholder="••••••••"
            disabled={isSubmitting}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
          />
          {passwordError && (
            <p className="mt-1 text-sm text-red-400">{passwordError}</p>
          )}
        </div>

        {authError && (
          <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-xl">
            <p className="text-sm text-red-200">{authError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>{mode === "signin" ? "Sign In" : "Sign Up"}</span>
          )}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={switchMode}
            disabled={isSubmitting}
            className="text-sm text-slate-300 hover:text-white"
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </form>
    </div>
  )
}

