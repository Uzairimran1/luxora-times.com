import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Home, Search } from "lucide-react"

export default function ArticleNotFound() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Article Not Found</p>
              <p className="text-sm">The article you're looking for could not be found or may have been removed.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/">
                <Button variant="default" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Articles
                </Button>
              </Link>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The article you're trying to access is not available. This could be because:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
          <li>• The article has been removed or archived</li>
          <li>• The link is incorrect or outdated</li>
          <li>• There was a temporary issue loading the content</li>
        </ul>
      </div>
    </div>
  )
}
