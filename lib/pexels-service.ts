interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  photographer_id: number
  avg_color: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  liked: boolean
  alt: string
}

interface PexelsVideo {
  id: number
  width: number
  height: number
  url: string
  image: string
  duration: number
  user: {
    id: number
    name: string
    url: string
  }
  video_files: Array<{
    id: number
    quality: string
    file_type: string
    width: number
    height: number
    link: string
  }>
  video_pictures: Array<{
    id: number
    picture: string
    nr: number
  }>
}

interface PexelsResponse {
  total_results: number
  page: number
  per_page: number
  photos?: PexelsPhoto[]
  videos?: PexelsVideo[]
  next_page?: string
}

interface CachedResult {
  data: PexelsPhoto | PexelsVideo | null
  timestamp: number
  type: "photo" | "video" | null
}

const PEXELS_API_KEY = "5LTtmlORnTE2RwZp94M48mWk4uoHGdPdyMUvRHZ5KUxMQAwGCDmfvTSf"
const PEXELS_BASE_URL = "https://api.pexels.com/v1"
const PEXELS_VIDEO_URL = "https://api.pexels.com/videos"
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

class PexelsService {
  private apiKey: string
  private cache: Map<string, CachedResult> = new Map()
  private requestCount = 0
  private lastResetTime: number = Date.now()
  private readonly MAX_REQUESTS_PER_HOUR = 200

  constructor() {
    this.apiKey = PEXELS_API_KEY
  }

  private resetRequestCountIfNeeded(): void {
    const now = Date.now()
    const hourInMs = 60 * 60 * 1000

    if (now - this.lastResetTime > hourInMs) {
      this.requestCount = 0
      this.lastResetTime = now
    }
  }

  private canMakeRequest(): boolean {
    this.resetRequestCountIfNeeded()
    return this.requestCount < this.MAX_REQUESTS_PER_HOUR
  }

  private incrementRequestCount(): void {
    this.requestCount++
  }

  private getCacheKey(query: string, type: "photo" | "video"): string {
    return `${type}-${query.toLowerCase().replace(/\s+/g, "-")}`
  }

  private getCachedResult(cacheKey: string): CachedResult | null {
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Using cached Pexels result for: ${cacheKey}`)
      return cached
    }

    if (cached) {
      this.cache.delete(cacheKey) // Remove expired cache
    }

    return null
  }

  private setCachedResult(cacheKey: string, result: CachedResult): void {
    this.cache.set(cacheKey, result)
  }

  private extractKeywords(title: string, category: string): string {
    // Enhanced keyword extraction for better search results
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "must",
      "shall",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
    ]

    // Category-specific keywords for better results
    const categoryKeywords = {
      technology: ["tech", "digital", "computer", "software", "innovation", "coding", "data"],
      science: ["research", "laboratory", "experiment", "discovery", "analysis", "study"],
      business: ["office", "meeting", "corporate", "finance", "professional", "team"],
      finance: ["money", "investment", "banking", "trading", "market", "economy"],
      health: ["medical", "healthcare", "hospital", "doctor", "wellness", "fitness"],
      sports: ["athletic", "competition", "training", "stadium", "team", "exercise"],
      entertainment: ["performance", "stage", "music", "art", "creative", "show"],
    }

    const titleWords = title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .filter((word) => word.length > 2 && !commonWords.includes(word))
      .slice(0, 3)

    const categoryWord = category.toLowerCase()
    const additionalKeywords = categoryKeywords[categoryWord as keyof typeof categoryKeywords] || []

    // Combine keywords with priority to category-specific terms
    const keywords = [categoryWord, ...additionalKeywords.slice(0, 2), ...titleWords].join(" ")
    return keywords.substring(0, 100) // Limit query length
  }

  private async makeRequest(url: string): Promise<Response> {
    if (!this.canMakeRequest()) {
      throw new Error("Pexels API rate limit exceeded")
    }

    this.incrementRequestCount()

    const response = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
        "User-Agent": "News-Platform/1.0",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
    }

    return response
  }

  async searchPhotos(title: string, category: string, perPage = 1): Promise<PexelsPhoto | null> {
    try {
      const query = this.extractKeywords(title, category)
      const cacheKey = this.getCacheKey(query, "photo")

      // Check cache first
      const cached = this.getCachedResult(cacheKey)
      if (cached && cached.type === "photo") {
        return cached.data as PexelsPhoto
      }

      const url = `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&size=medium`

      const response = await this.makeRequest(url)
      const data: PexelsResponse = await response.json()

      if (data.photos && data.photos.length > 0) {
        const photo = data.photos[0]

        // Cache the result
        this.setCachedResult(cacheKey, {
          data: photo,
          timestamp: Date.now(),
          type: "photo",
        })

        console.log(`Found Pexels photo for: ${query}`)
        return photo
      }

      // Cache null result to avoid repeated failed requests
      this.setCachedResult(cacheKey, {
        data: null,
        timestamp: Date.now(),
        type: null,
      })

      return null
    } catch (error) {
      console.error("Error fetching from Pexels Photos:", error)
      return null
    }
  }

  async searchVideos(title: string, category: string, perPage = 1): Promise<PexelsVideo | null> {
    try {
      const query = this.extractKeywords(title, category)
      const cacheKey = this.getCacheKey(query, "video")

      // Check cache first
      const cached = this.getCachedResult(cacheKey)
      if (cached && cached.type === "video") {
        return cached.data as PexelsVideo
      }

      const url = `${PEXELS_VIDEO_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&size=medium`

      const response = await this.makeRequest(url)
      const data: PexelsResponse = await response.json()

      if (data.videos && data.videos.length > 0) {
        const video = data.videos[0]

        // Cache the result
        this.setCachedResult(cacheKey, {
          data: video,
          timestamp: Date.now(),
          type: "video",
        })

        console.log(`Found Pexels video for: ${query}`)
        return video
      }

      // Cache null result to avoid repeated failed requests
      this.setCachedResult(cacheKey, {
        data: null,
        timestamp: Date.now(),
        type: null,
      })

      return null
    } catch (error) {
      console.error("Error fetching from Pexels Videos:", error)
      return null
    }
  }

  async getFallbackMedia(
    title: string,
    category: string,
    preferVideo = false,
  ): Promise<{
    type: "photo" | "video" | null
    data: PexelsPhoto | PexelsVideo | null
  }> {
    try {
      if (preferVideo) {
        const video = await this.searchVideos(title, category)
        if (video) {
          return { type: "video", data: video }
        }
      }

      const photo = await this.searchPhotos(title, category)
      if (photo) {
        return { type: "photo", data: photo }
      }

      return { type: null, data: null }
    } catch (error) {
      console.error("Error getting fallback media:", error)
      return { type: null, data: null }
    }
  }

  // Get curated photos for general use
  async getCuratedPhotos(category: string, perPage = 15): Promise<PexelsPhoto[]> {
    try {
      const cacheKey = this.getCacheKey(`curated-${category}`, "photo")
      const cached = this.getCachedResult(cacheKey)

      if (cached && Array.isArray(cached.data)) {
        return cached.data as PexelsPhoto[]
      }

      const url = `${PEXELS_BASE_URL}/curated?per_page=${perPage}`
      const response = await this.makeRequest(url)
      const data: PexelsResponse = await response.json()

      if (data.photos && data.photos.length > 0) {
        // Cache the results
        this.setCachedResult(cacheKey, {
          data: data.photos as any,
          timestamp: Date.now(),
          type: "photo",
        })

        return data.photos
      }

      return []
    } catch (error) {
      console.error("Error fetching curated photos:", error)
      return []
    }
  }

  // Get API usage statistics
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      maxRequests: this.MAX_REQUESTS_PER_HOUR,
      cacheSize: this.cache.size,
      lastResetTime: this.lastResetTime,
    }
  }

  // Clear cache manually
  clearCache(): void {
    this.cache.clear()
    console.log("Pexels cache cleared")
  }
}

export const pexelsService = new PexelsService()
export type { PexelsPhoto, PexelsVideo }
