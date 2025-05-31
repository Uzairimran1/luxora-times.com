import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createErrorResponse, validateRequestData, AppError } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      throw new AppError(401, "User ID is required", "UNAUTHORIZED")
    }

    const { data, error } = await supabase
      .from("saved_articles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(500, error.message, "DATABASE_ERROR")
    }

    const articles = data
      .map((record) => {
        try {
          return JSON.parse(record.article_data)
        } catch (parseError) {
          console.error("Error parsing article data:", parseError)
          return null
        }
      })
      .filter(Boolean)

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch saved articles")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    validateRequestData(body, ["userId", "article"])

    const { userId, article } = body

    // Validate article structure
    if (!article.id || !article.title) {
      throw new AppError(400, "Invalid article data", "INVALID_ARTICLE")
    }

    // Check if article is already saved
    const { data: existing } = await supabase
      .from("saved_articles")
      .select("id")
      .eq("user_id", userId)
      .eq("article_id", article.id)
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Article already saved",
        timestamp: new Date().toISOString(),
      })
    }

    const { error } = await supabase.from("saved_articles").insert([
      {
        user_id: userId,
        article_id: article.id,
        article_data: JSON.stringify(article),
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      throw new AppError(500, error.message, "DATABASE_ERROR")
    }

    return NextResponse.json({
      success: true,
      message: "Article saved successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to save article")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    validateRequestData(body, ["userId", "articleId"])

    const { userId, articleId } = body

    const { error } = await supabase.from("saved_articles").delete().eq("user_id", userId).eq("article_id", articleId)

    if (error) {
      throw new AppError(500, error.message, "DATABASE_ERROR")
    }

    return NextResponse.json({
      success: true,
      message: "Article removed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to remove article")
  }
}
