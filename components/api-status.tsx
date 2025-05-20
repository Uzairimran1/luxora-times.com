"use client"

import { useState, useEffect } from "react"
import { getApiUsageStats } from "@/lib/api-service"
import type { ApiUsage } from "@/types/news"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDistanceToNow } from "date-fns"

export default function ApiStatus() {
  const [apiUsage, setApiUsage] = useState<Record<string, ApiUsage> | null>(null)

  useEffect(() => {
    // Get API usage stats on component mount
    setApiUsage(getApiUsageStats())

    // Update API usage stats every minute
    const interval = setInterval(() => {
      setApiUsage(getApiUsageStats())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  if (!apiUsage) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">API Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(apiUsage).map(([sourceId, usage]) => {
          const source = sourceId === "newsapi" ? "NewsAPI" : "NewsData.io"
          const limit = sourceId === "newsapi" ? 100 : 200
          const percentage = Math.round((usage.remainingCalls / limit) * 100)
          const resetTime = new Date(usage.resetTime)

          return (
            <Card key={sourceId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{source}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Remaining calls: {usage.remainingCalls}/{limit}
                    </span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500">Resets {formatDistanceToNow(resetTime, { addSuffix: true })}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
