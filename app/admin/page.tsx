import { Suspense } from "react"
import ApiStatus from "@/components/api-status"
import CacheManager from "@/components/cache-manager"

export const metadata = {
  title: "Admin - Luxora Times",
  description: "Admin dashboard for Luxora Times",
}

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <h1>Admin Dashboard</h1>

      <Suspense fallback={<div>Loading API status...</div>}>
        <ApiStatus />
      </Suspense>

      <Suspense fallback={<div>Loading cache manager...</div>}>
        <CacheManager />
      </Suspense>
    </div>
  )
}
