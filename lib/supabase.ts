import { createClient } from "@supabase/supabase-js"

// Check if we're running on the client side
const isBrowser = typeof window !== "undefined"

// Get environment variables with fallbacks to prevent errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Only initialize the client if we have the required values
let supabaseClient: ReturnType<typeof createClient> | null = null

if (isBrowser && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

// Export a safe version of the client that checks if it's initialized
export const supabase = {
  auth: {
    getSession: async () => {
      if (!supabaseClient) {
        console.error("Supabase client not initialized. Check your environment variables.")
        return { data: { session: null }, error: new Error("Supabase client not initialized") }
      }
      return supabaseClient.auth.getSession()
    },
    onAuthStateChange: (...args: any[]) => {
      if (!supabaseClient) {
        console.error("Supabase client not initialized. Check your environment variables.")
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
      return supabaseClient.auth.onAuthStateChange(...args)
    },
    signInWithPassword: async (...args: any[]) => {
      if (!supabaseClient) {
        console.error("Supabase client not initialized. Check your environment variables.")
        return { data: { user: null, session: null }, error: new Error("Supabase client not initialized") }
      }
      return supabaseClient.auth.signInWithPassword(...args)
    },
    signUp: async (...args: any[]) => {
      if (!supabaseClient) {
        console.error("Supabase client not initialized. Check your environment variables.")
        return { data: { user: null, session: null }, error: new Error("Supabase client not initialized") }
      }
      return supabaseClient.auth.signUp(...args)
    },
    signOut: async () => {
      if (!supabaseClient) {
        console.error("Supabase client not initialized. Check your environment variables.")
        return { error: new Error("Supabase client not initialized") }
      }
      return supabaseClient.auth.signOut()
    },
    resetPasswordForEmail: async (...args: any[]) => {
      if (!supabaseClient) {
        console.error("Supabase client not initialized. Check your environment variables.")
        return { error: new Error("Supabase client not initialized") }
      }
      return supabaseClient.auth.resetPasswordForEmail(...args)
    },
    updateUser: async (...args: any[]) => {
      if (!supabaseClient) {
        console.error("Supabase client not initialized. Check your environment variables.")
        return { data: { user: null }, error: new Error("Supabase client not initialized") }
      }
      return supabaseClient.auth.updateUser(...args)
    },
  },
  from: (table: string) => {
    if (!supabaseClient) {
      console.error("Supabase client not initialized. Check your environment variables.")
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error("Supabase client not initialized") }),
            maybeSingle: async () => ({ data: null, error: new Error("Supabase client not initialized") }),
          }),
          order: () => ({ data: [], error: new Error("Supabase client not initialized") }),
        }),
        insert: () => ({ error: new Error("Supabase client not initialized") }),
        update: () => ({ eq: () => ({ error: new Error("Supabase client not initialized") }) }),
        delete: () => ({ eq: () => ({ error: new Error("Supabase client not initialized") }) }),
      }
    }
    return supabaseClient.from(table)
  },
  storage: {
    from: (bucket: string) => {
      if (!supabaseClient) {
        console.error("Supabase client not initialized. Check your environment variables.")
        return {
          upload: async () => ({ error: new Error("Supabase client not initialized") }),
          getPublicUrl: () => ({ data: null }),
        }
      }
      return supabaseClient.storage.from(bucket)
    },
  },
}

export type UserProfile = {
  id: string
  email: string
  username?: string
  avatar_url?: string
  created_at: string
}

export type SavedArticleRecord = {
  id: string
  user_id: string
  article_id: string
  article_data: string
  created_at: string
}
