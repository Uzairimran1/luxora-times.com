"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bookmark, Sparkles, Lightbulb, Globe, BarChart2 } from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
}

const navigationItems: NavigationItem[] = [
  { name: "Discover", href: "/", icon: Sparkles },
  { name: "Latest Coverage", href: "/google-news", icon: Globe },
  { name: "Financial Data", href: "/financial-data", icon: BarChart2 },
  { name: "Saved", href: "/saved", icon: Bookmark },
  { name: "AI Features", href: "/ai-features", icon: Lightbulb },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border py-2 px-4 md:relative md:border-t-0 md:border-r md:h-screen md:w-16 md:py-8">
      <div className="flex justify-around md:flex-col md:space-y-8 md:items-center">
        {navigationItems.map((item) => {
          // Check if the current path matches the navigation item
          // For the home path, only consider exact matches
          // For other paths, consider if the pathname starts with the item's href
          const isActive =
            item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1 md:sr-only">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
