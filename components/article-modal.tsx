"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { X, ExternalLink, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import SaveArticleButton from "./save-article-button"
import type { Article } from "@/types/news"
import { cn } from "@/lib/utils"

interface ArticleModalProps {
  article: Article | null
  isOpen: boolean
  onClose: () => void
}

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!article) return null

  const formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })

  // Process article content for better display
  const processedContent = article.content
    ? article.content
        .split("\n")
        .filter((paragraph) => paragraph.trim().length > 0)
        .map((paragraph) => paragraph.replace(/\[\+\d+ chars\]$/, "").trim())
    : []

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleShare = async () => {
    if (navigator.share && article.url) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to copying to clipboard
      if (article.url) {
        navigator.clipboard.writeText(article.url)
      }
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible",
      )}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full max-w-4xl max-h-[90vh] bg-background rounded-2xl shadow-2xl transition-all duration-500 ease-out overflow-hidden",
          isOpen && isAnimating ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              <Link href={`/category/${article.category}`} className="text-primary hover:underline">
                {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
              </Link>{" "}
              • {formattedDate}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare} className="h-8 w-8 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
            <SaveArticleButton article={article} variant="icon" />
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{article.title}</h1>

            {/* Source */}
            <div className="text-sm text-muted-foreground mb-6">
              Source: <span className="font-medium">{article.source}</span>
            </div>

            {/* Image */}
            <div className="relative aspect-video w-full mb-6 overflow-hidden rounded-xl">
              <Image
                src={article.imageUrl || "/placeholder.svg?height=600&width=1200"}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=600&width=1200"
                }}
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg font-medium mb-6 text-muted-foreground">{article.description}</p>

              {processedContent.length > 0 ? (
                processedContent.map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="mb-4 text-muted-foreground">
                  Full article content is available at the source link below.
                </p>
              )}
            </div>

            {/* External Link */}
            {article.url && (
              <div className="mt-8 p-4 bg-muted rounded-xl">
                <p className="font-medium mb-3">Read the full article:</p>
                <Button asChild className="w-full">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Original Article
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
