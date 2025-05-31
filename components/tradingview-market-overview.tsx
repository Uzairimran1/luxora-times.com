"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TradingViewMarketOverviewProps {
  height?: string
  allowFullscreen?: boolean
  className?: string
}

export default function TradingViewMarketOverview({
  height = "600px",
  allowFullscreen = true,
  className = "",
}: TradingViewMarketOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
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
        copyrightContainer.className = "tradingview-widget-copyright"
        copyrightContainer.innerHTML =
          '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>'

        const existingCopyright = containerRef.current?.querySelector(".tradingview-widget-copyright")
        if (existingCopyright) {
          containerRef.current?.removeChild(existingCopyright)
        }
        containerRef.current?.appendChild(copyrightContainer)

        const script = document.createElement("script")
        script.type = "text/javascript"
        script.async = true
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"

        script.innerHTML = JSON.stringify({
          colorTheme: "dark",
          dateRange: "12M",
          showChart: true,
          locale: "en",
          width: "100%",
          height: "100%",
          largeChartUrl: "",
          isTransparent: false,
          showSymbolLogo: true,
          showFloatingTooltip: false,
          plotLineColorGrowing: "rgba(41, 98, 255, 1)",
          plotLineColorFalling: "rgba(41, 98, 255, 1)",
          gridLineColor: "rgba(42, 46, 57, 0)",
          scaleFontColor: "rgba(219, 219, 219, 1)",
          belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
          belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
          belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
          belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
          symbolActiveColor: "rgba(41, 98, 255, 0.12)",
          tabs: [
            {
              title: "Indices",
              symbols: [
                { s: "FOREXCOM:SPXUSD", d: "S&P 500 Index" },
                { s: "FOREXCOM:NSXUSD", d: "US 100 Cash CFD" },
                { s: "FOREXCOM:DJI", d: "Dow Jones Industrial Average Index" },
                { s: "INDEX:NKY", d: "Japan 225" },
                { s: "INDEX:DEU40", d: "DAX Index" },
                { s: "FOREXCOM:UKXGBP", d: "FTSE 100 Index" },
              ],
              originalTitle: "Indices",
            },
            {
              title: "Forex",
              symbols: [
                { s: "FX:EURUSD", d: "EUR to USD" },
                { s: "FX:GBPUSD", d: "GBP to USD" },
                { s: "FX:USDJPY", d: "USD to JPY" },
                { s: "FX:USDCHF", d: "USD to CHF" },
                { s: "FX:AUDUSD", d: "AUD to USD" },
                { s: "FX:USDCAD", d: "USD to CAD" },
              ],
              originalTitle: "Forex",
            },
            {
              title: "Futures",
              symbols: [
                { s: "BMFBOVESPA:ISP1!", d: "S&P 500 Index Futures" },
                { s: "BMFBOVESPA:EUR1!", d: "Euro Futures" },
                { s: "PYTH:WTI3!", d: "WTI CRUDE OIL" },
                { s: "BMFBOVESPA:ETH1!", d: "Hydrous ethanol" },
                { s: "BMFBOVESPA:CCM1!", d: "Corn" },
              ],
              originalTitle: "Futures",
            },
            {
              title: "Bonds",
              symbols: [
                { s: "EUREX:FGBL1!", d: "Euro Bund" },
                { s: "EUREX:FBTP1!", d: "Euro BTP" },
                { s: "EUREX:FGBM1!", d: "Euro BOBL" },
              ],
              originalTitle: "Bonds",
            },
          ],
        })

        script.onload = () => {
          setIsLoading(false)
        }

        script.onerror = () => {
          console.error("Failed to load market overview script")
          setError("Failed to load market overview")
          setIsLoading(false)
        }

        widgetRef.current?.appendChild(script)
      } catch (err) {
        console.error("Error initializing market overview widget:", err)
        setError("An error occurred while loading the market overview")
        setIsLoading(false)
      }
    }

    loadWidget()
  }, [retryCount])

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
          height: isFullscreen ? "100vh" : height,
          minHeight: "400px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-sm text-gray-400">Loading market overview...</p>
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
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
