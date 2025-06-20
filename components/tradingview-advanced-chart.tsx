"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Maximize2, Minimize2, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TradingViewAdvancedChartProps {
  height?: string
  symbol?: string
  allowFullscreen?: boolean
  className?: string
}

export default function TradingViewAdvancedChart({
  height = "600px",
  symbol = "NASDAQ:AAPL",
  allowFullscreen = true,
  className = "",
}: TradingViewAdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    } else {
      containerRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    }
  }

  const retryLoad = () => {
    setRetryCount((prev) => prev + 1)
    setIsLoading(true)
    setError(null)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    if (!containerRef.current) return

    // Clean up previous script
    if (scriptRef.current) {
      document.head.removeChild(scriptRef.current)
      scriptRef.current = null
    }

    // Clear container
    const container = containerRef.current
    const widgetContainer = container.querySelector(".tradingview-widget-container__widget")
    if (widgetContainer) {
      widgetContainer.innerHTML = ""
    }

    // Create widget container if it doesn't exist
    let widgetDiv = container.querySelector(".tradingview-widget-container__widget") as HTMLDivElement
    if (!widgetDiv) {
      widgetDiv = document.createElement("div")
      widgetDiv.className = "tradingview-widget-container__widget"
      widgetDiv.style.height = "calc(100% - 32px)"
      widgetDiv.style.width = "100%"
      container.appendChild(widgetDiv)
    }

    // Create script element
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.async = true
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"

    // Add error handling
    script.onerror = () => {
      console.error("Failed to load TradingView script")
      setError("Failed to load chart. Please check your internet connection.")
      setIsLoading(false)
    }

    script.onload = () => {
      // Add a small delay to allow the widget to initialize
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    }

    // Set script content
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      hide_side_toolbar: window.innerWidth < 768, // Hide on mobile
      withdateranges: true,
      support_host: "https://www.tradingview.com",
      container_id: widgetDiv.id || `tradingview_${Date.now()}`,
    })

    // Assign unique ID if not present
    if (!widgetDiv.id) {
      widgetDiv.id = `tradingview_${Date.now()}`
    }

    scriptRef.current = script
    document.head.appendChild(script)

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (isLoading) {
        setError("Chart loading timed out. Please try again.")
        setIsLoading(false)
      }
    }, 10000)

    return () => {
      clearTimeout(timeout)
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [symbol, retryCount])

  const mobileHeight = window.innerWidth < 768 ? "400px" : height

  return (
    <Card
      className={`overflow-hidden bg-[#131722] border-0 ${isFullscreen ? "fixed inset-0 z-50" : ""} ${className}`}
      ref={containerRef}
    >
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {error && (
          <Button
            variant="ghost"
            size="icon"
            onClick={retryLoad}
            className="bg-black/30 hover:bg-black/50 text-white"
            title="Retry loading chart"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        {allowFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-black/30 hover:bg-black/50 text-white"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div
        className="w-full relative tradingview-widget-container"
        style={{
          height: isFullscreen ? "100vh" : mobileHeight,
          minHeight: "300px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722] z-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-400">Loading advanced chart...</p>
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

        {/* Copyright container */}
        <div className="tradingview-widget-copyright absolute bottom-0 left-0 right-0 text-center text-xs p-2 bg-[#131722]/90">
          <a href="https://www.tradingview.com/" rel="noreferrer noopener nofollow" target="_blank">
            <span className="text-blue-400">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
    </Card>
  )
}
