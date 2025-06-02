import type { Article, NewsApiResponse, NewsSource, ApiUsage } from "@/types/news"

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
    resetTime: new Date().setHours(24, 0, 0, 0),
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
    resetTime: new Date().setHours(24, 0, 0, 0),
  },
]

// In-memory cache for API responses
const apiCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in production

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

// Enhanced fallback data for when APIs fail
const createMockArticle = (title: string, category: string, index: number): Article => ({
  id: `mock-${category}-${index}-${Date.now()}`,
  title,
  description: `This is a sample ${category} article. The full content would be available from the original source.`,
  content: `This is a sample ${category} article with detailed content. In a real scenario, this would contain the full article text from the news source.`,
  url: `https://example.com/news/${category}/${index}`,
  imageUrl: `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(title.substring(0, 20))}`,
  publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
  source: "Sample News",
  category,
})

const getMockArticles = (category?: string, count = 10): Article[] => {
  const targetCategory = category || "general"

  const titles = {
    business: [
      "Market Analysis: Tech Stocks Show Strong Performance",
      "Global Economy Outlook for Next Quarter",
      "Cryptocurrency Market Trends and Analysis",
      "Banking Sector Updates and Regulatory Changes",
      "Startup Funding Reaches New Heights",
    ],
    technology: [
      "AI Breakthrough in Machine Learning Research",
      "New Smartphone Technology Revolutionizes Industry",
      "Cybersecurity Threats and Protection Strategies",
      "Cloud Computing Adoption Accelerates",
      "Tech Giants Announce Major Partnerships",
    ],
    science: [
      "Climate Change Research Shows New Findings",
      "Space Exploration Mission Achieves Milestone",
      "Medical Research Breakthrough in Treatment",
      "Environmental Conservation Efforts Expand",
      "Scientific Discovery Changes Understanding",
    ],
    health: [
      "New Treatment Options for Common Conditions",
      "Public Health Initiative Shows Positive Results",
      "Mental Health Awareness Campaign Launches",
      "Medical Technology Advances Patient Care",
      "Health Research Reveals Important Insights",
    ],
    sports: [
      "Championship Finals Draw Record Viewership",
      "Athlete Breaks Long-Standing Record",
      "Sports Technology Enhances Performance",
      "International Tournament Announces Schedule",
      "Team Management Changes Announced",
    ],
    entertainment: [
      "Film Industry Celebrates Award Season",
      "Music Festival Lineup Announced",
      "Streaming Platform Launches New Content",
      "Celebrity News and Industry Updates",
      "Entertainment Technology Innovations",
    ],
    general: [
      "Breaking News: Major Development Announced",
      "Local Community Initiative Gains Support",
      "Weather Update: Seasonal Changes Expected",
      "Transportation Updates Affect Daily Commute",
      "Educational Programs Show Positive Results",
    ],
  }

  const categoryTitles = titles[targetCategory as keyof typeof titles] || titles.general

  return Array.from({ length: count }, (_, index) =>
    createMockArticle(
      categoryTitles[index % categoryTitles.length] || `Sample ${targetCategory} Article ${index + 1}`,
      targetCategory,
      index,
    ),
  )
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

// Fetch with timeout and retry - more conservative for production
async function fetchWithRetry(url: string, options: RequestInit, retries = 1, timeout = 5000): Promise<Response> {
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
    if (retries <= 0) throw error

    await new Promise((resolve) => setTimeout(resolve, 1000))
    return fetchWithRetry(url, options, retries - 1, timeout)
  }
}

// Fetch top headlines with enhanced fallback and production safety
export async function fetchTopHeadlines(category?: string, country = "us", pageSize = 10): Promise<Article[]> {
  const cacheKey = `topHeadlines-${category || "general"}-${country}-${pageSize}`

  // Always try cache first
  const cachedData = getCachedResponse(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Prepare fallback data
  const fallbackData = getMockArticles(category, pageSize)

  try {
    // In production, be more conservative with API calls
    const isProduction = process.env.NODE_ENV === "production"
    const maxRetries = isProduction ? 1 : 2
    const requestTimeout = isProduction ? 3000 : 8000

    // Try a simple fetch first
    try {
      const params = new URLSearchParams({
        country,
        pageSize: Math.min(pageSize, 10).toString(),
        apiKey: NEWS_SOURCES[0].apiKey as string,
      })

      if (category && category !== "general") {
        params.append("category", category)
      }

      const url = `${NEWS_SOURCES[0].baseUrl}${NEWS_SOURCES[0].endpoints.topHeadlines}?${params.toString()}`

      const response = await fetchWithRetry(url, {}, maxRetries, requestTimeout)

      if (response.ok) {
        const data: NewsApiResponse = await response.json()

        if (data.articles && data.articles.length > 0) {
          const articles = data.articles.map((article) => ({
            id: article.url || `article-${Date.now()}-${Math.random()}`,
            title: article.title || "Untitled Article",
            description: article.description || "",
            content: article.content || article.description || "",
            url: article.url || "",
            imageUrl: article.urlToImage || `/placeholder.svg?height=400&width=600`,
            publishedAt: article.publishedAt || new Date().toISOString(),
            source: article.source?.name || "News Source",
            category: category || "general",
          }))

          cacheResponse(cacheKey, articles)
          return articles
        }
      }
    } catch (error) {
      console.warn("API fetch failed:", error)
    }

    // If API fails, use mock data
    console.log("Using mock data due to API failure")
    cacheResponse(cacheKey, fallbackData)
    return fallbackData
  } catch (error) {
    console.error("Error in fetchTopHeadlines:", error)
    cacheResponse(cacheKey, fallbackData)
    return fallbackData
  }
}

// Search articles with production safety
export async function searchArticles(query: string, pageSize = 10): Promise<Article[]> {
  const cacheKey = `search-${query}-${pageSize}`

  const cachedData = getCachedResponse(cacheKey)
  if (cachedData) {
    return cachedData
  }

  const fallbackData = getMockArticles("general", pageSize).map((article) => ({
    ...article,
    title: `${query} - ${article.title}`,
    description: `Search result for "${query}": ${article.description}`,
  }))

  try {
    // In production, be very conservative
    const isProduction = process.env.NODE_ENV === "production"
    if (isProduction) {
      // Skip API calls in production for search to avoid rate limits
      cacheResponse(cacheKey, fallbackData)
      return fallbackData
    }

    // Only try API in development
    const params = new URLSearchParams({
      q: query,
      pageSize: Math.min(pageSize, 10).toString(),
      apiKey: NEWS_SOURCES[0].apiKey as string,
    })

    const response = await fetchWithRetry(
      `${NEWS_SOURCES[0].baseUrl}${NEWS_SOURCES[0].endpoints.everything}?${params.toString()}`,
      {},
      1,
      3000,
    )

    if (response.ok) {
      const data: NewsApiResponse = await response.json()

      if (data.articles && data.articles.length > 0) {
        const articles = data.articles.map((article) => ({
          id: article.url || `search-${Date.now()}-${Math.random()}`,
          title: article.title || "Untitled Article",
          description: article.description || "",
          content: article.content || article.description || "",
          url: article.url || "",
          imageUrl: article.urlToImage || `/placeholder.svg?height=400&width=600`,
          publishedAt: article.publishedAt || new Date().toISOString(),
          source: article.source?.name || "News Source",
          category: "general",
        }))

        cacheResponse(cacheKey, articles)
        return articles
      }
    }
  } catch (error) {
    console.warn("Search API failed:", error)
  }

  cacheResponse(cacheKey, fallbackData)
  return fallbackData
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
