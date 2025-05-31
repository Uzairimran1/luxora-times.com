"use client"

import SimpleTradingViewChart from "@/components/simple-tradingview-chart"
import SimpleMarketData from "@/components/simple-market-data"
import FinancialTicker from "@/components/financial-ticker"
import Link from "next/link"
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Smartphone } from "lucide-react"
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

  return (
    <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Financial Data Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Comprehensive financial market data powered by TradingView
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
          <FinancialTicker height={isMobile ? 50 : 60} />
        </div>
      </ErrorBoundary>

      {/* Mobile optimization notice */}
      {isMobile && (
        <Alert className="mb-6">
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Mobile Optimized View</p>
              <p className="text-sm">
                Financial widgets have been optimized for mobile viewing. Charts may take a moment to load.
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
              Real-time market data and interactive charts. Use the tabs below to navigate between different financial
              tools.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="chart" className="mb-8">
        <TabsList className={`grid w-full ${isMobile ? "grid-cols-2" : "grid-cols-3"} mb-6`}>
          <TabsTrigger value="chart" className="flex items-center gap-1 text-xs md:text-sm">
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
            Chart
          </TabsTrigger>
          <TabsTrigger value="market-data" className="flex items-center gap-1 text-xs md:text-sm">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
            Market Data
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-1 text-xs md:text-sm">
            <PieChart className="h-3 w-3 md:h-4 md:w-4" />
            Overview
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
                Interactive chart with technical analysis tools and symbol search
              </CardDescription>
            </CardHeader>
          </Card>
          <ErrorBoundary fallback={WidgetErrorFallback}>
            <div className="min-h-[400px] md:min-h-[600px]">
              <SimpleTradingViewChart height={isMobile ? "400px" : "600px"} />
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
              <CardDescription className="text-sm">Real-time quotes for major markets and instruments</CardDescription>
            </CardHeader>
          </Card>
          <ErrorBoundary fallback={WidgetErrorFallback}>
            <SimpleMarketData />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="overview">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <PieChart className="h-5 w-5" />
                Market Overview
              </CardTitle>
              <CardDescription className="text-sm">Comprehensive overview of global financial markets</CardDescription>
            </CardHeader>
          </Card>
          <ErrorBoundary fallback={WidgetErrorFallback}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleTradingViewChart height="400px" symbol="NASDAQ:AAPL" />
              <SimpleMarketData />
            </div>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      <div className="text-center text-xs md:text-sm text-muted-foreground space-y-2">
        <p>Financial data provided by TradingView. Data may be delayed.</p>
        <p>Charts and market data update in real-time.</p>
      </div>
    </main>
  )
}
