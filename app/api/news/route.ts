import { type NextRequest, NextResponse } from "next/server"
import { fetchTopHeadlines, searchArticles } from "@/lib/api-service"
import { createErrorResponse, sanitizeInput } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const country = searchParams.get("country") || "us"
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const query = searchParams.get("q")

    // Validate inputs
    if (pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ success: false, error: "Page size must be between 1 and 100" }, { status: 400 })
    }

    let articles
    if (query) {
      const sanitizedQuery = sanitizeInput(query)
      articles = await searchArticles(sanitizedQuery, pageSize)
    } else {
      const sanitizedCategory = category ? sanitizeInput(category) : undefined
      articles = await fetchTopHeadlines(sanitizedCategory, country, pageSize)
    }

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch news articles")
  }
}
