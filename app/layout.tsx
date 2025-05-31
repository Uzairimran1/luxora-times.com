import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./clientLayout"

export const metadata: Metadata = {
  title: {
    default: "Luxora Times - A Wikipedia-style News Aggregator",
    template: "%s | Luxora Times",
  },
  description:
    "Get the latest news in a clean, Wikipedia-like format with personalized features and secure authentication",
  generator: "Next.js",
  applicationName: "Luxora Times",
  referrer: "origin-when-cross-origin",
  keywords: [
    "news",
    "aggregator",
    "wikipedia",
    "luxora",
    "times",
    "breaking news",
    "technology",
    "business",
    "financial data",
    "trading",
    "saved articles",
  ],
  authors: [{ name: "Luxora Times", url: "https://luxora-times.vercel.app" }],
  creator: "Luxora Times",
  publisher: "Luxora Times",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://luxora-times.vercel.app"),
  openGraph: {
    title: "Luxora Times - A Wikipedia-style News Aggregator",
    description: "Get the latest news in a clean, Wikipedia-like format with personalized features",
    url: "https://luxora-times.vercel.app",
    siteName: "Luxora Times",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Luxora Times - News Aggregator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxora Times - A Wikipedia-style News Aggregator",
    description: "Get the latest news in a clean, Wikipedia-like format with personalized features",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'