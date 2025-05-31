"use client"

import { useState, useEffect } from "react"
import { Bookmark, BookmarkCheck, LogIn, Loader2 } from "lucide-react"
import type { Article } from "@/types/news"
import { useSavedArticles } from "@/lib/saved-articles"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SaveArticleButtonProps {
  article: Article
  variant?: "icon" | "button"
  className?: string
}

export default function SaveArticleButton({ article, variant = "icon", className }: SaveArticleButtonProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { saveArticle, removeSavedArticle, isArticleSaved } = useSavedArticles()
  const [saved, setSaved] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const checkIfSaved = async () => {
      try {
        setIsChecking(true)
        const isSaved = await isArticleSaved(article.id)
        if (isMounted) {
          setSaved(isSaved)
        }
      } catch (error) {
        console.error("Error checking if article is saved:", error)
        if (isMounted) {
          setSaved(false)
        }
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    checkIfSaved()

    return () => {
      isMounted = false
    }
  }, [article.id, isArticleSaved, user])

  const toggleSave = async () => {
    if (isProcessing) return

    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

    setIsProcessing(true)

    try {
      if (saved) {
        await removeSavedArticle(article.id)
        setSaved(false)
        toast({
          title: "Article removed",
          description: "The article has been removed from your saved articles.",
          duration: 3000,
        })
      } else {
        await saveArticle(article)
        setSaved(true)
        toast({
          title: "Article saved",
          description: "The article has been saved to your collection.",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error toggling save state:", error)
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRedirectToAuth = () => {
    setShowAuthDialog(false)
    router.push("/auth/signin")
  }

  if (variant === "icon") {
    return (
      <>
        <button
          onClick={toggleSave}
          disabled={isProcessing || isChecking}
          className={cn(
            "p-2 rounded-full transition-colors relative",
            (isProcessing || isChecking) && "opacity-50 cursor-not-allowed",
            saved ? "text-primary" : "text-foreground/70 hover:text-foreground",
            className,
          )}
          aria-label={saved ? "Remove from saved articles" : "Save article"}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : saved ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>

        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Authentication Required</DialogTitle>
              <DialogDescription>You need to sign in or create an account to save articles.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRedirectToAuth}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <Button
        variant={saved ? "default" : "outline"}
        size="sm"
        onClick={toggleSave}
        disabled={isProcessing || isChecking}
        className={cn("rounded-full", (isProcessing || isChecking) && "opacity-50 cursor-not-allowed", className)}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {saved ? "Removing..." : "Saving..."}
          </>
        ) : saved ? (
          <>
            <BookmarkCheck className="h-4 w-4 mr-2" />
            Saved
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4 mr-2" />
            Save Article
          </>
        )}
      </Button>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>You need to sign in or create an account to save articles.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRedirectToAuth}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
