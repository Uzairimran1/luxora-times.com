"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const categories = [
  { name: "For You", slug: "/" },
  { name: "Technology", slug: "/category/technology" },
  { name: "Science", slug: "/category/science" },
  { name: "Business", slug: "/category/business" },
  { name: "Health", slug: "/category/health" },
  { name: "Arts & Culture", slug: "/category/entertainment" },
  { name: "Sports", slug: "/category/sports" },
  { name: "Politics", slug: "/category/politics" },
]

export default function CategoryTabs() {
  const pathname = usePathname()
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
        setMaxScroll(containerRef.current.scrollWidth - containerRef.current.offsetWidth)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = containerWidth * 0.8
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : Math.min(maxScroll, scrollPosition + scrollAmount)

      containerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })

      setScrollPosition(newPosition)
    }
  }

  const handleScrollEvent = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft)
    }
  }

  const isActive = (slug: string) => {
    if (slug === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(slug)
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center">
        <button
          onClick={() => handleScroll("left")}
          className={cn(
            "p-2 rounded-full bg-background hover:bg-muted absolute left-0 z-10 transition-opacity duration-200",
            scrollPosition <= 0 && "opacity-0 pointer-events-none",
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={containerRef}
          className="flex overflow-x-auto scrollbar-hide py-4 px-8 w-full"
          onScroll={handleScrollEvent}
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.slug}
              className={cn(
                "whitespace-nowrap px-5 py-2 mx-1 rounded-full transition-colors text-sm font-medium",
                isActive(category.slug) ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground/70",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <button
          onClick={() => handleScroll("right")}
          className={cn(
            "p-2 rounded-full bg-background hover:bg-muted absolute right-0 z-10 transition-opacity duration-200",
            scrollPosition >= maxScroll && "opacity-0 pointer-events-none",
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
