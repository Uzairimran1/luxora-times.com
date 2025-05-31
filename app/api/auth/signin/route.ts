import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createErrorResponse, validateRequestData, sanitizeInput, AppError } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    validateRequestData(body, ["email", "password"])

    const email = sanitizeInput(body.email).toLowerCase()
    const password = body.password

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new AppError(400, "Invalid email format", "INVALID_EMAIL")
    }

    if (password.length < 6) {
      throw new AppError(400, "Password must be at least 6 characters", "WEAK_PASSWORD")
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS")
      }
      throw new AppError(400, error.message, "AUTH_ERROR")
    }

    // Fetch user profile
    let profile = null
    if (data.user) {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

      profile = profileData
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      profile,
      message: "Successfully signed in",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return createErrorResponse(error, "Sign in failed")
  }
}
