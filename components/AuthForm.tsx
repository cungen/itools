import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { LogIn, UserPlus, X } from "lucide-react"

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
    validateEmail(value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    validatePassword(value)
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
    <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg w-96">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      )}

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
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${
              emailError
                ? "border-red-400"
                : "border-white/20 hover:bg-white/15"
            }`}
            placeholder="you@example.com"
            disabled={isSubmitting}
            autoComplete="email"
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-400">{emailError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={`block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${
              passwordError
                ? "border-red-400"
                : "border-white/20 hover:bg-white/15"
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

        <button
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>{mode === "signin" ? "Sign In" : "Sign Up"}</span>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={switchMode}
            disabled={isSubmitting}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  )
}

