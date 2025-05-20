import type { Metadata } from "next"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Bell } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "AI Features - Coming Soon | Luxora Times",
  description: "Advanced AI features for Luxora Times are currently under development",
}

export default function AIFeaturesPage() {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">AI Features Coming Soon</h1>
        <p className="text-xl text-muted-foreground">
          We're working on exciting new AI-powered features to enhance your news experience.
        </p>
      </div>

      <Card className="mb-12 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Luxora AI Assistant</CardTitle>
          <CardDescription>
            Our advanced AI assistant will help you discover, summarize, and interact with news content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-6">
            <Image
              src="/placeholder.svg?height=400&width=800&text=Luxora+AI+Assistant"
              alt="Luxora AI Assistant Preview"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <h3 className="font-medium mb-2">Upcoming Features</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Personalized news recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Article summaries and insights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Interactive news exploration</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Topic-based research assistance</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Benefits</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Save time with AI-generated summaries</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Discover relevant content you might miss</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Get context and background on complex topics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Stay informed with less effort</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" asChild>
            <Link href="/newsletter">
              <Bell className="mr-2 h-4 w-4" />
              Get Notified When It's Ready
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            We're working hard to bring these features to you soon. Sign up to be the first to know when they're
            available.
          </p>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">In the meantime...</h2>
        <p className="text-muted-foreground">
          Explore our extensive collection of news articles from various categories and sources.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href="/">Browse Top Stories</Link>
          </Button>
          <Button asChild>
            <Link href="/latest">Latest News</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
