"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Navigation from "@/components/navigation"
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import CategoryTabs from "@/components/category-tabs"
import { ErrorBoundary } from "@/components/error-boundary"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

// Global error handler for uncaught errors
function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason)
    event.preventDefault()
  })

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    console.error("Uncaught error:", event.error)
  })
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    setupGlobalErrorHandlers()
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background text-foreground flex">
                <Navigation />
                <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
                  <Header />
                  <CategoryTabs />
                  <main className="flex-1 container mx-auto px-4 py-6">
                    <ErrorBoundary>{children}</ErrorBoundary>
                  </main>
                </div>
                <Toaster />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
