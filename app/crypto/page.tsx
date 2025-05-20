import type { Metadata } from "next"
import EnhancedNewsCard from "@/components/enhanced-news-card"
import { fetchTopHeadlines } from "@/lib/enhanced-news-service"

export const metadata: Metadata = {
  title: "Cryptocurrency News | News Aggregator",
  description: "Latest cryptocurrency news and market updates",
}

export default async function CryptoPage() {
  // Fetch crypto news by searching for relevant terms
  const cryptoNews = await fetchTopHeadlines("business", "us", 20)

  // Filter for crypto-related news
  const filteredNews = cryptoNews.filter((article) => {
    const lowerTitle = article.title.toLowerCase()
    const lowerDesc = article.description.toLowerCase()
    return (
      lowerTitle.includes("crypto") ||
      lowerTitle.includes("bitcoin") ||
      lowerTitle.includes("ethereum") ||
      lowerTitle.includes("btc") ||
      lowerTitle.includes("eth") ||
      lowerDesc.includes("crypto") ||
      lowerDesc.includes("bitcoin") ||
      lowerDesc.includes("ethereum")
    )
  })

  // Add cryptocurrency category to all articles
  const enhancedNews = filteredNews.map((article) => ({
    ...article,
    category: "cryptocurrency",
  }))

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Cryptocurrency News</h1>
        <p className="text-muted-foreground">Latest updates from the crypto market</p>
      </div>

      {/* Dark mode style similar to the example */}
      <div className="bg-black rounded-xl p-6 mb-8">
        <div className="space-y-4">
          {enhancedNews.slice(0, 5).map((article, index) => (
            <div key={article.id} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
              <EnhancedNewsCard article={article} priority={index < 2} className="!rounded-none !shadow-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Regular grid layout for remaining articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enhancedNews.slice(5).map((article, index) => (
          <EnhancedNewsCard key={article.id} article={article} priority={index < 3} />
        ))}
      </div>
    </main>
  )
}
