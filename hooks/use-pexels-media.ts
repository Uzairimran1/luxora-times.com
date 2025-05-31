"use client"

import { useState, useEffect } from "react"
import type { PexelsPhoto, PexelsVideo } from "@/lib/pexels-service"

interface PexelsMediaResult {
  type: "photo" | "video" | null
  data: PexelsPhoto | PexelsVideo | null
}

export function usePexelsMedia(title: string, category: string, enabled = true) {
  const [media, setMedia] = useState<PexelsMediaResult>({ type: null, data: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !title || !category) return

    const fetchMedia = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/pexels?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&type=photo`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch media")
        }

        const result: PexelsMediaResult = await response.json()
        setMedia(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setMedia({ type: null, data: null })
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [title, category, enabled])

  return { media, loading, error }
}
