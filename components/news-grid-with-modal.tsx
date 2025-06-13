"use client"

import { useState } from "react"
import NewsCard from "./news-card"
import ArticleModal from "./article-modal"
import type { Article } from "@/types/news"

interface NewsGridWithModalProps {
  articles: Article[]
  className?: string
  showCategory?: boolean
}

export default function NewsGridWithModal({ articles, className, showCategory = true }: NewsGridWithModalProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Delay clearing the article to allow for exit animation
    setTimeout(() => {
      setSelectedArticle(null)
    }, 300)
  }

  return (
    <>
      <div className={className}>
        {articles.map((article, index) => (
          <NewsCard
            key={article.id}
            article={article}
            showCategory={showCategory}
            priority={index < 3}
            onArticleClick={handleArticleClick}
          />
        ))}
      </div>

      <ArticleModal article={selectedArticle} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  )
}
