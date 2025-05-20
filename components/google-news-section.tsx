"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, RefreshCw, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDebounce } from "@/hooks/use-debounce"
import type { Article } from "@/types/news"
import LinearNewsCard from "./linear-news-card"

interface GoogleNewsSectionProps {
  initialTopic?: string
}

export default function GoogleNewsSection({ initialTopic = "top news" }: GoogleNewsSectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [topic, setTopic] = useState(initialTopic)
  const [searchInput, setSearchInput] = useState(initialTopic)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 10 // Increased for linear layout

  // Debounce search input
  const debouncedSearchTerm = useDebounce(searchInput, 500)

  // Fetch articles function
  const fetchArticles = useCallback(
    async (searchTopic: string) => {
      if (!isRefreshing) {
        setIsLoading(true)
      }
      setError(null)

      try {
        console.log(`Fetching news for topic: ${searchTopic}`)
        const response = await fetch(`/api/google-news?topic=${encodeURIComponent(searchTopic)}`)

        if (!response.ok) {
          throw new Error(`Error fetching news: ${response.status}`)
        }

        const data = await response.json()
        console.log("API response:", data)

        // Make sure we're extracting the articles array from the response
        const articlesArray = Array.isArray(data.articles) ? data.articles : []
        console.log(`Found ${articlesArray.length} articles`)

        setArticles(articlesArray)
        setCurrentPage(1)
      } catch (err) {
        console.error("Error fetching Google News:", err)
        setError("Failed to fetch news. Please try again later.")
        setArticles([]) // Ensure articles is an empty array on error
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [isRefreshing],
  )

  // Fetch articles when topic changes
  useEffect(() => {
    fetchArticles(topic)
  }, [topic, fetchArticles])

  // Auto-search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim() && debouncedSearchTerm !== topic) {
      setTopic(debouncedSearchTerm.trim())
    }
  }, [debouncedSearchTerm, topic])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim() !== topic) {
      setTopic(searchInput.trim())
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchArticles(topic)
  }

  // Calculate pagination
  const totalPages = Math.ceil(articles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const currentArticles = articles.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-8">
        <Input
          type="text"
          placeholder="Search for news..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 pb-6 border-b">
                <Skeleton className="h-48 md:h-32 md:w-48 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 && !isLoading && !error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No results found</AlertTitle>
            <AlertDescription>No news articles found for "{topic}". Try a different search term.</AlertDescription>
          </Alert>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {currentArticles.map((article, index) => (
                <LinearNewsCard key={article.id || index} article={article} priority={index < 3} index={index} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center flex-wrap gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  // Show at most 5 page buttons
                  let pageNum = i + 1
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i)
                  }

                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
