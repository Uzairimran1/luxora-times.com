"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase, type UserProfile } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseInitialized, setIsSupabaseInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if Supabase is initialized by making a test call
    const checkSupabaseInitialization = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error && error.message.includes("not initialized")) {
          setIsSupabaseInitialized(false)
          setIsLoading(false)
          console.error("Supabase is not initialized. Check your environment variables.")
          toast({
            title: "Configuration Error",
            description: "Authentication service is not properly configured. Please check your environment variables.",
            variant: "destructive",
          })
        } else {
          setIsSupabaseInitialized(true)
          setSession(data.session)
          setUser(data.session?.user ?? null)
          if (data.session?.user) {
            fetchProfile(data.session.user.id)
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error checking Supabase initialization:", error)
        setIsSupabaseInitialized(false)
        setIsLoading(false)
      }
    }

    checkSupabaseInitialization()
  }, [toast])

  useEffect(() => {
    if (!isSupabaseInitialized) return

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isSupabaseInitialized])

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseInitialized) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        throw error
      }

      if (data) {
        setProfile(data as UserProfile)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseInitialized) {
      toast({
        title: "Authentication Error",
        description: "Authentication service is not properly configured. Please check your environment variables.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        throw error
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    if (!isSupabaseInitialized) {
      toast({
        title: "Authentication Error",
        description: "Authentication service is not properly configured. Please check your environment variables.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create a profile record
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email,
            username,
            created_at: new Date().toISOString(),
          },
        ])

        if (profileError) {
          throw profileError
        }
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email for verification.",
      })
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    if (!isSupabaseInitialized) return

    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseInitialized) {
      toast({
        title: "Authentication Error",
        description: "Authentication service is not properly configured. Please check your environment variables.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for a password reset link.",
      })
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred during password reset.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
