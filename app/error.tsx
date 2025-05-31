"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />

      <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>

      <p className="text-muted-foreground mb-6 max-w-md">
        We encountered an unexpected error. This could be a temporary issue with our servers or your connection.
      </p>

      {error.digest && (
        <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted px-2 py-1 rounded">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex gap-4">
        <Button onClick={reset} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>

        <Button variant="outline" asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </Button>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>If this problem persists, please contact support.</p>
      </div>
    </div>
  )
}
