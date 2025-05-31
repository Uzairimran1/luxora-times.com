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

const PEXELS_API_KEY = "5LTtmlORnTE2RwZp94M48mWk4uoHGdPdyMUvRHZ5KUxMQAwGCDmfvTSf"
const PEXELS_BASE_URL = "https://api.pexels.com/v1"

class PexelsService {
  private apiKey: string

  constructor() {
    this.apiKey = PEXELS_API_KEY
  }

  private extractKeywords(title: string, category: string): string {
    // Remove common words and extract meaningful keywords
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
    ]

    const titleWords = title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .filter((word) => word.length > 2 && !commonWords.includes(word))
      .slice(0, 3) // Take first 3 meaningful words

    const categoryWord = category.toLowerCase()

    // Combine and prioritize category + title keywords
    const keywords = [categoryWord, ...titleWords].join(" ")
    return keywords
  }

  async searchPhotos(title: string, category: string, perPage = 1): Promise<PexelsPhoto | null> {
    try {
      const query = this.extractKeywords(title, category)

      const response = await fetch(
        `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            Authorization: this.apiKey,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`)
      }

      const data: PexelsResponse = await response.json()

      if (data.photos && data.photos.length > 0) {
        return data.photos[0]
      }

      return null
    } catch (error) {
      console.error("Error fetching from Pexels:", error)
      return null
    }
  }

  async searchVideos(title: string, category: string, perPage = 1): Promise<PexelsVideo | null> {
    try {
      const query = this.extractKeywords(title, category)

      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            Authorization: this.apiKey,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Pexels Videos API error: ${response.status}`)
      }

      const data: PexelsResponse = await response.json()

      if (data.videos && data.videos.length > 0) {
        return data.videos[0]
      }

      return null
    } catch (error) {
      console.error("Error fetching videos from Pexels:", error)
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
}

export const pexelsService = new PexelsService()
export type { PexelsPhoto, PexelsVideo }
