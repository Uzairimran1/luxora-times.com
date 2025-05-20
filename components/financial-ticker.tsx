"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface FinancialTickerProps {
  height?: number
}

export default function FinancialTicker({ height = 46 }: FinancialTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

      // Create the script element
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.async = true
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"

      // Set the widget configuration
      script.innerHTML = JSON.stringify({
        symbols: [
          {
            proName: "FOREXCOM:SPXUSD",
            title: "S&P 500",
          },
          {
            proName: "FOREXCOM:NSXUSD",
            title: "Nasdaq 100",
          },
          {
            proName: "FX_IDC:EURUSD",
            title: "EUR/USD",
          },
          {
            proName: "BITSTAMP:BTCUSD",
            title: "BTC/USD",
          },
          {
            proName: "BITSTAMP:ETHUSD",
            title: "ETH/USD",
          },
        ],
        showSymbolLogo: true,
        colorTheme: "dark",
        isTransparent: false,
        displayMode: "adaptive",
        locale: "en",
      })

      // Add a unique ID to the widget container
      if (widgetRef.current && !widgetRef.current.id) {
        widgetRef.current.id = `tradingview_ticker_${Math.random().toString(36).substring(2, 9)}`
      }

      script.onload = () => {
        setIsLoading(false)
      }

      script.onerror = () => {
        console.error("Failed to load ticker script")
        setError("Failed to load ticker")
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
      console.error("Error initializing ticker widget:", err)
      setError("An error occurred while loading ticker")
      setIsLoading(false)
    }

    // Cleanup function
    return () => {
      // We don't remove the widget container here to avoid the removeChild error
      // It will be reused or cleared on the next render
    }
  }, [])

  return (
    <Card className="overflow-hidden bg-[#131722] border-0">
      <div ref={containerRef} className="w-full relative" style={{ height: `${height}px`, minHeight: "46px" }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]">
            <div className="text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]">
            <div className="text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
