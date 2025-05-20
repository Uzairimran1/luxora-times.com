import { ApiRateLimiter } from "./api-rate-limiter"
import type { Article } from "@/types/news"
import { getOptimizedImageUrl, extractImageFromContent } from "./image-utils"
import { fallbackArticles, getFallbackArticlesByCategory } from "./fallback-data"

// Define API configurations
const NEWS_API_CONFIG = {
  baseUrl: "https://newsapi.org/v2",
  endpoints: {
    topHeadlines: "/top-headlines",
    everything: "/everything",
  },
  apiKey: process.env.NEWS_API_KEY || "",
  rateLimiter: new ApiRateLimiter("newsapi", {
    maxRequestsPerDay: 100,
    resetIntervalHours: 24,
    minRequestInterval: 1000, // 1 second between requests
    maxRequestInterval: 10000, // 10 seconds when throttling
  }),
}

const NEWSDATA_CONFIG = {
  baseUrl: "https://newsdata.io/api/1",
  endpoints: {
    topHeadlines: "/news",
    everything: "/news",
  },
  apiKey: process.env.NEWSDATA_API_KEY || "",
  rateLimiter: new ApiRateLimiter("newsdata", {
    maxRequestsPerDay: 200,
    resetIntervalHours: 24,
    minRequestInterval: 1000, // 1 second between requests
    maxRequestInterval: 8000, // 8 seconds when throttling
  }),
}

// In-memory cache for API responses
const apiCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

// Check if a response is cached and still valid
const getCachedResponse = (cacheKey: string): any | null => {
  const cached = apiCache[cacheKey]
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached response for ${cacheKey}`)
    return cached.data
  }
  return null
}

// Cache a response
const cacheResponse = (cacheKey: string, data: any): void => {
  apiCache[cacheKey] = {
    data,
    timestamp: Date.now(),
  }
}

// Normalize article data from different APIs
const normalizeArticle = (article: any, source: string, apiSource: string): Article => {
  // Default image if none is provided
  const defaultImage = "/placeholder.svg?height=400&width=600"

  // Handle different API response formats
  let imageUrl = ""
  let content = ""
  let description = ""
  let publishedAt = ""
  let articleSource = ""
  let url = ""
  let title = ""
  let id = ""

  if (apiSource === "newsapi") {
    imageUrl = article.urlToImage || ""
    content = article.content || article.description || ""
    description = article.description || ""
    publishedAt = article.publishedAt || new Date().toISOString()
    articleSource = article.source?.name || source
    url = article.url || ""
    title = article.title || "Untitled Article"
    id = article.url || Math.random().toString(36).substring(2, 15)
  } else if (apiSource === "newsdata") {
    imageUrl = article.image_url || ""
    content = article.content || article.description || ""
    description = article.description || ""
    publishedAt = article.pubDate || new Date().toISOString()
    articleSource = article.source_id || source
    url = article.link || ""
    title = article.title || "Untitled Article"
    id = article.link || Math.random().toString(36).substring(2, 15)
  }

  // Try to extract image from content if none is provided
  if (!imageUrl && content) {
    imageUrl = extractImageFromContent(content) || defaultImage
  } else if (!imageUrl) {
    imageUrl = defaultImage
  }

  // Optimize the image URL
  imageUrl = getOptimizedImageUrl(imageUrl)

  return {
    id,
    title,
    description,
    content,
    url,
    imageUrl,
    publishedAt,
    source: articleSource,
    category: "", // Will be set based on the query
  }
}

// Map category names between different APIs
const mapCategory = (category: string | undefined, apiSource: string): string => {
  if (!category) return ""

  // NewsAPI categories
  const newsApiCategories = ["business", "entertainment", "general", "health", "science", "sports", "technology"]

  // NewsData.io categories
  const newsDataCategories = [
    "business",
    "entertainment",
    "environment",
    "food",
    "health",
    "politics",
    "science",
    "sports",
    "technology",
    "top",
    "world",
  ]

  if (apiSource === "newsapi" && newsApiCategories.includes(category)) {
    return category
  } else if (apiSource === "newsdata") {
    // Map NewsAPI categories to NewsData.io categories
    if (category === "general") return "top"
    if (newsDataCategories.includes(category)) return category
    return "top" // Default to top for NewsData.io
  }

  return category
}

// Fetch from NewsAPI with rate limiting
async function fetchFromNewsApi(endpoint: string, params: URLSearchParams): Promise<any> {
  // Try to acquire permission to make the request
  const canProceed = await NEWS_API_CONFIG.rateLimiter.acquirePermission()

  if (!canProceed) {
    console.warn("NewsAPI rate limit reached, request denied")
    throw new Error("Rate limit reached")
  }

  const url = `${NEWS_API_CONFIG.baseUrl}${endpoint}?${params.toString()}`

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching from NewsAPI:", error)
    throw error
  }
}

// Fetch from NewsData with rate limiting
async function fetchFromNewsData(endpoint: string, params: URLSearchParams): Promise<any> {
  // Try to acquire permission to make the request
  const canProceed = await NEWSDATA_CONFIG.rateLimiter.acquirePermission()

  if (!canProceed) {
    console.warn("NewsData rate limit reached, request denied")
    throw new Error("Rate limit reached")
  }

  const url = `${NEWSDATA_CONFIG.baseUrl}${endpoint}?${params.toString()}`

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`NewsData error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching from NewsData:", error)
    throw error
  }
}

// Fetch top headlines with failover between APIs
export async function fetchTopHeadlines(category?: string, country = "us", pageSize = 10): Promise<Article[]> {
  // Try to get from cache first
  const cacheKey = `topHeadlines-${category || "general"}-${country}-${pageSize}`
  const cachedData = getCachedResponse(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    let articles: Article[] = []

    // Try NewsAPI first
    try {
      const params = new URLSearchParams({
        country,
        pageSize: pageSize.toString(),
        apiKey: NEWS_API_CONFIG.apiKey,
      })

      if (category) {
        params.append("category", mapCategory(category, "newsapi"))
      }

      const data = await fetchFromNewsApi(NEWS_API_CONFIG.endpoints.topHeadlines, params)

      if (data.articles && data.articles.length > 0) {
        articles = data.articles.map((article: any) => {
          const normalized = normalizeArticle(article, "NewsAPI", "newsapi")
          normalized.category = category || "general"
          return normalized
        })
      }
    } catch (error) {
      console.warn("Failed to fetch from NewsAPI, trying NewsData...")

      // If NewsAPI fails, try NewsData
      try {
        const params = new URLSearchParams({
          apikey: NEWSDATA_CONFIG.apiKey,
          country,
          size: pageSize.toString(),
        })

        if (category) {
          params.append("category", mapCategory(category, "newsdata"))
        }

        const data = await fetchFromNewsData(NEWSDATA_CONFIG.endpoints.topHeadlines, params)

        if (data.results && data.results.length > 0) {
          articles = data.results.map((article: any) => {
            const normalized = normalizeArticle(article, "NewsData", "newsdata")
            normalized.category = category || "general"
            return normalized
          })
        }
      } catch (newsDataError) {
        console.error("Both NewsAPI and NewsData failed:", newsDataError)
        // If both APIs fail, use fallback data
        return category ? getFallbackArticlesByCategory(category, pageSize) : fallbackArticles.slice(0, pageSize)
      }
    }

    // If we got articles, cache them
    if (articles.length > 0) {
      cacheResponse(cacheKey, articles)
      return articles
    }

    // If both APIs returned no results, use fallback data
    return category ? getFallbackArticlesByCategory(category, pageSize) : fallbackArticles.slice(0, pageSize)
  } catch (error) {
    console.error("Error fetching top headlines:", error)
    return category ? getFallbackArticlesByCategory(category, pageSize) : fallbackArticles.slice(0, pageSize)
  }
}

// Search articles with failover between APIs
export async function searchArticles(query: string, pageSize = 20): Promise<Article[]> {
  // Try to get from cache first
  const cacheKey = `search-${query}-${pageSize}`
  const cachedData = getCachedResponse(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    let articles: Article[] = []

    // Try NewsAPI first
    try {
      const params = new URLSearchParams({
        q: query,
        pageSize: pageSize.toString(),
        apiKey: NEWS_API_CONFIG.apiKey,
      })

      const data = await fetchFromNewsApi(NEWS_API_CONFIG.endpoints.everything, params)

      if (data.articles && data.articles.length > 0) {
        articles = data.articles.map((article: any) => normalizeArticle(article, "NewsAPI", "newsapi"))
      }
    } catch (error) {
      console.warn("Failed to fetch from NewsAPI, trying NewsData...")

      // If NewsAPI fails, try NewsData
      try {
        const params = new URLSearchParams({
          apikey: NEWSDATA_CONFIG.apiKey,
          q: query,
          size: pageSize.toString(),
        })

        const data = await fetchFromNewsData(NEWSDATA_CONFIG.endpoints.everything, params)

        if (data.results && data.results.length > 0) {
          articles = data.results.map((article: any) => normalizeArticle(article, "NewsData", "newsdata"))
        }
      } catch (newsDataError) {
        console.error("Both NewsAPI and NewsData failed:", newsDataError)
        // If both APIs fail, use fallback data
        return fallbackArticles
          .filter(
            (article) =>
              article.title.toLowerCase().includes(query.toLowerCase()) ||
              article.description.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, pageSize)
      }
    }

    // If we got articles, cache them
    if (articles.length > 0) {
      cacheResponse(cacheKey, articles)
      return articles
    }

    // If both APIs returned no results, use fallback data
    return fallbackArticles
      .filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, pageSize)
  } catch (error) {
    console.error("Error searching articles:", error)
    return fallbackArticles
      .filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, pageSize)
  }
}

// Get API usage statistics
export function getApiUsageStats() {
  return {
    newsapi: {
      remainingCalls: NEWS_API_CONFIG.rateLimiter.getRemainingRequests(),
      resetTime: NEWS_API_CONFIG.rateLimiter.getNextResetTime().getTime(),
      isThrottling: NEWS_API_CONFIG.rateLimiter.getIsThrottling(),
      currentDelay: NEWS_API_CONFIG.rateLimiter.getCurrentDelay(),
      lastUpdated: Date.now(),
    },
    newsdata: {
      remainingCalls: NEWSDATA_CONFIG.rateLimiter.getRemainingRequests(),
      resetTime: NEWSDATA_CONFIG.rateLimiter.getNextResetTime().getTime(),
      isThrottling: NEWSDATA_CONFIG.rateLimiter.getIsThrottling(),
      currentDelay: NEWSDATA_CONFIG.rateLimiter.getCurrentDelay(),
      lastUpdated: Date.now(),
    },
  }
}

// Clear cache
export function clearCache(): void {
  Object.keys(apiCache).forEach((key) => {
    delete apiCache[key]
  })
}
