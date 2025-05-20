"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ImageOff } from "lucide-react"

interface ResponsiveNewsImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  priority?: boolean
  fallbackText?: string
}

export default function ResponsiveNewsImage({
  src,
  alt,
  className,
  priority = false,
  fallbackText,
}: ResponsiveNewsImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [placeholderColor, setPlaceholderColor] = useState("#1e293b") // Default color
  const [placeholderTextColor, setPlaceholderTextColor] = useState("#ffffff") // Default text color

  // Generate a random color for the placeholder on mount
  useEffect(() => {
    const colors = [
      { bg: "#1e293b", text: "#ffffff" }, // Slate
      { bg: "#0f172a", text: "#ffffff" }, // Dark blue
      { bg: "#18181b", text: "#ffffff" }, // Zinc
      { bg: "#292524", text: "#ffffff" }, // Stone
      { bg: "#1c1917", text: "#ffffff" }, // Coal
      { bg: "#171717", text: "#ffffff" }, // Neutral
      { bg: "#0c0a09", text: "#ffffff" }, // Black
      { bg: "#0c4a6e", text: "#ffffff" }, // Blue
      { bg: "#064e3b", text: "#ffffff" }, // Green
      { bg: "#713f12", text: "#ffffff" }, // Amber
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setPlaceholderColor(randomColor.bg)
    setPlaceholderTextColor(randomColor.text)
  }, [])

  // Check if the source is valid
  const validSrc = src && typeof src === "string" && src.trim() !== ""

  // Create a placeholder URL if needed
  const placeholderUrl = `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(
    fallbackText?.substring(0, 20) || alt.substring(0, 20) || "News",
  )}`

  // Determine the image source to use
  const imageSrc = !validSrc || imageError ? placeholderUrl : src

  return (
    <div className={cn("relative aspect-[16/9] w-full overflow-hidden bg-muted", className)}>
      {!imageError && validSrc ? (
        <>
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              !imageLoaded && "opacity-0",
              imageLoaded && "opacity-100",
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </>
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center p-4 text-center"
          style={{ backgroundColor: placeholderColor, color: placeholderTextColor }}
        >
          <ImageOff className="mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm font-medium line-clamp-3">{fallbackText || alt}</p>
        </div>
      )}
    </div>
  )
}
