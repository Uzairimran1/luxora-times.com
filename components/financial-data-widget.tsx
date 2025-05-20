"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { useDeviceType } from "@/hooks/use-device-type"
import { Loader2 } from "lucide-react"

interface FinancialDataWidgetProps {
  defaultHeight?: number
}

export default function FinancialDataWidget({ defaultHeight = 700 }: FinancialDataWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isMobile, isTablet } = useDeviceType()

  // Determine appropriate height based on device type
  const getWidgetHeight = () => {
    if (isMobile) return 500
    if (isTablet) return 600
    return defaultHeight // Desktop
  }

  const height = getWidgetHeight()

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    // Safety check for container
    if (!containerRef.current) return

    try {
      // Create widget container if it doesn't exist
      if (!widgetRef.current) {
        widgetRef.current = document.createElement("div")
        widgetRef.current.className = "tradingview-widget-container__widget"
        containerRef.current.appendChild(widgetRef.current)
      }

      // Create a clean container for the copyright
      const copyrightContainer = document.createElement("div")
      copyrightContainer.className = "tradingview-widget-copyright text-xs text-center mt-2"
      copyrightContainer.innerHTML =
        '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="text-blue-400">Track all markets on TradingView</span></a>'

      // Ensure we're not duplicating the copyright
      const existingCopyright = containerRef.current.querySelector(".tradingview-widget-copyright")
      if (existingCopyright) {
        containerRef.current.removeChild(existingCopyright)
      }
      containerRef.current.appendChild(copyrightContainer)

      // Create the script element
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.async = true
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"

      // Set the widget configuration
      script.innerHTML = JSON.stringify({
        feedMode: "all_symbols",
        isTransparent: false,
        displayMode: "regular",
        width: "100%",
        height: height,
        colorTheme: "dark",
        locale: "en",
      })

      // Add a unique ID to the widget container
      if (widgetRef.current && !widgetRef.current.id) {
        widgetRef.current.id = `tradingview_timeline_${Math.random().toString(36).substring(2, 9)}`
      }

      script.onload = () => {
        setIsLoading(false)
      }

      script.onerror = () => {
        console.error("Failed to load timeline script")
        setError("Failed to load financial data")
        setIsLoading(false)
      }

      // Clear any existing scripts to avoid duplicates
      const existingScript = widgetRef.current.querySelector("script")
      if (existingScript) {
        widgetRef.current.removeChild(existingScript)
      }

      // Add the script to the widget container
      widgetRef.current.appendChild(script)
    } catch (err) {
      console.error("Error initializing timeline widget:", err)
      setError("An error occurred while loading financial data")
      setIsLoading(false)
    }

    // Cleanup function
    return () => {
      // We don't remove the widget container here to avoid the removeChild error
      // It will be reused or cleared on the next render
    }
  }, [height, isMobile, isTablet])

  return (
    <Card className="overflow-hidden bg-[#131722] border-0">
      <div ref={containerRef} className="w-full relative" style={{ height: `${height}px`, minHeight: "300px" }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-400">Loading financial data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722] p-4">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  setIsLoading(true)
                  setError(null)

                  // Force re-render by updating the widget container
                  if (widgetRef.current) {
                    while (widgetRef.current.firstChild) {
                      widgetRef.current.removeChild(widgetRef.current.firstChild)
                    }
                  }

                  // Trigger the useEffect again
                  setTimeout(() => {
                    if (containerRef.current) {
                      const event = new Event("resize")
                      window.dispatchEvent(event)
                    }
                  }, 100)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
