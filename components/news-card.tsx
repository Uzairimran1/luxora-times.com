"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Article } from "@/types/news"
import { formatDistanceToNow } from "date-fns"
import SaveArticleButton from "./save-article-button"
import { cn } from "@/lib/utils"
import { usePexelsMedia } from "@/hooks/use-pexels-media"
import type { PexelsPhoto } from "@/lib/pexels-service"

interface NewsCardProps {
  article: Article
  className?: string
  showCategory?: boolean
  priority?: boolean
}

export default function NewsCard({ article, className, showCategory = true, priority = false }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const [shouldUsePexels, setShouldUsePexels] = useState(false)

  const formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })

  // Only fetch from Pexels if original image failed and we don't have a valid imageUrl
  const { media, loading } = usePexelsMedia(
    article.title,
    article.category,
    shouldUsePexels && (!article.imageUrl || imageError),
  )

  // Create a safe article ID for routing
  const getSafeArticleId = () => {
    if (!article.id) {
      return encodeURIComponent(article.url || article.title || "unknown")
    }

    // If the ID is already a URL, encode it properly
    if (article.id.startsWith("http")) {
      return encodeURIComponent(article.id)
    }

    // For other IDs, use them as-is but ensure they're URL safe
    return encodeURIComponent(article.id)
  }

  // Determine the image source
  const getImageSrc = () => {
    // If we have a valid original image and no error, use it
    if (article.imageUrl && !imageError) {
      return article.imageUrl
    }

    // If Pexels media is available, use it
    if (media.type === "photo" && media.data) {
      const pexelsPhoto = media.data as PexelsPhoto
      return pexelsPhoto.src.large
    }

    // Fallback to placeholder
    return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(article.title.substring(0, 20))}`
  }

  const handleImageError = () => {
    setImageError(true)
    setShouldUsePexels(true)
  }

  const imageSrc = getImageSrc()
  const isFeatureCard = className?.includes("md:col-span-2") || className?.includes("lg:col-span-3")
  const articleId = getSafeArticleId()

  return (
    <div
      className={cn("group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg", className)}
    >
      <Link
        href={`/article/${articleId}`}
        className="block"
        onClick={(e) => {
          // Add some debugging
          console.log("Navigating to article:", articleId, article)
        }}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          {loading ? (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
              <span className="text-gray-500 text-sm">Loading image...</span>
            </div>
          ) : (
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={
                isFeatureCard
                  ? "(max-width: 768px) 100vw, 100vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              onError={handleImageError}
              priority={priority}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {showCategory && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">
                {article.category}
              </span>
            </div>
          )}

          {/* Pexels attribution */}
          {media.type === "photo" && media.data && (
            <div className="absolute bottom-1 left-1 z-10">
              <span className="text-xs text-white/60 bg-black/30 px-1 rounded">
                Photo by {(media.data as PexelsPhoto).photographer}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className={cn("font-bold line-clamp-2 mb-2", isFeatureCard ? "text-2xl" : "text-lg")}>
              {article.title}
            </h3>

            {isFeatureCard && <p className="text-sm text-white/80 line-clamp-2 mb-2">{article.description}</p>}

            <div className="flex items-center justify-between text-xs text-white/70">
              <span>
                {article.source} • {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-3 right-3 z-10">
        <SaveArticleButton
          article={article}
          variant="icon"
          className="bg-background/30 backdrop-blur-sm hover:bg-background/50"
        />
      </div>
    </div>
  )
}
