import { type NextRequest, NextResponse } from "next/server"
import { pexelsService } from "@/lib/pexels-service"
import { handleApiError, validateRequest } from "@/app/api/error-handler"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get("title")
    const category = searchParams.get("category")
    const type = searchParams.get("type") || "photo"

    validateRequest({ title, category }, ["title", "category"])

    const preferVideo = type === "video"
    const result = await pexelsService.getFallbackMedia(title!, category!, preferVideo)

    return NextResponse.json({
      ...result,
      success: true,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
