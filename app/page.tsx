import { fetchTopHeadlines } from "@/lib/api-service"
import ForYouSection from "@/components/for-you-section"
import type { Article } from "@/types/news"

export const revalidate = 1800 // Revalidate every 30 minutes

async function getLatestNews(): Promise<{
  featured: Article[]
  technology: Article[]
  science: Article[]
  business: Article[]
}> {
  const [featured, technology, science, business] = await Promise.all([
    fetchTopHeadlines(undefined, "us", 9),
    fetchTopHeadlines("technology", "us", 4),
    fetchTopHeadlines("science", "us", 4),
    fetchTopHeadlines("business", "us", 4),
  ])

  return {
    featured,
    technology,
    science,
    business,
  }
}

export default async function Home() {
  const { featured } = await getLatestNews()

  return (
    <div className="space-y-10">
      <ForYouSection articles={featured} />
    </div>
  )
}
