import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createErrorResponse, validateRequestData, sanitizeInput, AppError } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    validateRequestData(body, ["email", "password", "username"])

    const email = sanitizeInput(body.email).toLowerCase()
    const password = body.password
    const username = sanitizeInput(body.username)

    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new AppError(400, "Invalid email format", "INVALID_EMAIL")
    }

    if (password.length < 6) {
      throw new AppError(400, "Password must be at least 6 characters", "WEAK_PASSWORD")
    }

    if (username.length < 2) {
      throw new AppError(400, "Username must be at least 2 characters", "INVALID_USERNAME")
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("email").eq("email", email).single()

    if (existingUser) {
      throw new AppError(409, "User with this email already exists", "USER_EXISTS")
    }

    // Check if username is taken
    const { data: existingUsername } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single()

    if (existingUsername) {
      throw new AppError(409, "Username is already taken", "USERNAME_TAKEN")
    }

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
      throw new AppError(400, error.message, "SIGNUP_ERROR")
    }

    // Create profile
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
        // Don't fail the request if profile creation fails
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: "Account created successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return createErrorResponse(error, "Sign up failed")
  }
}
