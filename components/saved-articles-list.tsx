"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Article } from "@/types/news"
import { useSavedArticles } from "@/lib/saved-articles"
import { useAuth } from "@/contexts/auth-context"
import NewsCard from "./news-card"
import { BookmarkX, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SavedArticlesList() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { getSavedArticles } = useSavedArticles()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadSavedArticles = useCallback(async () => {
    if (authLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const savedArticles = await getSavedArticles()
      setArticles(savedArticles)
    } catch (error: any) {
      console.error("Error loading saved articles:", error)
      setError(error.message || "Failed to load saved articles")
    } finally {
      setIsLoading(false)
    }
  }, [authLoading, getSavedArticles])

  const retryLoad = () => {
    setRetryCount((prev) => prev + 1)
    loadSavedArticles()
  }

  useEffect(() => {
    if (!authLoading) {
      loadSavedArticles()
    }
  }, [authLoading, loadSavedArticles, retryCount])

  // Listen for storage changes to update the list
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "luxora-times-saved-articles") {
        loadSavedArticles()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [loadSavedArticles])

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading saved articles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive" className="max-w-md mx-auto mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={retryLoad} className="mb-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        {retryCount > 0 && <p className="text-xs text-muted-foreground">Retry attempt: {retryCount}</p>}
      </div>
    )
  }

  if (!isAuthenticated && articles.length > 0) {
    return (
      <div>
        <Alert className="mb-6">
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Sign in to sync your saved articles</p>
              <p className="text-sm">
                You have {articles.length} article{articles.length !== 1 ? "s" : ""} saved locally. Sign in to access
                your saved articles from any device.
              </p>
              <Button onClick={() => router.push("/auth/signin")} size="sm" className="mt-2">
                Sign In
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated && articles.length === 0) {
    return (
      <div className="text-center py-12">
        <BookmarkX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">Sign in to view saved articles</h2>
        <p className="text-muted-foreground mb-6">You need to sign in to save and view your favorite articles.</p>
        <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <BookmarkX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">No saved articles</h2>
        <p className="text-muted-foreground mb-6">
          Articles you save will appear here. Click the bookmark icon on any article to save it for later.
        </p>
        <Button onClick={() => router.push("/")} variant="outline">
          Browse Articles
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {articles.length} saved article{articles.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={retryLoad} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
