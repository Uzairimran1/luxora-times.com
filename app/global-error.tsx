"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />

          <h1 className="text-3xl font-bold mb-2">Application Error</h1>

          <p className="text-gray-600 mb-6 max-w-md">
            A critical error occurred. Please refresh the page or contact support if the issue persists.
          </p>

          {error.digest && (
            <p className="text-xs text-gray-500 mb-6 font-mono bg-gray-100 px-2 py-1 rounded">
              Error ID: {error.digest}
            </p>
          )}

          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  )
}
