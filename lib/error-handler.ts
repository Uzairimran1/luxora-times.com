import { NextResponse } from "next/server"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function createErrorResponse(error: unknown, defaultMessage = "Internal server error"): NextResponse {
  console.error("API Error:", error)

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode },
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: defaultMessage,
      timestamp: new Date().toISOString(),
    },
    { status: 500 },
  )
}

export function validateRequestData(data: any, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (!data || data[field] === undefined || data[field] === null || data[field] === "") {
      throw new AppError(400, `Missing or invalid required field: ${field}`, "VALIDATION_ERROR")
    }
  }
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return ""
  return input.trim().replace(/[<>]/g, "")
}
