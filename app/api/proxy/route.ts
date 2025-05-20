import { type NextRequest, NextResponse } from "next/server"

// Cache for storing proxied content
const proxyCache: Record<string, { data: string; timestamp: number }> = {}
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Check cache
    const cacheKey = `proxy-${url}`
    const cachedData = proxyCache[cacheKey]

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return new NextResponse(cachedData.data, {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    // Fetch the content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch content: ${response.status}` }, { status: response.status })
    }

    const content = await response.text()

    // Cache the result
    proxyCache[cacheKey] = {
      data: content,
      timestamp: Date.now(),
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy content" }, { status: 500 })
  }
}
