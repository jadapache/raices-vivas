import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './types'

// Validate environment variables only on client side
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
}

// Create a singleton client to prevent multiple instances
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createClient() {
  // Always create a new client for server-side rendering
  if (typeof window === 'undefined') {
    return createClientComponentClient<Database>()
  }

  // Use singleton pattern for client-side
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}

// Export a function to get a fresh client if needed
export function createFreshClient() {
  return createClientComponentClient<Database>()
}
