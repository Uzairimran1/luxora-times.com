"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SimpleTradingViewChartProps {
  height?: string
  symbol?: string
  className?: string
}

export default function SimpleTradingViewChart({
  height = "500px",
  symbol = "NASDAQ:AAPL",
  className = "",
}: SimpleTradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const retryLoad = () => {
    setRetryCount((prev) => prev + 1)
    setIsLoading(true)
    setError(null)
  }

  useEffect(() => {
    if (!containerRef.current) return

    setIsLoading(true)
    setError(null)

    const container = containerRef.current

    // Clear previous content
    container.innerHTML = ""

    try {
      // Create the widget container
      const widgetContainer = document.createElement("div")
      widgetContainer.className = "tradingview-widget-container"
      widgetContainer.style.height = "100%"
      widgetContainer.style.width = "100%"

      const widgetDiv = document.createElement("div")
      widgetDiv.className = "tradingview-widget-container__widget"
      widgetDiv.style.height = "calc(100% - 32px)"
      widgetDiv.style.width = "100%"

      const copyrightDiv = document.createElement("div")
      copyrightDiv.className = "tradingview-widget-copyright"
      copyrightDiv.innerHTML = `
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span class="blue-text">Track all markets on TradingView</span>
        </a>
      `

      widgetContainer.appendChild(widgetDiv)
      widgetContainer.appendChild(copyrightDiv)
      container.appendChild(widgetContainer)

      // Create and load the script
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
      script.async = true

      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        allow_symbol_change: true,
        support_host: "https://www.tradingview.com",
      })

      script.onload = () => {
        setTimeout(() => {
          setIsLoading(false)
        }, 3000)
      }

      script.onerror = () => {
        setError("Failed to load TradingView chart")
        setIsLoading(false)
      }

      widgetDiv.appendChild(script)

      // Timeout fallback
      const timeout = setTimeout(() => {
        if (isLoading) {
          setError("Chart loading timed out")
          setIsLoading(false)
        }
      }, 15000)

      return () => {
        clearTimeout(timeout)
      }
    } catch (err) {
      console.error("Error setting up chart:", err)
      setError("Failed to initialize chart")
      setIsLoading(false)
    }
  }, [symbol, retryCount])

  return (
    <Card className={`overflow-hidden bg-[#131722] border-0 ${className}`} ref={containerRef}>
      <div
        className="w-full relative"
        style={{
          height: height,
          minHeight: "400px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722] z-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-400">Loading TradingView chart...</p>
              {retryCount > 0 && <p className="text-xs text-gray-500 mt-2">Retry attempt: {retryCount}</p>}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722] p-4 z-20">
            <Alert variant="destructive" className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Chart Loading Error</p>
                  <p className="text-sm">{error}</p>
                  <Button onClick={retryLoad} size="sm" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </Card>
  )
}
