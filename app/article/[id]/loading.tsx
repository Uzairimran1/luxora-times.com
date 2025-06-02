import { Skeleton } from "@/components/ui/skeleton"

export default function ArticleLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="mb-8">
        <div className="mb-2">
          <Skeleton className="h-5 w-32" />
        </div>

        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-3/4 mb-6" />

        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="relative aspect-video w-full mb-6 overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-full" />
        </div>

        <div className="mt-8 p-4 bg-muted rounded-md">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="border-t border-border pt-8 mt-8">
        <Skeleton className="h-8 w-48 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-4/5 mb-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
