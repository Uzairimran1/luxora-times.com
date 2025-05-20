import { NextResponse } from "next/server"

// Oxylabs API credentials stored as environment variables
const OXYLABS_USERNAME = process.env.OXYLABS_USERNAME || ""
const OXYLABS_PASSWORD = process.env.OXYLABS_PASSWORD || ""

export async function POST(request: Request) {
  try {
    // Check if credentials are configured
    if (!OXYLABS_USERNAME || !OXYLABS_PASSWORD) {
      return NextResponse.json({ error: "Oxylabs API credentials not configured" }, { status: 500 })
    }

    // Get the payload from the request
    const payload = await request.json()

    // Forward the request to Oxylabs with authentication
    const response = await fetch("https://realtime.oxylabs.io/v1/queries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`).toString("base64")}`,
      },
      body: JSON.stringify(payload),
    })

    // Return the Oxylabs response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Oxylabs API proxy:", error)
    return NextResponse.json({ error: "Failed to fetch data from Oxylabs" }, { status: 500 })
  }
}
