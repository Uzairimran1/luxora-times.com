import type { Article } from "@/types/news"
import { getOptimizedImageUrl } from "./image-utils"

// Function to search news using Oxylabs API
export async function searchOxylabsNews(query: string, count = 10): Promise<Article[]> {
  try {
    // Structure payload for Oxylabs
    const payload = {
      source: "google_search",
      domain: "nl",
      query: query,
      parse: true,
      context: [{ key: "tbm", value: "nws" }],
    }

    // Get response from our API proxy to protect credentials
    const response = await fetch("/api/oxylabs-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Oxylabs API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the Oxylabs response to our Article format
    if (data.results && data.results.length > 0 && data.results[0].content && data.results[0].content.news_results) {
      const newsResults = data.results[0].content.news_results

      return newsResults.slice(0, count).map((item: any, index: number) => {
        // Extract date from the timestamp
        const publishedDate = item.date ? new Date(item.date).toISOString() : new Date().toISOString()

        return {
          id: `oxylabs-${query}-${index}-${Date.now()}`,
          title: item.title || "Untitled Article",
          description: item.snippet || "",
          content: item.snippet || "",
          url: item.url || "",
          imageUrl: getOptimizedImageUrl(item.thumbnail || ""),
          publishedAt: publishedDate,
          source: item.source || "News Source",
          category: "news",
        }
      })
    }

    return []
  } catch (error) {
    console.error("Error fetching news from Oxylabs:", error)
    return []
  }
}
