"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Clock, ArrowUpRight } from "lucide-react"
import SaveArticleButton from "./save-article-button"
import { cn } from "@/lib/utils"
import type { Article } from "@/types/news"

interface EnhancedNewsCardProps {
  article: Article
  className?: string
  showCategory?: boolean
  priority?: boolean
}

export default function EnhancedNewsCard({
  article,
  className,
  showCategory = true,
  priority = false,
}: EnhancedNewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [themeColor, setThemeColor] = useState("#1e293b")
  const [textColor, setTextColor] = useState("#ffffff")

  // Generate a theme color based on the article category or source
  useEffect(() => {
    // Map categories to specific colors for consistency
    const categoryColors: Record<string, { bg: string; text: string }> = {
      business: { bg: "#0f766e", text: "#ffffff" }, // Teal
      technology: { bg: "#1d4ed8", text: "#ffffff" }, // Blue
      science: { bg: "#7e22ce", text: "#ffffff" }, // Purple
      health: { bg: "#16a34a", text: "#ffffff" }, // Green
      entertainment: { bg: "#db2777", text: "#ffffff" }, // Pink
      sports: { bg: "#ea580c", text: "#ffffff" }, // Orange
      politics: { bg: "#dc2626", text: "#ffffff" }, // Red
      world: { bg: "#4338ca", text: "#ffffff" }, // Indigo
      general: { bg: "#475569", text: "#ffffff" }, // Slate
      cryptocurrency: { bg: "#f59e0b", text: "#000000" }, // Amber
      finance: { bg: "#065f46", text: "#ffffff" }, // Emerald
    }

    // Extract category from the article, defaulting to lowercase
    const category = (article.category || "").toLowerCase()

    // Check if we have a predefined color for this category
    if (categoryColors[category]) {
      setThemeColor(categoryColors[category].bg)
      setTextColor(categoryColors[category].text)
      return
    }

    // If no category match, generate a color based on the source
    const source = article.source || ""
    let hash = 0
    for (let i = 0; i < source.length; i++) {
      hash = source.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Generate HSL color with controlled lightness for readability
    const h = Math.abs(hash % 360)
    const s = 65 + (hash % 20) // 65-85% saturation
    const l = 30 + (hash % 15) // 30-45% lightness for dark backgrounds

    setThemeColor(`hsl(${h}, ${s}%, ${l}%)`)
    setTextColor("#ffffff") // White text on dark backgrounds
  }, [article.category, article.source])

  // Format the date
  let formattedDate
  try {
    formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
  } catch (e) {
    formattedDate = "Recently"
  }

  // Check if the article is about cryptocurrency
  const isCryptoArticle =
    article.title.toLowerCase().includes("bitcoin") ||
    article.title.toLowerCase().includes("crypto") ||
    article.title.toLowerCase().includes("ethereum") ||
    article.title.toLowerCase().includes("btc") ||
    article.title.toLowerCase().includes("eth") ||
    article.category?.toLowerCase() === "cryptocurrency"

  // Generate a contextually relevant image if the original fails
  const getCryptoImage = () => {
    if (article.title.toLowerCase().includes("bitcoin") || article.title.toLowerCase().includes("btc")) {
      return "/crypto-icons/bitcoin.png"
    } else if (article.title.toLowerCase().includes("ethereum") || article.title.toLowerCase().includes("eth")) {
      return "/crypto-icons/ethereum.png"
    } else {
      return "/crypto-icons/cryptocurrency.png"
    }
  }

  // Determine the image source to use
  const getImageSrc = () => {
    if (!imageError && article.imageUrl) {
      return article.imageUrl
    }

    // If it's a crypto article, use a relevant crypto icon
    if (isCryptoArticle) {
      return getCryptoImage()
    }

    // Otherwise use a category-based image
    const categoryImages: Record<string, string> = {
      business: "/category-images/business.png",
      technology: "/category-images/technology.png",
      science: "/category-images/science.png",
      health: "/category-images/health.png",
      entertainment: "/category-images/entertainment.png",
      sports: "/category-images/sports.png",
      politics: "/category-images/politics.png",
      world: "/category-images/world.png",
    }

    const category = (article.category || "").toLowerCase()
    if (categoryImages[category]) {
      return categoryImages[category]
    }

    // Final fallback - use a placeholder with the article title
    return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(article.title.substring(0, 20))}`
  }

  const imageSrc = getImageSrc()
  const isFeatureCard = className?.includes("md:col-span-2") || className?.includes("lg:col-span-3")

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary",
        className,
      )}
    >
      <Link href={`/article/${encodeURIComponent(article.id)}`} className="block focus:outline-none">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          {/* Main image */}
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={article.title}
            fill
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              isCryptoArticle && imageError && "object-contain p-8 bg-black",
            )}
            sizes={
              isFeatureCard
                ? "(max-width: 768px) 100vw, 100vw"
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            }
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            priority={priority}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            style={{
              background: `linear-gradient(to top, ${themeColor}ee, ${themeColor}99 40%, ${themeColor}33)`,
            }}
          />

          {/* Category badge */}
          {showCategory && article.category && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${themeColor}`, color: textColor }}
              >
                {article.category}
              </span>
            </div>
          )}

          {/* Content area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            {/* Title */}
            <h3
              className={cn("font-bold line-clamp-2 mb-2", isFeatureCard ? "text-2xl" : "text-lg")}
              style={{ color: textColor }}
            >
              {article.title}
            </h3>

            {/* Description for feature cards */}
            {isFeatureCard && (
              <p className="text-sm line-clamp-2 mb-2" style={{ color: `${textColor}cc` }}>
                {article.description}
              </p>
            )}

            {/* Source and date */}
            <div className="flex items-center justify-between text-xs" style={{ color: `${textColor}aa` }}>
              <div className="flex items-center gap-1">
                <span>{article.source}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </Link>

      {/* Save button */}
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
