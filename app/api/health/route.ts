import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "unknown",
        newsApi: "unknown",
        pexelsApi: "unknown",
      },
      version: "1.0.0",
    }

    // Check database connection
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1)
      healthCheck.services.database = error ? "unhealthy" : "healthy"
    } catch (error) {
      healthCheck.services.database = "unhealthy"
    }

    // Check News API
    try {
      const newsApiKey = process.env.NEWS_API_KEY
      if (newsApiKey) {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${newsApiKey}`)
        healthCheck.services.newsApi = response.ok ? "healthy" : "unhealthy"
      } else {
        healthCheck.services.newsApi = "not_configured"
      }
    } catch (error) {
      healthCheck.services.newsApi = "unhealthy"
    }

    // Check Pexels API
    try {
      const pexelsKey = "5LTtmlORnTE2RwZp94M48mWk4uoHGdPdyMUvRHZ5KUxMQAwGCDmfvTSf"
      if (pexelsKey) {
        const response = await fetch("https://api.pexels.com/v1/search?query=test&per_page=1", {
          headers: { Authorization: pexelsKey },
        })
        healthCheck.services.pexelsApi = response.ok ? "healthy" : "unhealthy"
      } else {
        healthCheck.services.pexelsApi = "not_configured"
      }
    } catch (error) {
      healthCheck.services.pexelsApi = "unhealthy"
    }

    // Determine overall status
    const allServicesHealthy = Object.values(healthCheck.services).every(
      (status) => status === "healthy" || status === "not_configured",
    )

    if (!allServicesHealthy) {
      healthCheck.status = "degraded"
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 },
    )
  }
}
