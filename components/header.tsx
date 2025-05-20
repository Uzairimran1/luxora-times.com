"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import EnhancedSearch from "./enhanced-search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const isSearchPage = pathname === "/search"

  // Determine the current page title
  let pageTitle = "Discover"
  if (pathname.startsWith("/category/")) {
    const category = pathname.split("/").pop()
    if (category) {
      pageTitle = category.charAt(0).toUpperCase() + category.slice(1)
    }
  } else if (pathname === "/latest") {
    pageTitle = "Latest"
  } else if (pathname === "/saved") {
    pageTitle = "Saved"
  } else if (pathname === "/search") {
    pageTitle = "Search"
  }

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSearchPage && <h1 className="text-2xl font-bold">{pageTitle}</h1>}
          </div>

          <div className="flex items-center gap-3">
            {isSearchPage ? (
              <EnhancedSearch expanded={true} className="w-full max-w-xl" />
            ) : (
              <Link href="/search" className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <EnhancedSearch />
                </Button>
              </Link>
            )}

            <div className="hidden md:block">
              <EnhancedSearch />
            </div>

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || "User"} />
                      <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved">Saved Articles</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild className="rounded-full">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
