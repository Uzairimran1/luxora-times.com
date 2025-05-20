import type { Article } from "@/types/news"

// Fallback data for when the API fails
export const fallbackArticles: Article[] = [
  {
    id: "fallback-1",
    title: "Scientists Discover New Species in Amazon Rainforest",
    description:
      "A team of international researchers has discovered a new species of frog in the Amazon rainforest, highlighting the region's incredible biodiversity.",
    content:
      "A team of international researchers has discovered a new species of frog in the Amazon rainforest, highlighting the region's incredible biodiversity. The newly discovered species, named Pristimantis amazonicus, is known for its unique coloration and mating call. This discovery comes at a crucial time when conservation efforts in the Amazon are more important than ever.\n\nThe research team spent three months in remote areas of the rainforest, documenting various species and their habitats. \"This discovery shows that there is still so much we don't know about the Amazon,\" said lead researcher Dr. Maria Santos.",
    url: "https://example.com/amazon-discovery",
    imageUrl: "/placeholder.svg?height=400&width=600&text=Amazon+Rainforest",
    publishedAt: new Date().toISOString(),
    source: "Science Daily",
    category: "science",
  },
  {
    id: "fallback-2",
    title: "New AI Model Can Predict Climate Change Patterns",
    description:
      "Researchers have developed a new AI model that can predict climate change patterns with unprecedented accuracy, potentially revolutionizing climate science.",
    content:
      'Researchers have developed a new AI model that can predict climate change patterns with unprecedented accuracy, potentially revolutionizing climate science. The model, developed by a team at MIT, uses deep learning algorithms to analyze historical climate data and make predictions about future patterns.\n\n"This is a game-changer for climate science," said Dr. James Chen, the lead researcher. "Our model can predict temperature changes, precipitation patterns, and extreme weather events with 85% accuracy, which is significantly better than previous models."',
    url: "https://example.com/ai-climate-model",
    imageUrl: "/placeholder.svg?height=400&width=600&text=AI+Climate+Model",
    publishedAt: new Date().toISOString(),
    source: "Tech Innovations",
    category: "technology",
  },
  {
    id: "fallback-3",
    title: "Global Stock Markets See Record Gains",
    description:
      "Stock markets around the world have seen record gains this quarter, with technology and healthcare sectors leading the way.",
    content:
      'Stock markets around the world have seen record gains this quarter, with technology and healthcare sectors leading the way. The S&P 500 rose by 12%, while the NASDAQ saw a 15% increase. European and Asian markets also reported significant gains.\n\nAnalysts attribute this growth to strong corporate earnings, decreased inflation, and optimistic economic forecasts. "We\'re seeing a perfect storm of positive economic indicators," said financial analyst Sarah Johnson. "Companies are reporting strong earnings, inflation is under control, and consumer confidence is high."',
    url: "https://example.com/stock-market-gains",
    imageUrl: "/placeholder.svg?height=400&width=600&text=Stock+Market",
    publishedAt: new Date().toISOString(),
    source: "Financial Times",
    category: "business",
  },
  {
    id: "fallback-4",
    title: "New Study Shows Benefits of Mediterranean Diet",
    description:
      "A comprehensive study has confirmed that the Mediterranean diet can significantly reduce the risk of heart disease and improve longevity.",
    content:
      'A comprehensive study has confirmed that the Mediterranean diet can significantly reduce the risk of heart disease and improve longevity. The study, which followed 10,000 participants over 15 years, found that those who adhered to the Mediterranean diet had a 30% lower risk of heart disease and lived an average of 3 years longer than those who didn\'t.\n\n"The results are clear," said Dr. Elena Papadakis, the study\'s lead author. "A diet rich in olive oil, nuts, fruits, vegetables, and fish, with moderate consumption of wine and limited red meat, can have profound health benefits."',
    url: "https://example.com/mediterranean-diet",
    imageUrl: "/placeholder.svg?height=400&width=600&text=Mediterranean+Diet",
    publishedAt: new Date().toISOString(),
    source: "Health Journal",
    category: "health",
  },
  {
    id: "fallback-5",
    title: "Major Film Studio Announces New Superhero Franchise",
    description:
      "A major film studio has announced a new superhero franchise based on a popular comic book series, with production set to begin next year.",
    content:
      'A major film studio has announced a new superhero franchise based on a popular comic book series, with production set to begin next year. The franchise will consist of five films and will feature an ensemble cast of A-list actors.\n\n"We\'re thrilled to bring these beloved characters to the big screen," said studio executive Michael Brown. "We\'ve assembled an incredible team of writers, directors, and actors to create a cinematic experience that fans will love."',
    url: "https://example.com/superhero-franchise",
    imageUrl: "/placeholder.svg?height=400&width=600&text=Superhero+Franchise",
    publishedAt: new Date().toISOString(),
    source: "Entertainment Weekly",
    category: "entertainment",
  },
]

// Generate fallback articles for specific categories
export function getFallbackArticlesByCategory(category: string, count = 4): Article[] {
  const categoryArticles = fallbackArticles.filter((article) => article.category === category)

  // If we have enough articles in the category, return them
  if (categoryArticles.length >= count) {
    return categoryArticles.slice(0, count)
  }

  // Otherwise, create new ones based on the category
  const newArticles: Article[] = []

  for (let i = 0; i < count - categoryArticles.length; i++) {
    newArticles.push({
      id: `fallback-${category}-${i}`,
      title: `Latest Developments in ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: `Stay updated with the latest news and developments in the world of ${category}.`,
      content: `Stay updated with the latest news and developments in the world of ${category}. This article provides an overview of recent trends, breakthroughs, and important events in the ${category} sector.\n\nExperts predict significant advancements in this field in the coming months, with implications for both industry professionals and the general public.`,
      url: `https://example.com/${category}-news`,
      imageUrl: `/placeholder.svg?height=400&width=600&text=${category.charAt(0).toUpperCase() + category.slice(1)}`,
      publishedAt: new Date().toISOString(),
      source: "Luxora Times",
      category,
    })
  }

  return [...categoryArticles, ...newArticles].slice(0, count)
}
