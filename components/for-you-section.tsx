"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import NewsCard from "./news-card"
import type { Article } from "@/types/news"

interface ForYouSectionProps {
  articles: Article[]
}

export default function ForYouSection({ articles }: ForYouSectionProps) {
  const { user } = useAuth()
  const [personalizedArticles, setPersonalizedArticles] = useState<Article[]>(articles)

  useEffect(() => {
    // If user is logged in, we could fetch personalized articles
    // For now, we'll just shuffle the articles to simulate personalization
    if (user) {
      const shuffled = [...articles].sort(() => 0.5 - Math.random())
      setPersonalizedArticles(shuffled)
    } else {
      setPersonalizedArticles(articles)
    }
  }, [articles, user])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalizedArticles.map((article, index) => (
          <NewsCard
            key={article.id}
            article={article}
            className={index === 0 ? "md:col-span-2 lg:col-span-3" : ""}
            priority={index < 3}
          />
        ))}
      </div>
    </div>
  )
}
