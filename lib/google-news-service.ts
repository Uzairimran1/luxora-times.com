import type { Article } from "@/types/news"
import { v4 as uuidv4 } from "uuid"
import { parseStringPromise } from "xml2js"

// Cache for storing fetched RSS feeds to avoid redundant requests
const rssCache: Record<string, { data: Article[]; timestamp: number }> = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function fetchGoogleNewsRSS(topic: string): Promise<Article[]> {
  try {
    // Check if we have a valid cached response
    const cacheKey = `google-news-${topic}`
    const cachedData = rssCache[cacheKey]

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log(`Using cached Google News data for topic: ${topic}`)
      return cachedData.data
    }

    // Encode the topic for URL
    const encodedTopic = encodeURIComponent(topic)
    const url = `https://news.google.com/rss/search?q=${encodedTopic}&hl=en-US&gl=US&ceid=US:en`

    console.log(`Fetching Google News RSS from: ${url}`)
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      cache: "no-store", // Disable cache for development
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`)
    }

    const xmlData = await response.text()
    console.log(`Received XML data of length: ${xmlData.length}`)

    const result = await parseStringPromise(xmlData, { explicitArray: false })

    if (!result.rss || !result.rss.channel || !result.rss.channel.item) {
      console.error("Invalid RSS feed format:", result)
      throw new Error("Invalid RSS feed format")
    }

    // Ensure items is always an array
    const items = Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [result.rss.channel.item]
    console.log(`Parsed ${items.length} items from RSS feed`)

    const articles: Article[] = items.map((item: any) => {
      // Extract source from the title if possible
      let title = item.title || "No title"
      let source = "Google News"

      // Google News format is typically "Title - Source"
      const titleParts = title.split(" - ")
      if (titleParts.length > 1) {
        title = titleParts[0].trim()
        source = titleParts[titleParts.length - 1].trim()
      }

      // Parse the publication date
      let publishedAt = new Date().toISOString()
      try {
        if (item.pubDate) {
          publishedAt = new Date(item.pubDate).toISOString()
        }
      } catch (e) {
        console.error("Error parsing date:", e)
      }

      // Extract image from description if possible
      const imageUrl = extractImageFromDescription(item.description || "")

      return {
        id: uuidv4(),
        title,
        description: cleanDescription(item.description || "No description available"),
        content: item.description || "No content available",
        url: item.link || "",
        imageUrl,
        publishedAt,
        source,
        category: topic,
        // Add a flag to identify Google News articles
        isGoogleNews: true,
      }
    })

    // Cache the results
    rssCache[cacheKey] = {
      data: articles,
      timestamp: Date.now(),
    }

    return articles
  } catch (error) {
    console.error("Error fetching Google News RSS:", error)
    // Return fallback data in case of error
    return getFallbackArticles(topic)
  }
}

// Helper function to extract image URL from HTML description
function extractImageFromDescription(description: string): string {
  try {
    // Look for image tags in the description
    const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }

    // Look for image URLs in the description
    const urlMatch = description.match(/(https?:\/\/[^"\s]+\.(?:jpg|jpeg|png|gif))/i)
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1]
    }

    return ""
  } catch (e) {
    console.error("Error extracting image from description:", e)
    return ""
  }
}

// Helper function to clean HTML from description
function cleanDescription(description: string): string {
  try {
    // Remove HTML tags
    return description.replace(/<[^>]*>?/gm, "").trim()
  } catch (e) {
    console.error("Error cleaning description:", e)
    return description
  }
}

// Fallback articles in case the API fails
function getFallbackArticles(topic: string): Article[] {
  return [
    {
      id: "fallback-1",
      title: "Global Markets See Significant Gains Amid Economic Recovery",
      description:
        "Stock markets around the world are experiencing substantial growth as economic indicators show strong recovery trends.",
      content:
        "Stock markets around the world are experiencing substantial growth as economic indicators show strong recovery trends.",
      url: "https://example.com/news/1",
      imageUrl: "",
      publishedAt: new Date().toISOString(),
      source: "Financial Times",
      category: topic,
      isGoogleNews: true,
    },
    {
      id: "fallback-2",
      title: "Tech Giants Announce New AI Initiatives",
      description:
        "Major technology companies have unveiled ambitious artificial intelligence projects aimed at transforming various industries.",
      content:
        "Major technology companies have unveiled ambitious artificial intelligence projects aimed at transforming various industries.",
      url: "https://example.com/news/2",
      imageUrl: "",
      publishedAt: new Date().toISOString(),
      source: "Tech Insider",
      category: topic,
      isGoogleNews: true,
    },
    {
      id: "fallback-3",
      title: "Climate Summit Produces Landmark Agreement",
      description:
        "World leaders have reached a consensus on aggressive carbon reduction targets during the latest international climate conference.",
      content:
        "World leaders have reached a consensus on aggressive carbon reduction targets during the latest international climate conference.",
      url: "https://example.com/news/3",
      imageUrl: "",
      publishedAt: new Date().toISOString(),
      source: "Environmental Report",
      category: topic,
      isGoogleNews: true,
    },
    {
      id: "fallback-4",
      title: "Healthcare Breakthrough: New Treatment Shows Promise",
      description:
        "Researchers have developed a novel therapeutic approach that demonstrates significant efficacy in clinical trials.",
      content:
        "Researchers have developed a novel therapeutic approach that demonstrates significant efficacy in clinical trials.",
      url: "https://example.com/news/4",
      imageUrl: "",
      publishedAt: new Date().toISOString(),
      source: "Medical Journal",
      category: topic,
      isGoogleNews: true,
    },
    {
      id: "fallback-5",
      title: "Global Supply Chain Issues Begin to Ease",
      description:
        "After months of disruption, international logistics networks are showing signs of normalization and improved efficiency.",
      content:
        "After months of disruption, international logistics networks are showing signs of normalization and improved efficiency.",
      url: "https://example.com/news/5",
      imageUrl: "",
      publishedAt: new Date().toISOString(),
      source: "Business Daily",
      category: topic,
      isGoogleNews: true,
    },
    {
      id: "fallback-6",
      title: "Entertainment Industry Embraces New Distribution Models",
      description:
        "Major studios and production companies are adapting to changing consumer preferences with innovative content delivery strategies.",
      content:
        "Major studios and production companies are adapting to changing consumer preferences with innovative content delivery strategies.",
      url: "https://example.com/news/6",
      imageUrl: "",
      publishedAt: new Date().toISOString(),
      source: "Entertainment Weekly",
      category: topic,
      isGoogleNews: true,
    },
  ]
}
