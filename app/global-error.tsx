"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Something went wrong!</p>
                    <p className="text-sm">
                      We encountered an unexpected error. This could be a temporary issue with our servers or your
                      connection.
                    </p>
                    {error.digest && <p className="text-xs mt-2 font-mono">Error ID: {error.digest}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={reset} className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => (window.location.href = "/")}
                      className="flex items-center gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Go home
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="text-center text-sm text-muted-foreground">
              <p>If this problem persists, please contact support.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
