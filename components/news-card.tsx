"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Article } from "@/types/news"
import { formatDistanceToNow } from "date-fns"
import SaveArticleButton from "./save-article-button"
import { cn } from "@/lib/utils"
import { usePexelsMedia } from "@/hooks/use-pexels-media"
import type { PexelsPhoto, PexelsVideo } from "@/lib/pexels-service"
import { Play, Camera, RefreshCw } from "lucide-react"

interface NewsCardProps {
  article: Article
  className?: string
  showCategory?: boolean
  priority?: boolean
  preferVideo?: boolean
}

export default function NewsCard({
  article,
  className,
  showCategory = true,
  priority = false,
  preferVideo = false,
}: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const [shouldUsePexels, setShouldUsePexels] = useState(false)

  const formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })

  // Enhanced Pexels integration with retry functionality
  const { media, loading, error, retry, isRetrying } = usePexelsMedia(article.title, article.category, {
    enabled: shouldUsePexels && (!article.imageUrl || imageError),
    preferVideo,
    retryCount: 2,
    retryDelay: 1000,
  })

  // Create a safe article ID for routing
  const getSafeArticleId = () => {
    if (!article.id) {
      return encodeURIComponent(article.url || article.title || "unknown")
    }

    if (article.id.startsWith("http")) {
      return encodeURIComponent(article.id)
    }

    return encodeURIComponent(article.id)
  }

  // Enhanced image source determination
  const getImageSrc = () => {
    // If we have a valid original image and no error, use it
    if (article.imageUrl && !imageError && !article.imageUrl.includes("placeholder")) {
      return article.imageUrl
    }

    // If Pexels media is available, use it
    if (media.type === "photo" && media.data) {
      const pexelsPhoto = media.data as PexelsPhoto
      return pexelsPhoto.src.large
    }

    if (media.type === "video" && media.data) {
      const pexelsVideo = media.data as PexelsVideo
      return pexelsVideo.image
    }

    // Fallback to placeholder
    return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(article.title.substring(0, 20))}`
  }

  const handleImageError = () => {
    console.log("Image error, switching to Pexels for:", article.title)
    setImageError(true)
    setShouldUsePexels(true)
  }

  const imageSrc = getImageSrc()
  const isFeatureCard = className?.includes("md:col-span-2") || className?.includes("lg:col-span-3")
  const articleId = getSafeArticleId()

  // Check if we're using Pexels media
  const isUsingPexels = media.type && media.data
  const isVideo = media.type === "video"

  return (
    <div
      className={cn("group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg", className)}
    >
      <Link href={`/article/${articleId}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          {loading ? (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
                <span className="text-gray-500 text-sm">Loading enhanced image...</span>
              </div>
            </div>
          ) : (
            <>
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

              {/* Video indicator */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {showCategory && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">
                {article.category}
              </span>
            </div>
          )}

          {/* Enhanced Pexels attribution */}
          {isUsingPexels && (
            <div className="absolute bottom-1 left-1 z-10">
              <div className="flex items-center gap-1 text-xs text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                {isVideo ? <Play className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                <span>
                  {media.type === "photo"
                    ? `Photo by ${(media.data as PexelsPhoto).photographer}`
                    : `Video by ${(media.data as PexelsVideo).user.name}`}
                </span>
              </div>
            </div>
          )}

          {/* Error state with retry option */}
          {error && !loading && (
            <div className="absolute bottom-1 right-1 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  retry()
                }}
                className="text-xs text-white/80 bg-red-500/40 px-2 py-1 rounded backdrop-blur-sm hover:bg-red-500/60 transition-colors"
              >
                Retry Image
              </button>
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
              {isRetrying && (
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Retrying...
                </span>
              )}
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
