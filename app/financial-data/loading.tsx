import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-64 mb-6" />
      <Skeleton className="h-4 w-full max-w-2xl mb-6" />
      <Skeleton className="h-[550px] w-full rounded-lg" />
    </div>
  )
}
