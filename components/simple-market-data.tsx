"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

const marketData = [
  { symbol: "S&P 500", price: "5,905.4", change: "+0.1%", positive: true },
  { symbol: "NASDAQ", price: "21,333.5", change: "-0.1%", positive: false },
  { symbol: "EUR/USD", price: "1.1363", change: "+0.03%", positive: true },
  { symbol: "BTC/USD", price: "106,258", change: "+1.44%", positive: true },
  { symbol: "Gold", price: "2,644.9", change: "-0.2%", positive: false },
  { symbol: "Oil (WTI)", price: "67.40", change: "+1.39%", positive: true },
]

export default function SimpleMarketData() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
        <CardDescription>Real-time market data and quotes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketData.map((item) => (
            <div key={item.symbol} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.symbol}</p>
                  <p className="text-lg font-bold">{item.price}</p>
                </div>
                <div className={`flex items-center gap-1 ${item.positive ? "text-green-500" : "text-red-500"}`}>
                  {item.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="text-sm font-medium">{item.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
