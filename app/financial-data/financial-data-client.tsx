"use client"

import FinancialDataWidget from "@/components/financial-data-widget"
import FinancialTicker from "@/components/financial-ticker"
import TradingViewAdvancedChart from "@/components/tradingview-advanced-chart"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ErrorBoundary } from "react-error-boundary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Fallback component for when widgets fail
function WidgetErrorFallback() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertDescription>
        There was an error loading the financial data widget. Please try refreshing the page.
      </AlertDescription>
    </Alert>
  )
}

export default function FinancialDataClient() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Financial Data</h1>
        <Link href="/" className="mt-2 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <div className="mb-8">
          <FinancialTicker height={60} />
        </div>
      </ErrorBoundary>

      <p className="text-muted-foreground mb-6">
        Track financial markets and get real-time market data powered by TradingView.
      </p>

      <Tabs defaultValue="chart" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Stock Chart</TabsTrigger>
          <TabsTrigger value="news">Market News</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
            <div className="mb-8">
              <TradingViewAdvancedChart height="600px" />
            </div>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="news">
          <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
            <FinancialDataWidget defaultHeight={700} />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </main>
  )
}
