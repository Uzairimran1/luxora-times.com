"use client"

import { useState } from "react"
import { clearCache } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function CacheManager() {
  const [isClearing, setIsClearing] = useState(false)
  const [lastCleared, setLastCleared] = useState<Date | null>(null)

  const handleClearCache = () => {
    setIsClearing(true)

    try {
      clearCache()
      setLastCleared(new Date())
    } catch (error) {
      console.error("Error clearing cache:", error)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Management</CardTitle>
        <CardDescription>Clear the API cache to fetch fresh data from the news APIs.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          The cache is used to reduce API calls and improve performance. Clearing the cache will force the application
          to fetch fresh data from the news APIs on the next request.
        </p>

        {lastCleared && <p className="text-sm text-gray-500 mt-2">Last cleared: {lastCleared.toLocaleString()}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleClearCache} disabled={isClearing}>
          {isClearing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Clearing...
            </>
          ) : (
            "Clear Cache"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
