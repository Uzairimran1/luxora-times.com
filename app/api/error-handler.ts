import { NextResponse } from "next/server"

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, success: false }, { status: error.statusCode })
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }

  return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
}

export function validateRequest(data: any, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ApiError(400, `Missing required field: ${field}`)
    }
  }
}
