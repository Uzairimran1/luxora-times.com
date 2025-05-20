import { type NextRequest, NextResponse } from "next/server"
import { fetchGoogleNewsRSS } from "@/lib/google-news-service"

export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get("topic") || "world news"
    console.log(`API route called with topic: ${topic}`)

    const articles = await fetchGoogleNewsRSS(topic)
    console.log(`Fetched ${articles.length} articles`)

    // Return the articles in the expected format
    return NextResponse.json({ articles })
  } catch (error) {
    console.error("Error in Google News API:", error)
    return NextResponse.json({ error: "Failed to fetch Google News", articles: [] }, { status: 500 })
  }
}
