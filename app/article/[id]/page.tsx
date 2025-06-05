"use client"

import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchTopHeadlines, searchArticles } from "@/lib/api-service"
import { formatDistanceToNow } from "date-fns"
import SaveArticleButton from "@/components/save-article-button"
import NewsCard from "@/components/news-card"
import { getSavedArticleById } from "@/lib/saved-articles"
import BackButton from "@/components/back-button"
import { ErrorBoundary } from "@/components/error-boundary"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export const revalidate = 3600 // Revalidate every hour

interface ArticlePageProps {
  params: {
    id: string
  }
}

// Create a mock article from URL when real article is not found
function createMockArticleFromUrl(url: string): any {
  try {
    const parsedUrl = new URL(decodeURIComponent(url))
    const domain = parsedUrl.hostname.replace("www.", "")
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean)
    const title = pathParts[pathParts.length - 1]?.replace(/[-_]/g, " ") || "News Article"

    return {
      id: url,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: `This article is from ${domain}. Click the link below to read the full content on the original website.`,
      content: `This article is hosted on ${domain}. The full content is available on the original website. Click the "Read Full Article" link below to access the complete story.`,
      url: decodeURIComponent(url),
      imageUrl: `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(domain)}`,
      publishedAt: new Date().toISOString(),
      source: domain,
      category: "general",
    }
  } catch (error) {
    return {
      id: url,
      title: "News Article",
      description: "This article is available on the original website.",
      content:
        "The full content is available on the original website. Click the link below to read the complete story.",
      url: decodeURIComponent(url),
      imageUrl: "/placeholder.svg?height=400&width=600",
      publishedAt: new Date().toISOString(),
      source: "External Source",
      category: "general",
    }
  }
}

async function getArticleById(id: string) {
  try {
    // Decode the ID properly
    const decodedId = decodeURIComponent(id)
    console.log(`Fetching article with ID: ${decodedId}`)

    // Check if this is a URL (like the BBC URL in the error)
    const isUrl = decodedId.startsWith("http")

    // First check if this is a saved article
    try {
      const savedArticle = await getSavedArticleById(decodedId)
      if (savedArticle) {
        console.log("Found saved article")
        return savedArticle
      }
    } catch (error) {
      console.warn("Error checking saved articles:", error)
    }

    // Try to find in top headlines with reduced page size to avoid rate limits
    try {
      console.log("Fetching top headlines with reduced size...")
      const topHeadlines = await fetchTopHeadlines(undefined, "us", 20) // Reduced from 50
      const article = topHeadlines.find(
        (article) =>
          article.id === decodedId ||
          article.url === decodedId ||
          encodeURIComponent(article.id) === id ||
          (isUrl && article.url && article.url.includes(new URL(decodedId).hostname)),
      )

      if (article) {
        console.log("Found article in top headlines")
        return article
      }
    } catch (error) {
      console.warn("Error fetching top headlines:", error)
    }

    // If it's a URL and we haven't found it, create a mock article
    if (isUrl) {
      console.log("Creating mock article from URL")
      return createMockArticleFromUrl(decodedId)
    }

    // Try searching with a simplified approach
    try {
      let searchTerm = ""

      if (decodedId.includes("http")) {
        // If it's a URL, extract meaningful parts
        const url = new URL(decodedId)
        const pathParts = url.pathname.split("/").filter(Boolean)
        searchTerm = pathParts[pathParts.length - 1]?.replace(/[-_]/g, " ") || url.hostname
      } else {
        // Use the ID as search term
        searchTerm = decodedId.replace(/[^a-zA-Z0-9\s]/g, " ").trim()
      }

      if (searchTerm && searchTerm.length > 2) {
        console.log(`Searching for article with term: ${searchTerm}`)
        const searchResults = await searchArticles(searchTerm, 10) // Reduced from 20
        const article = searchResults.find(
          (article) => article.id === decodedId || article.url === decodedId || encodeURIComponent(article.id) === id,
        )

        if (article) {
          console.log("Found article in search results")
          return article
        }
      }
    } catch (error) {
      console.warn("Error searching for article:", error)
    }

    console.log("Article not found, returning null")
    return null
  } catch (error) {
    console.error("Error in getArticleById:", error)
    // If there's an error and it's a URL, try to create a mock article
    const decodedId = decodeURIComponent(id)
    if (decodedId.startsWith("http")) {
      return createMockArticleFromUrl(decodedId)
    }
    throw new Error(`Failed to fetch article: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function getRelatedArticles(category: string) {
  try {
    console.log(`Fetching related articles for category: ${category}`)
    // Use a smaller number to avoid rate limits
    const articles = await fetchTopHeadlines(category, "us", 6)
    console.log(`Found ${articles.length} related articles`)
    return articles
  } catch (error) {
    console.warn("Error fetching related articles:", error)
    return []
  }
}

// Enhanced error fallback for article page
function ArticleErrorFallback({ error, resetErrorBoundary }: { error?: Error; resetErrorBoundary?: () => void }) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Failed to load article</p>
            <p className="text-sm">{error?.message || "The article could not be found or loaded."}</p>
            <div className="flex gap-2 mt-4">
              {resetErrorBoundary && (
                <Button onClick={resetErrorBoundary} variant="outline" size="sm">
                  Try Again
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const article = await getArticleById(params.id)

    if (!article) {
      notFound()
    }

    const formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    const relatedArticles = await getRelatedArticles(article.category)

    // Process article content for better display
    const processedContent = article.content
      ? article.content
          .split("\n")
          .filter((paragraph) => paragraph.trim().length > 0)
          .map((paragraph) => paragraph.replace(/\[\+\d+ chars\]$/, "").trim())
      : []

    return (
      <ErrorBoundary fallback={ArticleErrorFallback}>
        <div className="max-w-4xl mx-auto p-4">
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

            <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>

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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=600&width=1200"
                }}
              />
            </div>

            <div className="article-content">
              <p className="text-lg font-medium mb-6">{article.description}</p>

              {processedContent.length > 0 ? (
                processedContent.map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="mb-4 text-muted-foreground">
                  Full article content is available at the source link below.
                </p>
              )}

              {article.url && (
                <div className="mt-8 p-4 bg-muted rounded-md">
                  <p className="font-medium mb-2">Read the full article:</p>
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Original Article
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {relatedArticles.length > 0 && (
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
          )}
        </div>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error("Error in ArticlePage:", error)
    return <ArticleErrorFallback error={error as Error} />
  }
}
