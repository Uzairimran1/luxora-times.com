"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Article } from "@/types/news"
import { formatDistanceToNow } from "date-fns"
import SaveArticleButton from "./save-article-button"
import { cn } from "@/lib/utils"

interface NewsCardProps {
  article: Article
  className?: string
  showCategory?: boolean
  priority?: boolean
}

export default function NewsCard({ article, className, showCategory = true, priority = false }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })

  // Use a fallback image if the original image fails to load
  const imageSrc =
    imageError || !article.imageUrl
      ? `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(article.title.substring(0, 20))}`
      : article.imageUrl

  const isFeatureCard = className?.includes("md:col-span-2") || className?.includes("lg:col-span-3")

  return (
    <div
      className={cn("group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg", className)}
    >
      <Link href={`/article/${encodeURIComponent(article.id)}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
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
            onError={() => setImageError(true)}
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {showCategory && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">
                {article.category}
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
