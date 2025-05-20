"use client"

import { useCallback } from "react"
import type { Article } from "@/types/news"
import { getOptimizedImageUrl } from "./image-utils"
import { supabase } from "./supabase"
import { useAuth } from "@/contexts/auth-context"

// Update the storage key
const STORAGE_KEY = "luxora-times-saved-articles"

// Get all saved articles (from Supabase if logged in, otherwise from localStorage)
export async function getSavedArticles(userId?: string): Promise<Article[]> {
  // If userId is provided, try to get from Supabase
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("saved_articles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        if (error.message.includes("not initialized")) {
          console.warn("Supabase not initialized, falling back to localStorage")
          return getLocalSavedArticles()
        }
        throw error
      }

      return data.map((record) => JSON.parse(record.article_data) as Article)
    } catch (error) {
      console.error("Error getting saved articles from Supabase:", error)
      return getLocalSavedArticles()
    }
  }

  // Otherwise, get from localStorage
  return getLocalSavedArticles()
}

// Helper function to get saved articles from localStorage
function getLocalSavedArticles(): Article[] {
  if (typeof window === "undefined") return []

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const articles = saved ? JSON.parse(saved) : []

    // Ensure all articles have valid image URLs
    return articles.map((article: Article) => ({
      ...article,
      imageUrl: article.imageUrl || "/placeholder.svg?height=400&width=600",
    }))
  } catch (error) {
    console.error("Error getting saved articles from localStorage:", error)
    return []
  }
}

// Save an article (to Supabase if logged in, otherwise to localStorage)
export async function saveArticle(article: Article, userId?: string): Promise<void> {
  // Ensure the article has a valid image URL
  const articleToSave = {
    ...article,
    imageUrl: getOptimizedImageUrl(article.imageUrl),
  }

  // If userId is provided, try to save to Supabase
  if (userId) {
    try {
      // Check if article is already saved
      const { data, error } = await supabase
        .from("saved_articles")
        .select("id")
        .eq("user_id", userId)
        .eq("article_id", article.id)
        .maybeSingle()

      if (error) {
        if (error.message.includes("not initialized")) {
          console.warn("Supabase not initialized, falling back to localStorage")
          return saveToLocalStorage(articleToSave)
        }
        throw error
      }

      // If not already saved, insert it
      if (!data) {
        const { error: insertError } = await supabase.from("saved_articles").insert([
          {
            user_id: userId,
            article_id: article.id,
            article_data: JSON.stringify(articleToSave),
            created_at: new Date().toISOString(),
          },
        ])

        if (insertError) {
          if (insertError.message.includes("not initialized")) {
            console.warn("Supabase not initialized, falling back to localStorage")
            return saveToLocalStorage(articleToSave)
          }
          throw insertError
        }
      }

      return
    } catch (error) {
      console.error("Error saving article to Supabase:", error)
      return saveToLocalStorage(articleToSave)
    }
  }

  // Otherwise, save to localStorage
  return saveToLocalStorage(articleToSave)
}

// Helper function to save to localStorage
function saveToLocalStorage(article: Article): void {
  if (typeof window === "undefined") return

  try {
    const savedArticles = getLocalSavedArticles()

    // Check if article is already saved
    if (!savedArticles.some((saved) => saved.id === article.id)) {
      const updatedSaved = [...savedArticles, article]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaved))
    }
  } catch (error) {
    console.error("Error saving article to localStorage:", error)
  }
}

// Remove a saved article (from Supabase if logged in, otherwise from localStorage)
export async function removeSavedArticle(articleId: string, userId?: string): Promise<void> {
  // If userId is provided, try to remove from Supabase
  if (userId) {
    try {
      const { error } = await supabase.from("saved_articles").delete().eq("user_id", userId).eq("article_id", articleId)

      if (error) {
        if (error.message.includes("not initialized")) {
          console.warn("Supabase not initialized, falling back to localStorage")
          return removeFromLocalStorage(articleId)
        }
        throw error
      }

      return
    } catch (error) {
      console.error("Error removing saved article from Supabase:", error)
      return removeFromLocalStorage(articleId)
    }
  }

  // Otherwise, remove from localStorage
  return removeFromLocalStorage(articleId)
}

// Helper function to remove from localStorage
function removeFromLocalStorage(articleId: string): void {
  if (typeof window === "undefined") return

  try {
    const savedArticles = getLocalSavedArticles()
    const updatedSaved = savedArticles.filter((article) => article.id !== articleId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaved))
  } catch (error) {
    console.error("Error removing saved article from localStorage:", error)
  }
}

// Check if an article is saved (in Supabase if logged in, otherwise in localStorage)
export async function isArticleSaved(articleId: string, userId?: string): Promise<boolean> {
  // If userId is provided, try to check in Supabase
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("saved_articles")
        .select("id")
        .eq("user_id", userId)
        .eq("article_id", articleId)
        .maybeSingle()

      if (error) {
        if (error.message.includes("not initialized")) {
          console.warn("Supabase not initialized, falling back to localStorage")
          return isArticleSavedInLocalStorage(articleId)
        }
        throw error
      }

      return !!data
    } catch (error) {
      console.error("Error checking if article is saved in Supabase:", error)
      return isArticleSavedInLocalStorage(articleId)
    }
  }

  // Otherwise, check in localStorage
  return isArticleSavedInLocalStorage(articleId)
}

// Helper function to check if saved in localStorage
function isArticleSavedInLocalStorage(articleId: string): boolean {
  if (typeof window === "undefined") return false

  try {
    const savedArticles = getLocalSavedArticles()
    return savedArticles.some((article) => article.id === articleId)
  } catch (error) {
    console.error("Error checking if article is saved in localStorage:", error)
    return false
  }
}

// Get a saved article by ID (from Supabase if logged in, otherwise from localStorage)
export async function getSavedArticleById(articleId: string, userId?: string): Promise<Article | null> {
  // If userId is provided, try to get from Supabase
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("saved_articles")
        .select("*")
        .eq("user_id", userId)
        .eq("article_id", articleId)
        .maybeSingle()

      if (error) {
        if (error.message.includes("not initialized")) {
          console.warn("Supabase not initialized, falling back to localStorage")
          return getSavedArticleByIdFromLocalStorage(articleId)
        }
        throw error
      }

      return data ? (JSON.parse(data.article_data) as Article) : null
    } catch (error) {
      console.error("Error getting saved article by ID from Supabase:", error)
      return getSavedArticleByIdFromLocalStorage(articleId)
    }
  }

  // Otherwise, get from localStorage
  return getSavedArticleByIdFromLocalStorage(articleId)
}

// Helper function to get saved article by ID from localStorage
function getSavedArticleByIdFromLocalStorage(articleId: string): Article | null {
  if (typeof window === "undefined") return null

  try {
    const savedArticles = getLocalSavedArticles()
    return savedArticles.find((article) => article.id === articleId) || null
  } catch (error) {
    console.error("Error getting saved article by ID from localStorage:", error)
    return null
  }
}

// Hook for saved articles
export function useSavedArticles() {
  const { user } = useAuth()
  const userId = user?.id

  // Memoize functions to prevent unnecessary re-renders
  const getSavedArticlesFunc = useCallback(() => getSavedArticles(userId), [userId])
  const saveArticleFunc = useCallback((article: Article) => saveArticle(article, userId), [userId])
  const removeSavedArticleFunc = useCallback((articleId: string) => removeSavedArticle(articleId, userId), [userId])
  const isArticleSavedFunc = useCallback((articleId: string) => isArticleSaved(articleId, userId), [userId])
  const getSavedArticleByIdFunc = useCallback((articleId: string) => getSavedArticleById(articleId, userId), [userId])

  return {
    getSavedArticles: getSavedArticlesFunc,
    saveArticle: saveArticleFunc,
    removeSavedArticle: removeSavedArticleFunc,
    isArticleSaved: isArticleSavedFunc,
    getSavedArticleById: getSavedArticleByIdFunc,
  }
}
