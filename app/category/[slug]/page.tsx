import { fetchTopHeadlines } from "@/lib/api-service"
import NewsCard from "@/components/news-card"
import { notFound } from "next/navigation"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { RefreshCw } from "lucide-react"
import BackButton from "@/components/back-button"

export const revalidate = 3600 // Revalidate every hour

interface CategoryPageProps {
  params: {
    slug: string
  }
}

const validCategories = ["technology", "science", "business", "health", "entertainment", "sports", "politics"]

export function generateStaticParams() {
  return validCategories.map((slug) => ({ slug }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params

  if (!validCategories.includes(slug)) {
    notFound()
  }

  const articles = await fetchTopHeadlines(slug, "us", 20)
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1)

  const isFallbackData = articles.some((article) => article.id.includes("fallback"))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold">{categoryName} News</h1>
        </div>
        {isFallbackData && (
          <div className="flex items-center">
            <RefreshCw className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-500">Using cached data</span>
          </div>
        )}
      </div>

      {isFallbackData && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>
            We're having trouble connecting to our news sources. Showing you cached articles for now. Please check back
            later for the latest updates.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} showCategory={false} />
        ))}
      </div>
    </div>
  )
}
