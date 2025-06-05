"use client"

import { useState, useEffect, useCallback } from "react"
import type { PexelsPhoto, PexelsVideo } from "@/lib/pexels-service"

interface PexelsMediaResult {
  type: "photo" | "video" | null
  data: PexelsPhoto | PexelsVideo | null
}

interface UsePexelsMediaOptions {
  enabled?: boolean
  preferVideo?: boolean
  retryCount?: number
  retryDelay?: number
}

export function usePexelsMedia(title: string, category: string, options: UsePexelsMediaOptions = {}) {
  const { enabled = true, preferVideo = false, retryCount = 2, retryDelay = 1000 } = options

  const [media, setMedia] = useState<PexelsMediaResult>({ type: null, data: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryAttempt, setRetryAttempt] = useState(0)

  const fetchMedia = useCallback(
    async (attempt = 0) => {
      if (!enabled || !title || !category) return

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          title: title,
          category: category,
          type: preferVideo ? "video" : "photo",
        })

        const response = await fetch(`/api/pexels?${params.toString()}`, {
          next: { revalidate: 3600 }, // Cache for 1 hour
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch media: ${response.status}`)
        }

        const result: PexelsMediaResult = await response.json()
        setMedia(result)
        setRetryAttempt(0) // Reset retry count on success

        console.log(`Successfully fetched Pexels media for: ${title}`)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        console.error(`Pexels media fetch error (attempt ${attempt + 1}):`, errorMessage)

        if (attempt < retryCount) {
          // Retry with exponential backoff
          setTimeout(() => {
            setRetryAttempt(attempt + 1)
            fetchMedia(attempt + 1)
          }, retryDelay * Math.pow(2, attempt))
        } else {
          setError(errorMessage)
          setMedia({ type: null, data: null })
        }
      } finally {
        setLoading(false)
      }
    },
    [title, category, enabled, preferVideo, retryCount, retryDelay],
  )

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const retry = useCallback(() => {
    setRetryAttempt(0)
    fetchMedia()
  }, [fetchMedia])

  return {
    media,
    loading,
    error,
    retry,
    retryAttempt,
    isRetrying: retryAttempt > 0,
  }
}

// Hook for fetching curated photos
export function usePexelsCurated(category: string, count = 15) {
  const [photos, setPhotos] = useState<PexelsPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!category) return

    const fetchCurated = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/pexels/curated?category=${category}&count=${count}`)

        if (!response.ok) {
          throw new Error("Failed to fetch curated photos")
        }

        const data = await response.json()
        setPhotos(data.photos || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setPhotos([])
      } finally {
        setLoading(false)
      }
    }

    fetchCurated()
  }, [category, count])

  return { photos, loading, error }
}
