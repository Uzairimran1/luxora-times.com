"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  fallbackPath?: string
  label?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function BackButton({
  fallbackPath = "/",
  label = "Back",
  variant = "outline",
  size = "default",
  className = "",
}: BackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Determine if we should show the button
  // Don't show on main pages
  const shouldShow = !["/", "/google-news", "/financial-data", "/saved", "/ai-features"].includes(pathname)

  if (!shouldShow) return null

  const handleBack = () => {
    // Try to go back in history
    try {
      window.history.back()
    } catch (e) {
      // If that fails, navigate to fallback
      router.push(fallbackPath)
    }
  }

  return (
    <Button onClick={handleBack} variant={variant} size={size} className={`flex items-center gap-2 ${className}`}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
