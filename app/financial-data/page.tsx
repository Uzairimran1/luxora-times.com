import type { Metadata } from "next"
import FinancialDataClient from "./financial-data-client"

export const metadata: Metadata = {
  title: "Financial Data | News Aggregator",
  description: "Track financial markets and get real-time market data",
}

export default function FinancialDataPage() {
  return <FinancialDataClient />
}
