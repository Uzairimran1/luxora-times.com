"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import type { Article } from "@/types/news"

interface LinearNewsCardProps {
  article: Article
  priority?: boolean
  index: number
}

export default function LinearNewsCard({ article, priority = false, index }: LinearNewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const hasImage = article.imageUrl && !imageError

  // Format the date
  const formattedDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : "Recently"

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.05,
      },
    },
  }

  return (
    <motion.article variants={cardVariants} initial="hidden" animate="visible" className="py-6 first:pt-0">
      <div className="flex flex-col md:flex-row gap-6">
        {hasImage && (
          <div className="relative h-48 md:h-32 md:w-48 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={article.imageUrl || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority={priority}
            />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">{article.source}</span>
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formattedDate}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2 leading-tight">{article.title}</h3>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.description}</p>

          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 flex items-center w-fit"
          >
            Read more <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
