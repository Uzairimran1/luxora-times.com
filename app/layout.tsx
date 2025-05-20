import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Navigation from "@/components/navigation"
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import CategoryTabs from "@/components/category-tabs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Luxora Times - A Wikipedia-style News Aggregator",
  description: "Get the latest news in a clean, Wikipedia-like format",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground flex">
              <Navigation />
              <div className="flex-1 flex flex-col min-h-screen">
                <Header />
                <CategoryTabs />
                <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
              </div>
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
