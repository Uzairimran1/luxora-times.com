export interface Article {
  id: string
  title: string
  description: string
  content: string
  url: string
  imageUrl: string
  publishedAt: string
  source: string
  category: string
  // New fields for enhanced display
  themeColor?: string
  textColor?: string
  isCrypto?: boolean
  cryptoSymbol?: string
}

export interface NewsApiResponse {
  status: string
  totalResults: number
  articles: any[]
}

export interface NewsSource {
  id: string
  name: string
  baseUrl: string
  apiKey: string | undefined
  endpoints: {
    topHeadlines: string
    everything: string
  }
  active: boolean
  dailyLimit: number
  remainingCalls: number
  resetTime: number
}

export interface ApiUsage {
  remainingCalls: number
  resetTime: number
  lastUpdated: number
}
