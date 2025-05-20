"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Mic, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedSearchProps {
  className?: string
  placeholder?: string
  expanded?: boolean
}

export default function EnhancedSearch({
  className,
  placeholder = "Search for anything...",
  expanded = false,
}: EnhancedSearchProps) {
  const [query, setQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(expanded)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleFocus = () => {
    setIsExpanded(true)
  }

  const handleBlur = () => {
    if (!query) {
      setIsExpanded(false)
    }
  }

  const clearSearch = () => {
    setQuery("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded])

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center transition-all duration-300 ease-in-out",
        isExpanded ? "w-full" : "w-auto",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center w-full rounded-full border border-border bg-background px-4 py-2 transition-all duration-300",
          isExpanded ? "shadow-md" : "",
        )}
      >
        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />

        <input
          ref={inputRef}
          type="search"
          className={cn(
            "flex-1 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground",
            isExpanded ? "w-full" : "w-0",
          )}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button type="button" className="ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground">
          <Mic className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}
