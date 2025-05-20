import type { Article, NewsApiResponse, NewsSource, ApiUsage } from "@/types/news"
import { getOptimizedImageUrl, extractImageFromContent } from "./image-utils"
import { fallbackArticles, getFallbackArticlesByCategory } from "./fallback-data"
import { searchOxylabsNews } from "./oxylabs-service"

// Define available API sources with their respective endpoints and keys
const NEWS_SOURCES: NewsSource[] = [
  {
    id: "newsapi",
    name: "NewsAPI",
    baseUrl: "https://newsapi.org/v2",
    apiKey: process.env.NEWS_API_KEY || "1ec53f3832734768acc687b052036a89",
    endpoints: {
      topHeadlines: "/top-headlines",
      everything: "/everything",
    },
    active: true,
    dailyLimit: 100,
    remainingCalls: 100,
    resetTime: new Date().setHours(24, 0, 0, 0), // Reset at midnight
  },
  {
    id: "newsdata",
    name: "NewsData.io",
    baseUrl: "https://newsdata.io/api/1",
    apiKey: process.env.NEWSDATA_API_KEY || "pub_78253d1377ba54e3cb55c4378a269e444b296",
    endpoints: {
      topHeadlines: "/news",
      everything: "/news",
    },
    active: true,
    dailyLimit: 200,
    remainingCalls: 200,
    resetTime: new Date().setHours(24, 0, 0, 0), // Reset at midnight
  },
]

// In-memory cache for API responses
const apiCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

// In-memory API usage tracking
const apiUsage: Record<string, ApiUsage> = {}

// Initialize API usage tracking
NEWS_SOURCES.forEach((source) => {
  apiUsage[source.id] = {
    remainingCalls: source.remainingCalls,
    resetTime: source.resetTime,
    lastUpdated: Date.now(),
  }
})

// Get the best available API source based on remaining calls and priority
const getActiveSource = (): NewsSource | null => {
  // Update API usage if needed
  const now = Date.now()
  Object.keys(apiUsage).forEach((sourceId) => {
    const usage = apiUsage[sourceId]
    if (now > usage.resetTime) {
      const source = NEWS_SOURCES.find((s) => s.id === sourceId)
      if (source) {
        apiUsage[sourceId] = {
          remainingCalls: source.dailyLimit,
          resetTime: new Date().setHours(24, 0, 0, 0), // Reset at midnight
          lastUpdated: now,
        }
      }
    }
  })

  // Filter active sources with remaining calls
  const availableSources = NEWS_SOURCES.filter(
    (source) => source.active && source.apiKey && apiUsage[source.id].remainingCalls > 0,
  )

  return availableSources.length > 0 ? availableSources[0] : null
}

// Update API usage after a call
const updateApiUsage = (sourceId: string): void => {
  if (apiUsage[sourceId]) {
    apiUsage[sourceId].remainingCalls = Math.max(0, apiUsage[sourceId].remainingCalls - 1)
    apiUsage[sourceId].lastUpdated = Date.now()
  }
}

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

// Fetch with timeout and retry
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, timeout = 10000): Promise<Response> {
  // Create an abort controller for the timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (retries <= 1) throw error

    // Wait before retrying (exponential backoff)
    await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries)))
    return fetchWithRetry(url, options, retries - 1, timeout)
  }
}

// Fetch top headlines with failover between APIs
export async function fetchTopHeadlines(category?: string, country = "us", pageSize = 10): Promise<Article[]> {
  console.log(`Fetching top headlines for category: ${category || "general"}, country: ${country}, size: ${pageSize}`)

  // Try to get from cache first
  const cacheKey = `topHeadlines-${category || "general"}-${country}-${pageSize}`
  const cachedData = getCachedResponse(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Get fallback data ready in case of failure
  const fallbackData = category
    ? getFallbackArticlesByCategory(category, pageSize)
    : fallbackArticles.slice(0, pageSize)

  // Get the best available API source
  let source = getActiveSource()
  if (!source) {
    console.error("No active API source available")
    return fallbackData
  }

  try {
    let articles: Article[] = []
    let apiSourceId = source.id

    // Try the first API
    if (source.id === "newsapi") {
      const params = new URLSearchParams({
        country,
        pageSize: pageSize.toString(),
        apiKey: source.apiKey as string,
      })

      if (category) {
        params.append("category", mapCategory(category, "newsapi"))
      }

      const url = `${source.baseUrl}${source.endpoints.topHeadlines}?${params.toString()}`
      console.log(`Fetching from NewsAPI: ${url.replace(source.apiKey as string, "API_KEY_HIDDEN")}`)

      try {
        const response = await fetchWithRetry(url, {
          next: { revalidate: 3600 }, // Cache for 1 hour
        })

        if (response.ok) {
          const data: NewsApiResponse = await response.json()
          updateApiUsage(source.id)

          if (data.articles && data.articles.length > 0) {
            articles = data.articles.map((article) => {
              const normalized = normalizeArticle(article, source.name, "newsapi")
              normalized.category = category || "general"
              return normalized
            })
          } else {
            console.log("NewsAPI returned no articles, trying fallback source")
          }
        } else {
          console.error(`NewsAPI responded with status: ${response.status}, trying fallback source`)
        }
      } catch (error) {
        console.error(`Error fetching from NewsAPI: ${error instanceof Error ? error.message : String(error)}`)
      }

      // If first API fails or returns no results, try the second one
      if (articles.length === 0) {
        const fallbackSource = NEWS_SOURCES.find((s) => s.id === "newsdata")
        if (fallbackSource && fallbackSource.active && fallbackSource.apiKey) {
          source = fallbackSource
          apiSourceId = "newsdata"

          const params = new URLSearchParams({
            apikey: source.apiKey as string,
            country,
            size: pageSize.toString(),
          })

          if (category) {
            params.append("category", mapCategory(category, "newsdata"))
          }

          const url = `${source.baseUrl}${source.endpoints.topHeadlines}?${params.toString()}`
          console.log(`Fetching from NewsData: ${url.replace(source.apiKey as string, "API_KEY_HIDDEN")}`)

          try {
            const response = await fetchWithRetry(url, {
              next: { revalidate: 3600 }, // Cache for 1 hour
            })

            if (response.ok) {
              const data = await response.json()
              updateApiUsage(source.id)

              if (data.results && data.results.length > 0) {
                articles = data.results.map((article: any) => {
                  const normalized = normalizeArticle(article, source.name, "newsdata")
                  normalized.category = category || "general"
                  return normalized
                })
              } else {
                console.log("NewsData returned no articles, using fallback data")
              }
            } else {
              console.error(`NewsData responded with status: ${response.status}, using fallback data`)
            }
          } catch (error) {
            console.error(`Error fetching from NewsData: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }
    } else if (source.id === "newsdata") {
      // Start with NewsData.io
      const params = new URLSearchParams({
        apikey: source.apiKey as string,
        country,
        size: pageSize.toString(),
      })

      if (category) {
        params.append("category", mapCategory(category, "newsdata"))
      }

      const url = `${source.baseUrl}${source.endpoints.topHeadlines}?${params.toString()}`
      console.log(`Fetching from NewsData: ${url.replace(source.apiKey as string, "API_KEY_HIDDEN")}`)

      try {
        const response = await fetchWithRetry(url, {
          next: { revalidate: 3600 }, // Cache for 1 hour
        })

        if (response.ok) {
          const data = await response.json()
          updateApiUsage(source.id)

          if (data.results && data.results.length > 0) {
            articles = data.results.map((article: any) => {
              const normalized = normalizeArticle(article, source.name, "newsdata")
              normalized.category = category || "general"
              return normalized
            })
          } else {
            console.log("NewsData returned no articles, trying fallback source")
          }
        } else {
          console.error(`NewsData responded with status: ${response.status}, trying fallback source`)
        }
      } catch (error) {
        console.error(`Error fetching from NewsData: ${error instanceof Error ? error.message : String(error)}`)
      }

      // If first API fails or returns no results, try the second one
      if (articles.length === 0) {
        const fallbackSource = NEWS_SOURCES.find((s) => s.id === "newsapi")
        if (fallbackSource && fallbackSource.active && fallbackSource.apiKey) {
          source = fallbackSource
          apiSourceId = "newsapi"

          const params = new URLSearchParams({
            country,
            pageSize: pageSize.toString(),
            apiKey: source.apiKey as string,
          })

          if (category) {
            params.append("category", mapCategory(category, "newsapi"))
          }

          const url = `${source.baseUrl}${source.endpoints.topHeadlines}?${params.toString()}`
          console.log(`Fetching from NewsAPI: ${url.replace(source.apiKey as string, "API_KEY_HIDDEN")}`)

          try {
            const response = await fetchWithRetry(url, {
              next: { revalidate: 3600 }, // Cache for 1 hour
            })

            if (response.ok) {
              const data: NewsApiResponse = await response.json()
              updateApiUsage(source.id)

              if (data.articles && data.articles.length > 0) {
                articles = data.articles.map((article) => {
                  const normalized = normalizeArticle(article, source.name, "newsapi")
                  normalized.category = category || "general"
                  return normalized
                })
              } else {
                console.log("NewsAPI returned no articles, using fallback data")
              }
            } else {
              console.error(`NewsAPI responded with status: ${response.status}, using fallback data`)
            }
          } catch (error) {
            console.error(`Error fetching from NewsAPI: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }
    }

    // If we got articles, cache them
    if (articles.length > 0) {
      console.log(`Successfully fetched ${articles.length} articles, caching results`)
      cacheResponse(cacheKey, articles)
      return articles
    }

    // If both APIs failed or returned no results, use fallback data
    console.log(`No articles fetched from APIs, using fallback data for category: ${category || "general"}`)
    return fallbackData
  } catch (error) {
    console.error(`Error fetching top headlines: ${error instanceof Error ? error.message : String(error)}`)
    return fallbackData
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

  // Get fallback data ready in case of failure
  const fallbackData = fallbackArticles
    .filter(
      (article) =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, pageSize)

  try {
    // Try to get results from Oxylabs first
    try {
      const oxylabsResults = await searchOxylabsNews(query, pageSize)

      if (oxylabsResults.length > 0) {
        // Cache the results
        cacheResponse(cacheKey, oxylabsResults)
        return oxylabsResults
      }
    } catch (error) {
      console.error(`Error searching with Oxylabs: ${error instanceof Error ? error.message : String(error)}`)
    }

    // If Oxylabs fails or returns no results, fall back to other APIs
    // Get the best available API source
    let source = getActiveSource()
    if (!source) {
      console.error("No active API source available")
      return fallbackData
    }

    let articles: Article[] = []
    let apiSourceId = source.id

    // Try the first API
    if (source.id === "newsapi") {
      const params = new URLSearchParams({
        q: query,
        pageSize: pageSize.toString(),
        apiKey: source.apiKey as string,
      })

      try {
        const response = await fetchWithRetry(`${source.baseUrl}${source.endpoints.everything}?${params.toString()}`, {
          next: { revalidate: 3600 }, // Cache for 1 hour
        })

        if (response.ok) {
          const data: NewsApiResponse = await response.json()
          updateApiUsage(source.id)

          if (data.articles && data.articles.length > 0) {
            articles = data.articles.map((article) => normalizeArticle(article, source.name, "newsapi"))
          }
        } else {
          console.error(`NewsAPI search responded with status: ${response.status}, trying fallback source`)
        }
      } catch (error) {
        console.error(`Error searching with NewsAPI: ${error instanceof Error ? error.message : String(error)}`)
      }

      // If first API fails or returns no results, try the second one
      if (articles.length === 0) {
        const fallbackSource = NEWS_SOURCES.find((s) => s.id === "newsdata")
        if (fallbackSource && fallbackSource.active && fallbackSource.apiKey) {
          source = fallbackSource
          apiSourceId = "newsdata"

          const params = new URLSearchParams({
            apikey: source.apiKey as string,
            q: query,
            size: pageSize.toString(),
          })

          try {
            const response = await fetchWithRetry(
              `${source.baseUrl}${source.endpoints.everything}?${params.toString()}`,
              {
                next: { revalidate: 3600 }, // Cache for 1 hour
              },
            )

            if (response.ok) {
              const data = await response.json()
              updateApiUsage(source.id)

              if (data.results && data.results.length > 0) {
                articles = data.results.map((article: any) => normalizeArticle(article, source.name, "newsdata"))
              }
            } else {
              console.error(`NewsData search responded with status: ${response.status}, using fallback data`)
            }
          } catch (error) {
            console.error(`Error searching with NewsData: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }
    } else if (source.id === "newsdata") {
      // Start with NewsData.io
      const params = new URLSearchParams({
        apikey: source.apiKey as string,
        q: query,
        size: pageSize.toString(),
      })

      try {
        const response = await fetchWithRetry(`${source.baseUrl}${source.endpoints.everything}?${params.toString()}`, {
          next: { revalidate: 3600 }, // Cache for 1 hour
        })

        if (response.ok) {
          const data = await response.json()
          updateApiUsage(source.id)

          if (data.results && data.results.length > 0) {
            articles = data.results.map((article: any) => normalizeArticle(article, source.name, "newsdata"))
          }
        } else {
          console.error(`NewsData search responded with status: ${response.status}, trying fallback source`)
        }
      } catch (error) {
        console.error(`Error searching with NewsData: ${error instanceof Error ? error.message : String(error)}`)
      }

      // If first API fails or returns no results, try the second one
      if (articles.length === 0) {
        const fallbackSource = NEWS_SOURCES.find((s) => s.id === "newsapi")
        if (fallbackSource && fallbackSource.active && fallbackSource.apiKey) {
          source = fallbackSource
          apiSourceId = "newsapi"

          const params = new URLSearchParams({
            q: query,
            pageSize: pageSize.toString(),
            apiKey: source.apiKey as string,
          })

          try {
            const response = await fetchWithRetry(
              `${source.baseUrl}${source.endpoints.everything}?${params.toString()}`,
              {
                next: { revalidate: 3600 }, // Cache for 1 hour
              },
            )

            if (response.ok) {
              const data: NewsApiResponse = await response.json()
              updateApiUsage(source.id)

              if (data.articles && data.articles.length > 0) {
                articles = data.articles.map((article) => normalizeArticle(article, source.name, "newsapi"))
              }
            } else {
              console.error(`NewsAPI search responded with status: ${response.status}, using fallback data`)
            }
          } catch (error) {
            console.error(`Error searching with NewsAPI: ${error instanceof Error ? error.message : String(error)}`)
          }
        }
      }
    }

    // If we got articles, cache them
    if (articles.length > 0) {
      cacheResponse(cacheKey, articles)
      return articles
    }

    // If both APIs failed or returned no results, use fallback data
    return fallbackData
  } catch (error) {
    console.error(`Error searching articles: ${error instanceof Error ? error.message : String(error)}`)
    return fallbackData
  }
}

// Get API usage statistics
export function getApiUsageStats(): Record<string, ApiUsage> {
  return apiUsage
}

// Clear cache
export function clearCache(): void {
  Object.keys(apiCache).forEach((key) => {
    delete apiCache[key]
  })
}
