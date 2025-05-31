import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createErrorResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({
        success: false,
        user: null,
        session: null,
      })
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({
        success: false,
        user: null,
        session: null,
      })
    }

    // Fetch user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return NextResponse.json({
      success: true,
      user,
      profile,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to validate session")
  }
}
