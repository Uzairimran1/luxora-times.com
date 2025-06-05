"use client"

import SimpleTradingViewChart from "@/components/simple-tradingview-chart"
import SimpleMarketData from "@/components/simple-market-data"
import TradingViewTimelineWidget from "@/components/tradingview-timeline-widget"
import TradingViewMarketOverview from "@/components/tradingview-market-overview"
import FinancialTicker from "@/components/financial-ticker"
import Link from "next/link"
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Smartphone, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ErrorBoundary } from "@/components/error-boundary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Fallback component for when widgets fail
function WidgetErrorFallback({ error, resetErrorBoundary }: { error?: Error; resetErrorBoundary?: () => void }) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertDescription>
        <div className="space-y-2">
          <p>There was an error loading the financial data widget.</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
          <Button onClick={resetErrorBoundary} size="sm">
            Try Again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default function FinancialDataClient() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024

  return (
    <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Financial Data Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Comprehensive financial market data powered by TradingView with enhanced visibility
          </p>
        </div>
        <Link href="/" className="mt-4 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Financial Ticker */}
      <ErrorBoundary fallback={WidgetErrorFallback}>
        <div className="mb-6 md:mb-8">
          <FinancialTicker height={isMobile ? 60 : 80} />
        </div>
      </ErrorBoundary>

      {/* Mobile optimization notice */}
      {isMobile && (
        <Alert className="mb-6">
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Enhanced Mobile View</p>
              <p className="text-sm">
                Financial widgets have been optimized with larger dimensions for better mobile viewing. Charts may take
                a moment to load.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6">
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Enhanced Financial Dashboard</p>
            <p className="text-sm">
              Real-time market data with enhanced visibility and larger widget dimensions for improved readability and
              user engagement. Use the tabs below to navigate between different financial tools.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="chart" className="mb-8">
        <TabsList className={`grid w-full ${isMobile ? "grid-cols-2" : "grid-cols-4"} mb-6`}>
          <TabsTrigger value="chart" className="flex items-center gap-1 text-xs md:text-sm">
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
            Chart
          </TabsTrigger>
          <TabsTrigger value="market-overview" className="flex items-center gap-1 text-xs md:text-sm">
            <PieChart className="h-3 w-3 md:h-4 md:w-4" />
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="market-data" className="flex items-center gap-1 text-xs md:text-sm">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
            Market Data
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1 text-xs md:text-sm">
            <Clock className="h-3 w-3 md:h-4 md:w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <BarChart3 className="h-5 w-5" />
                Advanced Trading Chart
              </CardTitle>
              <CardDescription className="text-sm">
                Interactive chart with enhanced dimensions, technical analysis tools and symbol search
              </CardDescription>
            </CardHeader>
          </Card>
          <ErrorBoundary fallback={WidgetErrorFallback}>
            <div className="min-h-[500px] md:min-h-[800px]">
              <SimpleTradingViewChart height={isMobile ? "500px" : isTablet ? "700px" : "800px"} />
            </div>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="market-overview">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <PieChart className="h-5 w-5" />
                Market Overview
              </CardTitle>
              <CardDescription className="text-sm">
                Enhanced comprehensive overview with indices, forex, futures, and bonds data
              </CardDescription>
            </CardHeader>
          </Card>
          <ErrorBoundary fallback={WidgetErrorFallback}>
            <div className="min-h-[600px] md:min-h-[700px]">
              <TradingViewMarketOverview
                height={isMobile ? 500 : isTablet ? 600 : 700}
                width="100%"
                allowFullscreen={true}
              />
            </div>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="market-data">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <TrendingUp className="h-5 w-5" />
                Market Data
              </CardTitle>
              <CardDescription className="text-sm">
                Enhanced real-time quotes for major markets and instruments
              </CardDescription>
            </CardHeader>
          </Card>
          <ErrorBoundary fallback={WidgetErrorFallback}>
            <div className="min-h-[600px]">
              <SimpleMarketData />
            </div>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Clock className="h-5 w-5" />
                Financial News Timeline
              </CardTitle>
              <CardDescription className="text-sm">
                Enhanced real-time financial news and market events with improved visibility
              </CardDescription>
            </CardHeader>
          </Card>
          <ErrorBoundary fallback={WidgetErrorFallback}>
            <div className="min-h-[600px] md:min-h-[700px]">
              <TradingViewTimelineWidget
                height={isMobile ? 500 : isTablet ? 600 : 700}
                width="100%"
                allowFullscreen={true}
              />
            </div>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      <div className="text-center text-xs md:text-sm text-muted-foreground space-y-2">
        <p>Financial data provided by TradingView with enhanced visibility. Data may be delayed.</p>
        <p>Charts, market overview, market data, and news timeline update in real-time.</p>
      </div>
    </main>
  )
}
