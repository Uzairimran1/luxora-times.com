"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { useDeviceType } from "@/hooks/use-device-type"
import { Loader2 } from "lucide-react"

interface TradingViewAdvancedChartProps {
  symbol?: string
  height?: number | string
}

// Declare TradingView as a global variable
declare global {
  interface Window {
    TradingView: any
  }
}

export default function TradingViewAdvancedChart({
  symbol = "NASDAQ:AAPL",
  height = "600px",
}: TradingViewAdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isMobile } = useDeviceType()

  // Convert height to string with px if it's a number
  const heightStyle = typeof height === "number" ? `${height}px` : height

  useEffect(() => {
    // Reset states when symbol changes
    setIsLoading(true)
    setError(null)

    // Safety check for container
    if (!containerRef.current) return

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
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && widgetRef.current) {
        try {
          // Clear the widget container first
          while (widgetRef.current.firstChild) {
            widgetRef.current.removeChild(widgetRef.current.firstChild)
          }

          // Create new widget
          new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: "D",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            hide_side_toolbar: isMobile,
            allow_symbol_change: true,
            container_id: widgetRef.current.id || "tradingview_chart",
            withdateranges: true,
          })

          setIsLoading(false)
        } catch (err) {
          console.error("Error initializing TradingView widget:", err)
          setError("Failed to initialize chart. Please try again.")
          setIsLoading(false)
        }
      } else {
        setError("TradingView library failed to load")
        setIsLoading(false)
      }
    }

    script.onerror = () => {
      setError("Failed to load TradingView script")
      setIsLoading(false)
    }

    // Add a unique ID to the widget container
    if (widgetRef.current && !widgetRef.current.id) {
      widgetRef.current.id = `tradingview_chart_${Math.random().toString(36).substring(2, 9)}`
    }

    // Add the script to the document
    document.body.appendChild(script)

    // Cleanup function
    return () => {
      // Remove the script from the document
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }

      // We don't remove the widget container here to avoid the removeChild error
      // It will be reused or cleared on the next render
    }
  }, [symbol, isMobile])

  return (
    <Card className="overflow-hidden bg-[#131722] border-0">
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full relative"
        style={{ height: heightStyle, minHeight: "400px" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-400">Loading chart...</p>
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
                  const currentSymbol = symbol
                  // This is a hack to force the useEffect to run again
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
