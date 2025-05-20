import { fetchTopHeadlines } from "@/lib/api-service"
import NewsCard from "@/components/news-card"

export const revalidate = 600 // Revalidate every 10 minutes

export const metadata = {
  title: "Latest News - Luxora Times",
  description: "The latest news from around the world",
}

export default async function LatestNewsPage() {
  const articles = await fetchTopHeadlines(undefined, "us", 30)

  // Sort articles by published date (newest first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )

  return (
    <div>
      <h1>Latest News</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
