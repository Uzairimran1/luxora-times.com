import { Suspense } from "react"
import SavedArticlesList from "@/components/saved-articles-list"

export const metadata = {
  title: "Saved Articles - Luxora Times",
  description: "Your saved articles on Luxora Times",
}

export default function SavedPage() {
  return (
    <div>
      <h1>Saved Articles</h1>

      <Suspense fallback={<div>Loading saved articles...</div>}>
        <SavedArticlesList />
      </Suspense>
    </div>
  )
}
