"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Article } from "@/types/news"
import { useSavedArticles } from "@/lib/saved-articles"
import { useAuth } from "@/contexts/auth-context"
import NewsCard from "./news-card"
import { BookmarkX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SavedArticlesList() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { getSavedArticles } = useSavedArticles()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    // Only load articles when component mounts or when auth state changes
    // Avoid calling this again if it's already loading
    if (!authLoading && !isLoading) {
      loadSavedArticles()
    }

    // Set up event listener for storage changes
    const handleStorageChange = () => {
      if (!isLoading) {
        // Prevent multiple loading calls
        loadSavedArticles()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BookmarkX className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">Error loading saved articles</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  // If user is not logged in but we have articles in localStorage
  if (!user && articles.length > 0) {
    return (
      <div>
        <div className="bg-muted p-4 rounded-md mb-6">
          <h2 className="text-lg font-medium mb-2">Sign in to sync your saved articles</h2>
          <p className="text-muted-foreground mb-4">
            You have {articles.length} article{articles.length !== 1 ? "s" : ""} saved locally. Sign in to access your
            saved articles from any device.
          </p>
          <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    )
  }

  if (!user && articles.length === 0) {
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
        <p className="text-muted-foreground">
          Articles you save will appear here. Click the bookmark icon on any article to save it for later.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  )
}
