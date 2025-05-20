import { NextResponse } from "next/server"
import { clearCache } from "@/lib/api-service"

export async function POST() {
  try {
    clearCache()

    return NextResponse.json({
      status: "success",
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error clearing cache:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to clear cache",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
