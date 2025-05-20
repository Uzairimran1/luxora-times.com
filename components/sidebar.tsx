import Link from "next/link"
import { cn } from "@/lib/utils"
import { BookmarkIcon, LayoutDashboard, Settings, Clock } from "lucide-react"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn("bg-card text-card-foreground p-4 rounded-md border border-border", className)}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Navigation</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground hover:text-primary hover:bg-muted px-2 py-1 rounded"
            >
              <LayoutDashboard className="h-4 w-4" />
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/latest"
              className="flex items-center gap-2 text-foreground hover:text-primary hover:bg-muted px-2 py-1 rounded"
            >
              <Clock className="h-4 w-4" />
              Latest News
            </Link>
          </li>
          <li>
            <Link
              href="/saved"
              className="flex items-center gap-2 text-foreground hover:text-primary hover:bg-muted px-2 py-1 rounded"
            >
              <BookmarkIcon className="h-4 w-4" />
              Saved Articles
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Administration</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-foreground hover:text-primary hover:bg-muted px-2 py-1 rounded"
            >
              <Settings className="h-4 w-4" />
              Admin Dashboard
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  )
}
