import { type NextRequest, NextResponse } from "next/server"
import { fetchGoogleNewsRSS } from "@/lib/google-news-service"
import { createErrorResponse, sanitizeInput, AppError } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get("topic")

    if (!topic) {
      throw new AppError(400, "Topic parameter is required", "MISSING_TOPIC")
    }

    const sanitizedTopic = sanitizeInput(topic)
    if (!sanitizedTopic) {
      throw new AppError(400, "Invalid topic parameter", "INVALID_TOPIC")
    }

    console.log(`Fetching Google News for topic: ${sanitizedTopic}`)

    const articles = await fetchGoogleNewsRSS(sanitizedTopic)

    return NextResponse.json({
      success: true,
      articles: articles || [],
      total: articles?.length || 0,
      topic: sanitizedTopic,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch Google News")
  }
}
