import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase"
import type { User, Session, AuthError } from "@supabase/supabase-js"

const STORAGE_KEY_ACCESS_TOKEN = "supabase_access_token"
const STORAGE_KEY_REFRESH_TOKEN = "supabase_refresh_token"

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load session from Chrome Storage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.get(
            [STORAGE_KEY_ACCESS_TOKEN, STORAGE_KEY_REFRESH_TOKEN],
            async (result) => {
              const accessToken = result[STORAGE_KEY_ACCESS_TOKEN]
              const refreshToken = result[STORAGE_KEY_REFRESH_TOKEN]

              if (accessToken && refreshToken) {
                // Set session in Supabase client
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                })

                if (error) {
                  // Session invalid, clear storage
                  await clearTokens()
                  setUser(null)
                  setSession(null)
                } else if (data.session) {
                  setSession(data.session)
                  setUser(data.user)
                }
              }
              setLoading(false)
            }
          )
        } else {
          // Mock for dev - use localStorage
          const savedSession = localStorage.getItem("supabase_session")
          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession)
              const { data, error } = await supabase.auth.setSession({
                access_token: parsed.access_token,
                refresh_token: parsed.refresh_token,
              })
              if (!error && data.session) {
                setSession(data.session)
                setUser(data.user)
              }
            } catch (e) {
              localStorage.removeItem("supabase_session")
            }
          }
          setLoading(false)
        }
      } catch (err) {
        console.error("Error loading session:", err)
        setError("Failed to load session")
        setLoading(false)
      }
    }

    loadSession()

    // Listen for auth state changes (including token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          setSession(session)
          setUser(session.user)
          await saveTokens(session)
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        await clearTokens()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const saveTokens = async (session: Session) => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({
        [STORAGE_KEY_ACCESS_TOKEN]: session.access_token,
        [STORAGE_KEY_REFRESH_TOKEN]: session.refresh_token,
      })
    } else {
      // Mock for dev
      localStorage.setItem(
        "supabase_session",
        JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        })
      )
    }
  }

  const clearTokens = async () => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.remove([
        STORAGE_KEY_ACCESS_TOKEN,
        STORAGE_KEY_REFRESH_TOKEN,
      ])
    } else {
      // Mock for dev
      localStorage.removeItem("supabase_session")
    }
  }

  const signUp = async (email: string, password: string) => {
    setError(null)
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError("Invalid email format")
        return { error: "Invalid email format" }
      }

      // Validate password length
      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        return { error: "Password must be at least 6 characters" }
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        let errorMessage = signUpError.message
        if (signUpError.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please sign in instead."
        }
        setError(errorMessage)
        return { error: errorMessage }
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        await saveTokens(data.session)
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      )

      if (signInError) {
        let errorMessage = signInError.message
        if (signInError.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password"
        } else if (signInError.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email to confirm your account"
        }
        setError(errorMessage)
        return { error: errorMessage }
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        await saveTokens(data.session)
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        setError(signOutError.message)
        return { error: signOutError.message }
      }

      setSession(null)
      setUser(null)
      await clearTokens()

      return { error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }
}

