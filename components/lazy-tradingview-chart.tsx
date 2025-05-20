"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface LazyTradingViewChartProps {
  height?: string
  symbol?: string
}

export default function LazyTradingViewChart({ height = "600px", symbol = "NASDAQ:AAPL" }: LazyTradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)

  // Set up intersection observer to detect when the chart is in view
  useEffect(() => {
    if (!containerRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !hasAttemptedLoad) {
          setIsVisible(true)
          setHasAttemptedLoad(true)
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of the element is visible
      },
    )

    observerRef.current.observe(containerRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasAttemptedLoad])

  // Load the chart when it becomes visible
  useEffect(() => {
    if (!isVisible) return

    setIsLoading(true)
    setError(null)

    try {
      // Encode the chart parameters
      const encodedSymbol = encodeURIComponent(symbol)
      const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodedSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`

      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = ""

        // Create iframe
        const iframe = document.createElement("iframe")
        iframe.src = chartUrl
        iframe.style.width = "100%"
        iframe.style.height = height
        iframe.style.border = "none"
        iframe.title = "TradingView Chart"
        iframe.id = "tradingview_chart"
        iframe.onload = () => {
          setIsLoading(false)
        }
        iframe.onerror = () => {
          console.error("Failed to load chart iframe")
          setError("Failed to load financial chart")
          setIsLoading(false)
        }

        // Append iframe
        containerRef.current.appendChild(iframe)
      }
    } catch (err) {
      console.error("Error initializing chart widget:", err)
      setError("An error occurred while loading the chart")
      setIsLoading(false)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [isVisible, height, symbol])

  return (
    <Card className="overflow-hidden bg-[#131722] border-0">
      <div ref={containerRef} className="w-full relative" style={{ height, minHeight: "300px" }}>
        {!isVisible && !hasAttemptedLoad && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722] p-4">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Scroll down to load stock chart</p>
              <div className="animate-bounce text-blue-500">↓</div>
            </div>
          </div>
        )}

        {isVisible && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-400">Loading chart...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722] p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription className="mb-4">
                There was an error loading the financial data widget. Please try refreshing the page.
              </AlertDescription>
              <Button
                onClick={() => {
                  setIsLoading(true)
                  setError(null)
                  setHasAttemptedLoad(false)
                  setIsVisible(false)
                  // Force re-render
                  setTimeout(() => {
                    if (containerRef.current) {
                      containerRef.current.innerHTML = ""
                      setIsVisible(true)
                      setHasAttemptedLoad(true)
                    }
                  }, 100)
                }}
              >
                Try Again
              </Button>
            </Alert>
          </div>
        )}
      </div>
    </Card>
  )
}
