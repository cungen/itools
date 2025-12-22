import { createClient } from "@supabase/supabase-js"

// Supabase configuration from environment variables
// These should be set in .env.local for local development
const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL and/or anon key not configured. Authentication features will not work."
  )
}

// Create a singleton Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We'll handle session persistence manually via Chrome Storage
    autoRefreshToken: true,
    detectSessionInUrl: false, // Not needed for extension context
  },
})

