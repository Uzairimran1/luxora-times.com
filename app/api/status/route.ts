import { NextResponse } from "next/server"
import { getApiUsageStats } from "@/lib/api-service"

export async function GET() {
  const stats = getApiUsageStats()

  return NextResponse.json({
    status: "success",
    data: stats,
    timestamp: new Date().toISOString(),
  })
}
