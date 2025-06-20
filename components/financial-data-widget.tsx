"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { useDeviceType } from "@/hooks/use-device-type"
import { Loader2, Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FinancialDataWidgetProps {
  defaultHeight?: number
  allowFullscreen?: boolean
  className?: string
}

export default function FinancialDataWidget({
  defaultHeight = 1000,
  allowFullscreen = true,
  className = "",
}: FinancialDataWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { isMobile, isTablet } = useDeviceType()

  const getWidgetHeight = () => {
    if (isFullscreen) return window.innerHeight
    if (isMobile) return 800
    if (isTablet) return 900
    return defaultHeight
  }

  const height = getWidgetHeight()

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

    const loadWidget = () => {
      try {
        if (!widgetRef.current) {
          widgetRef.current = document.createElement("div")
          widgetRef.current.className = "tradingview-widget-container__widget"
          containerRef.current?.appendChild(widgetRef.current)
        }

        // Clear existing content
        while (widgetRef.current.firstChild) {
          widgetRef.current.removeChild(widgetRef.current.firstChild)
        }

        const copyrightContainer = document.createElement("div")
        copyrightContainer.className = "tradingview-widget-copyright text-xs text-center mt-2"
        copyrightContainer.innerHTML =
          '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="text-blue-400">Track all markets on TradingView</span></a>'

        const existingCopyright = containerRef.current?.querySelector(".tradingview-widget-copyright")
        if (existingCopyright) {
          containerRef.current?.removeChild(existingCopyright)
        }
        containerRef.current?.appendChild(copyrightContainer)

        const script = document.createElement("script")
        script.type = "text/javascript"
        script.async = true
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"

        script.innerHTML = JSON.stringify({
          feedMode: "all_symbols",
          isTransparent: false,
          displayMode: "regular",
          width: "100%",
          height: height,
          colorTheme: "dark",
          locale: "en",
        })

        const widgetId = `tradingview_timeline_${Math.random().toString(36).substring(2, 9)}`
        if (widgetRef.current) {
          widgetRef.current.id = widgetId
        }

        script.onload = () => {
          setIsLoading(false)
        }

        script.onerror = () => {
          console.error("Failed to load timeline script")
          setError("Failed to load financial data")
          setIsLoading(false)
        }

        widgetRef.current?.appendChild(script)
      } catch (err) {
        console.error("Error initializing timeline widget:", err)
        setError("An error occurred while loading financial data")
        setIsLoading(false)
      }
    }

    loadWidget()
  }, [height, isMobile, isTablet, retryCount])

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
            title="Retry loading widget"
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
        className="w-full relative"
        style={{
          height: isFullscreen ? "100vh" : `${height}px`,
          minHeight: "600px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-400">Loading financial data...</p>
              {retryCount > 0 && <p className="text-xs text-gray-500 mt-2">Retry attempt: {retryCount}</p>}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722] p-4">
            <div className="text-center max-w-md">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={retryLoad} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                If the issue persists, please check your internet connection.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
