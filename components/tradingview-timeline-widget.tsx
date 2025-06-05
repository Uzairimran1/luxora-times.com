"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { useDeviceType } from "@/hooks/use-device-type"
import { Loader2, Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TradingViewTimelineWidgetProps {
  width?: number | string
  height?: number
  allowFullscreen?: boolean
  className?: string
}

export default function TradingViewTimelineWidget({
  width = "100%",
  height = 550,
  allowFullscreen = true,
  className = "",
}: TradingViewTimelineWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { isMobile, isTablet } = useDeviceType()

  const getResponsiveHeight = () => {
    if (isFullscreen) return window.innerHeight
    if (isMobile) return 400
    if (isTablet) return 500
    return height
  }

  const getResponsiveWidth = () => {
    if (typeof width === "string") return width
    if (isMobile) return "100%"
    return width
  }

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
        // Clear existing widget
        if (widgetRef.current) {
          while (widgetRef.current.firstChild) {
            widgetRef.current.removeChild(widgetRef.current.firstChild)
          }
        } else {
          widgetRef.current = document.createElement("div")
          widgetRef.current.className = "tradingview-widget-container__widget"
          containerRef.current?.appendChild(widgetRef.current)
        }

        // Create copyright container
        const existingCopyright = containerRef.current?.querySelector(".tradingview-widget-copyright")
        if (existingCopyright) {
          containerRef.current?.removeChild(existingCopyright)
        }

        const copyrightContainer = document.createElement("div")
        copyrightContainer.className = "tradingview-widget-copyright text-xs text-center mt-2 p-2"
        copyrightContainer.innerHTML =
          '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="text-blue-400 hover:text-blue-300">Track all markets on TradingView</span></a>'

        containerRef.current?.appendChild(copyrightContainer)

        // Create and configure script
        const script = document.createElement("script")
        script.type = "text/javascript"
        script.async = true
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"

        const widgetConfig = {
          feedMode: "all_symbols",
          isTransparent: false,
          displayMode: "regular",
          width: getResponsiveWidth(),
          height: getResponsiveHeight(),
          colorTheme: "dark",
          locale: "en",
        }

        script.innerHTML = JSON.stringify(widgetConfig)

        script.onload = () => {
          setIsLoading(false)
        }

        script.onerror = () => {
          console.error("Failed to load TradingView timeline script")
          setError("Failed to load financial timeline data")
          setIsLoading(false)
        }

        widgetRef.current?.appendChild(script)
      } catch (err) {
        console.error("Error initializing TradingView timeline widget:", err)
        setError("An error occurred while loading the financial timeline")
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(loadWidget, 100)
    return () => clearTimeout(timeoutId)
  }, [retryCount, isMobile, isTablet])

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
        className="w-full relative tradingview-widget-container"
        style={{
          height: isFullscreen ? "100vh" : `${getResponsiveHeight()}px`,
          minHeight: "400px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-400">Loading financial timeline...</p>
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
