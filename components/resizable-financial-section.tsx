"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ResizableFinancialSectionProps {
  children: React.ReactNode
  minHeight?: number
  maxHeight?: number
  minWidth?: number
  maxWidth?: number
  className?: string
}

export default function ResizableFinancialSection({
  children,
  minHeight = 300,
  maxHeight = 1200,
  minWidth = 400,
  maxWidth = 1600,
  className,
}: ResizableFinancialSectionProps) {
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 600,
  })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startDimensions = useRef({ width: 0, height: 0 })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault()
      setIsResizing(true)
      setResizeDirection(direction)
      startPos.current = { x: e.clientX, y: e.clientY }
      startDimensions.current = { ...dimensions }

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return

        const deltaX = e.clientX - startPos.current.x
        const deltaY = e.clientY - startPos.current.y

        let newWidth = startDimensions.current.width
        let newHeight = startDimensions.current.height

        if (direction.includes("right")) {
          newWidth = Math.max(minWidth, Math.min(maxWidth, startDimensions.current.width + deltaX))
        }
        if (direction.includes("left")) {
          newWidth = Math.max(minWidth, Math.min(maxWidth, startDimensions.current.width - deltaX))
        }
        if (direction.includes("bottom")) {
          newHeight = Math.max(minHeight, Math.min(maxHeight, startDimensions.current.height + deltaY))
        }
        if (direction.includes("top")) {
          newHeight = Math.max(minHeight, Math.min(maxHeight, startDimensions.current.height - deltaY))
        }

        setDimensions({ width: newWidth, height: newHeight })
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        setResizeDirection("")
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [dimensions, isResizing, minHeight, maxHeight, minWidth, maxWidth],
  )

  return (
    <Card
      ref={containerRef}
      className={cn("relative overflow-hidden transition-all duration-200", isResizing && "select-none", className)}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        maxWidth: "100%",
      }}
    >
      {/* Content */}
      <div className="w-full h-full overflow-auto">{children}</div>

      {/* Resize handles */}
      {/* Right edge */}
      <div
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-blue-500/20 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, "right")}
      />

      {/* Bottom edge */}
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/20 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, "bottom")}
      />

      {/* Bottom-right corner */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize bg-transparent hover:bg-blue-500/30 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400" />
      </div>

      {/* Resize indicator */}
      {isResizing && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {dimensions.width} × {dimensions.height}
        </div>
      )}
    </Card>
  )
}
