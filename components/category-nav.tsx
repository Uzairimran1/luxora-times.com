"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const categories = [
  { name: "Top Stories", slug: "/" },
  { name: "Technology", slug: "/category/technology" },
  { name: "Science", slug: "/category/science" },
  { name: "Business", slug: "/category/business" },
  { name: "Health", slug: "/category/health" },
  { name: "Entertainment", slug: "/category/entertainment" },
  { name: "Sports", slug: "/category/sports" },
  { name: "Politics", slug: "/category/politics" },
]

export default function CategoryNav() {
  const pathname = usePathname()
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById("category-scroll-container")
      if (container) {
        setContainerWidth(container.offsetWidth)
        setMaxScroll(container.scrollWidth - container.offsetWidth)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("category-scroll-container")
    if (container) {
      const scrollAmount = containerWidth * 0.8
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : Math.min(maxScroll, scrollPosition + scrollAmount)

      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })

      setScrollPosition(newPosition)
    }
  }

  const isActive = (slug: string) => {
    if (slug === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(slug)
  }

  return (
    <div className="sticky top-16 z-10 bg-background border-b border-border">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center">
          <button
            onClick={() => handleScroll("left")}
            className={cn(
              "p-2 rounded-full bg-background border border-border hover:bg-muted absolute left-0 z-10",
              scrollPosition <= 0 && "opacity-0 pointer-events-none",
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            id="category-scroll-container"
            className="flex overflow-x-auto scrollbar-hide py-3 px-8"
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          >
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={category.slug}
                className={cn(
                  "whitespace-nowrap px-4 py-2 mx-1 rounded-full transition-colors",
                  isActive(category.slug) ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted",
                )}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <button
            onClick={() => handleScroll("right")}
            className={cn(
              "p-2 rounded-full bg-background border border-border hover:bg-muted absolute right-0 z-10",
              scrollPosition >= maxScroll && "opacity-0 pointer-events-none",
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
