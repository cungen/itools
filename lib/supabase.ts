import { createClient } from "@supabase/supabase-js"

// Supabase configuration from environment variables
// These should be set in .env.local for local development
// Support both Plasmo (extension) and Vite (web) environment variable formats

// In Vite, environment variables are available via import.meta.env
// In Plasmo/Node, they're available via process.env
// Vite requires VITE_ prefix, Plasmo requires PLASMO_PUBLIC_ prefix

// Type-safe access to import.meta.env for Vite
const getViteEnv = (key: string): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const value = import.meta.env[key]
      return typeof value === "string" ? value : ""
    }
  } catch {
    // Not in Vite environment
  }
  return ""
}

// Access process.env for Plasmo/Node
const getProcessEnv = (key: string): string => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || ""
  }
  return ""
}

// Try Vite format first (VITE_*), then Plasmo format (PLASMO_PUBLIC_*)
const supabaseUrl =
  getViteEnv("VITE_SUPABASE_URL") ||
  getProcessEnv("VITE_SUPABASE_URL") ||
  getViteEnv("PLASMO_PUBLIC_SUPABASE_URL") ||
  getProcessEnv("PLASMO_PUBLIC_SUPABASE_URL") ||
  ""

const supabaseAnonKey =
  getViteEnv("VITE_SUPABASE_ANON_KEY") ||
  getProcessEnv("VITE_SUPABASE_ANON_KEY") ||
  getViteEnv("PLASMO_PUBLIC_SUPABASE_ANON_KEY") ||
  getProcessEnv("PLASMO_PUBLIC_SUPABASE_ANON_KEY") ||
  ""

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Debug logging to help diagnose env var issues
if (typeof window !== "undefined") {
  try {
    const allEnvKeys = typeof import.meta !== "undefined" && import.meta.env
      ? Object.keys(import.meta.env).filter(key => key.includes("SUPABASE"))
      : []

    const debugInfo = {
      availableEnvKeys: allEnvKeys,
      viteUrlValue: getViteEnv("VITE_SUPABASE_URL") || "NOT_FOUND",
      viteKeyValue: getViteEnv("VITE_SUPABASE_ANON_KEY") ? "FOUND" : "NOT_FOUND",
      plasmoUrlValue: getViteEnv("PLASMO_PUBLIC_SUPABASE_URL") || "NOT_FOUND",
      plasmoKeyValue: getViteEnv("PLASMO_PUBLIC_SUPABASE_ANON_KEY") ? "FOUND" : "NOT_FOUND",
      finalUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "empty",
      finalKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : "empty",
      isConfigured: isSupabaseConfigured,
    }
    console.log("[Supabase Config Debug]", JSON.stringify(debugInfo, null, 2))
  } catch (e) {
    console.warn("[Supabase Config Debug] Error checking env vars:", e)
  }
}

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase URL and/or anon key not configured. Authentication features will not work."
  )
  console.warn(
    "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file"
  )
  console.warn(
    "Note: Vite requires the VITE_ prefix for environment variables to be exposed to client code"
  )
}

// Create a singleton Supabase client instance
// Only create client if properly configured, otherwise use placeholder that won't make requests
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We'll handle session persistence manually via Chrome Storage
        autoRefreshToken: true,
        detectSessionInUrl: false, // Not needed for extension context
      },
    })
  : // Create a mock client that will fail gracefully
    ({
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: { message: "Supabase not configured. Please set environment variables." },
        }),
        signUp: async () => ({
          data: { user: null, session: null },
          error: { message: "Supabase not configured. Please set environment variables." },
        }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        setSession: async () => ({ data: { user: null, session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: { code: "PGRST116", message: "Supabase not configured" },
            }),
          }),
        }),
        upsert: async () => ({
          error: { message: "Supabase not configured. Please set environment variables." },
        }),
      }),
    } as any)

