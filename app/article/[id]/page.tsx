import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchTopHeadlines, searchArticles } from "@/lib/api-service"
import { formatDistanceToNow } from "date-fns"
import SaveArticleButton from "@/components/save-article-button"
import NewsCard from "@/components/news-card"
import { getSavedArticleById } from "@/lib/saved-articles"
import BackButton from "@/components/back-button"

export const revalidate = 3600 // Revalidate every hour

interface ArticlePageProps {
  params: {
    id: string
  }
}

async function getArticleById(id: string) {
  // First check if this is a saved article
  const savedArticle = await getSavedArticleById(id)
  if (savedArticle) {
    return savedArticle
  }

  // If not saved, try to find in API results
  const decodedId = decodeURIComponent(id)

  // Try to find in top headlines first
  const topHeadlines = await fetchTopHeadlines(undefined, "us", 30)
  let article = topHeadlines.find((article) => article.id === decodedId)

  // If not found, try to search for it
  if (!article) {
    // Extract a search term from the ID (usually a URL)
    const searchTerm = decodedId.split("/").pop() || decodedId
    const searchResults = await searchArticles(searchTerm, 10)
    article = searchResults.find((article) => article.id === decodedId)
  }

  return article
}

async function getRelatedArticles(category: string) {
  return fetchTopHeadlines(category, "us", 6)
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleById(params.id)

  if (!article) {
    notFound()
  }

  const formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
  const relatedArticles = await getRelatedArticles(article.category)

  // Process article content for better display
  const processedContent = article.content
    .split("\n")
    .filter((paragraph) => paragraph.trim().length > 0)
    .map((paragraph) => paragraph.replace(/\[\+\d+ chars\]$/, "").trim()) // Remove "[+123 chars]" from NewsAPI content

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <BackButton fallbackPath={`/category/${article.category}`} />
      </div>

      <div className="mb-8">
        <div className="text-sm text-muted-foreground mb-2">
          <Link href={`/category/${article.category}`} className="text-primary hover:underline">
            {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
          </Link>{" "}
          &bull; {formattedDate}
        </div>

        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            Source: <span className="font-medium">{article.source}</span>
          </div>

          <SaveArticleButton article={article} variant="button" />
        </div>

        <div className="relative aspect-video w-full mb-6 overflow-hidden rounded-lg">
          <Image
            src={article.imageUrl || "/placeholder.svg?height=600&width=1200"}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="article-content">
          <p className="text-lg font-medium mb-6">{article.description}</p>

          {processedContent.map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}

          {article.url && (
            <div className="mt-8 p-4 bg-muted rounded-md">
              <p className="font-medium">Read the full article:</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-words"
              >
                {article.url}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Articles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedArticles
            .filter((related) => related.id !== article.id)
            .slice(0, 3)
            .map((related) => (
              <NewsCard key={related.id} article={related} showCategory={false} />
            ))}
        </div>
      </div>
    </div>
  )
}
