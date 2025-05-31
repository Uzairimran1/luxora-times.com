"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase, type UserProfile } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshSession: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSupabaseInitialized, setIsSupabaseInitialized] = useState(false)
  const { toast } = useToast()

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!isSupabaseInitialized) return

      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error)
          return
        }

        if (data) {
          setProfile(data as UserProfile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    },
    [isSupabaseInitialized],
  )

  const refreshSession = useCallback(async () => {
    if (!isSupabaseInitialized) return

    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)
        return
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        await fetchProfile(data.session.user.id)
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
    }
  }, [isSupabaseInitialized, fetchProfile])

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user || !isSupabaseInitialized) {
        throw new Error("User not authenticated")
      }

      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) {
          throw error
        }

        // Update local profile state
        setProfile((prev) => (prev ? { ...prev, ...updates } : null))

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } catch (error: any) {
        toast({
          title: "Update failed",
          description: error.message || "Failed to update profile.",
          variant: "destructive",
        })
        throw error
      }
    },
    [user, isSupabaseInitialized, toast],
  )

  useEffect(() => {
    const checkSupabaseInitialization = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error && error.message.includes("not initialized")) {
          setIsSupabaseInitialized(false)
          setIsLoading(false)
          console.error("Supabase is not initialized. Check your environment variables.")
          toast({
            title: "Configuration Error",
            description: "Authentication service is not properly configured.",
            variant: "destructive",
          })
          return
        }

        setIsSupabaseInitialized(true)
        setSession(data.session)
        setUser(data.session?.user ?? null)

        if (data.session?.user) {
          await fetchProfile(data.session.user.id)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error checking Supabase initialization:", error)
        setIsSupabaseInitialized(false)
        setIsLoading(false)
      }
    }

    checkSupabaseInitialization()
  }, [fetchProfile, toast])

  useEffect(() => {
    if (!isSupabaseInitialized) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      if (event === "SIGNED_OUT") {
        setProfile(null)
        // Clear any cached data
        localStorage.removeItem("luxora-times-saved-articles")
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isSupabaseInitialized, fetchProfile])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseInitialized) {
      toast({
        title: "Authentication Error",
        description: "Authentication service is not properly configured.",
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
      let errorMessage = "An error occurred during sign in."

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password."
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account."
      }

      toast({
        title: "Sign in failed",
        description: errorMessage,
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
        description: "Authentication service is not properly configured.",
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
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email,
            username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      })
    } catch (error: any) {
      let errorMessage = "An error occurred during sign up."

      if (error.message.includes("already registered")) {
        errorMessage = "An account with this email already exists."
      } else if (error.message.includes("Password should be")) {
        errorMessage = "Password must be at least 6 characters long."
      }

      toast({
        title: "Sign up failed",
        description: errorMessage,
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

      setUser(null)
      setProfile(null)
      setSession(null)

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
        description: "Authentication service is not properly configured.",
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
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
    updateProfile,
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
