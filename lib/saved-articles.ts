"use client"

import { useCallback } from "react"
import type { Article } from "@/types/news"
import { getOptimizedImageUrl } from "./image-utils"
import { useAuth } from "@/contexts/auth-context"

const STORAGE_KEY = "luxora-times-saved-articles"

class SavedArticlesService {
  async getSavedArticles(userId?: string): Promise<Article[]> {
    if (userId) {
      try {
        const response = await fetch(`/api/saved-articles?userId=${encodeURIComponent(userId)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.articles)) {
          // Also sync with localStorage
          this.syncToLocalStorage(data.articles)
          return data.articles
        }

        console.error("Failed to fetch saved articles:", data.error)
        return this.getLocalSavedArticles()
      } catch (error) {
        console.error("Error fetching saved articles from server:", error)
        return this.getLocalSavedArticles()
      }
    }

    return this.getLocalSavedArticles()
  }

  async saveArticle(article: Article, userId?: string): Promise<void> {
    const articleToSave = {
      ...article,
      imageUrl: getOptimizedImageUrl(article.imageUrl),
      savedAt: new Date().toISOString(),
    }

    // Always save to localStorage first for immediate feedback
    this.saveToLocalStorage(articleToSave)

    if (userId) {
      try {
        const response = await fetch("/api/saved-articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            article: articleToSave,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to save article")
        }

        return
      } catch (error) {
        console.error("Error saving article to server:", error)
        // Article is already saved to localStorage, so we don't need to throw
        return
      }
    }
  }

  async removeSavedArticle(articleId: string, userId?: string): Promise<void> {
    // Always remove from localStorage first for immediate feedback
    this.removeFromLocalStorage(articleId)

    if (userId) {
      try {
        const response = await fetch("/api/saved-articles", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            articleId,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to remove article")
        }

        return
      } catch (error) {
        console.error("Error removing article from server:", error)
        // Article is already removed from localStorage
        return
      }
    }
  }

  async isArticleSaved(articleId: string, userId?: string): Promise<boolean> {
    if (userId) {
      try {
        const articles = await this.getSavedArticles(userId)
        return articles.some((article) => article.id === articleId)
      } catch (error) {
        console.error("Error checking if article is saved:", error)
        return this.isArticleSavedInLocalStorage(articleId)
      }
    }

    return this.isArticleSavedInLocalStorage(articleId)
  }

  async getSavedArticleById(articleId: string, userId?: string): Promise<Article | null> {
    const articles = await this.getSavedArticles(userId)
    return articles.find((article) => article.id === articleId) || null
  }

  private getLocalSavedArticles(): Article[] {
    if (typeof window === "undefined") return []

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const articles = saved ? JSON.parse(saved) : []

      return articles.map((article: Article) => ({
        ...article,
        imageUrl: article.imageUrl || "/placeholder.svg?height=400&width=600",
      }))
    } catch (error) {
      console.error("Error getting saved articles from localStorage:", error)
      return []
    }
  }

  private saveToLocalStorage(article: Article): void {
    if (typeof window === "undefined") return

    try {
      const savedArticles = this.getLocalSavedArticles()

      if (!savedArticles.some((saved) => saved.id === article.id)) {
        const updatedSaved = [article, ...savedArticles] // Add to beginning for recency
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaved))
      }
    } catch (error) {
      console.error("Error saving article to localStorage:", error)
    }
  }

  private removeFromLocalStorage(articleId: string): void {
    if (typeof window === "undefined") return

    try {
      const savedArticles = this.getLocalSavedArticles()
      const updatedSaved = savedArticles.filter((article) => article.id !== articleId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaved))
    } catch (error) {
      console.error("Error removing saved article from localStorage:", error)
    }
  }

  private isArticleSavedInLocalStorage(articleId: string): boolean {
    if (typeof window === "undefined") return false

    try {
      const savedArticles = this.getLocalSavedArticles()
      return savedArticles.some((article) => article.id === articleId)
    } catch (error) {
      console.error("Error checking if article is saved in localStorage:", error)
      return false
    }
  }

  private syncToLocalStorage(articles: Article[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
    } catch (error) {
      console.error("Error syncing articles to localStorage:", error)
    }
  }
}

const savedArticlesService = new SavedArticlesService()

export function useSavedArticles() {
  const { user } = useAuth()
  const userId = user?.id

  const getSavedArticles = useCallback(() => savedArticlesService.getSavedArticles(userId), [userId])

  const saveArticle = useCallback((article: Article) => savedArticlesService.saveArticle(article, userId), [userId])

  const removeSavedArticle = useCallback(
    (articleId: string) => savedArticlesService.removeSavedArticle(articleId, userId),
    [userId],
  )

  const isArticleSaved = useCallback(
    (articleId: string) => savedArticlesService.isArticleSaved(articleId, userId),
    [userId],
  )

  const getSavedArticleById = useCallback(
    (articleId: string) => savedArticlesService.getSavedArticleById(articleId, userId),
    [userId],
  )

  return {
    getSavedArticles,
    saveArticle,
    removeSavedArticle,
    isArticleSaved,
    getSavedArticleById,
  }
}

export const { getSavedArticles, saveArticle, removeSavedArticle, isArticleSaved, getSavedArticleById } =
  savedArticlesService
