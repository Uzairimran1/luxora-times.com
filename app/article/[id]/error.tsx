"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Article error:", error)
  }, [error])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-destructive/10 border border-destructive rounded-md p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to Load Article</h2>
          <p className="text-muted-foreground max-w-md">
            We encountered an error while loading this article. This could be due to a temporary issue or the article
            may no longer be available.
          </p>
          {error.digest && (
            <p className="text-xs mt-4 font-mono bg-muted px-2 py-1 rounded">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
