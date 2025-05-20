import { searchArticles } from "@/lib/api-service"
import NewsCard from "@/components/news-card"
import EnhancedSearch from "@/components/enhanced-search"

export const dynamic = "force-dynamic"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""

  let articles = []
  let searchPerformed = false

  if (query) {
    articles = await searchArticles(query, 30)
    searchPerformed = true
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <EnhancedSearch expanded={true} placeholder="Search for news, topics, or anything else..." />
      </div>

      {searchPerformed && (
        <>
          <h2 className="text-xl font-semibold mb-6">
            {articles.length > 0
              ? `Found ${articles.length} results for "${query}"`
              : `No results found for "${query}"`}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}

      {!searchPerformed && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium text-foreground mb-2">Discover the world's knowledge</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Search for news articles on any topic, from technology and science to business and entertainment.
          </p>
        </div>
      )}
    </div>
  )
}
