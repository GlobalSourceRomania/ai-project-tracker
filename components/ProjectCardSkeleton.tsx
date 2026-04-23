'use client';

/**
 * Skeleton loader for project cards with shimmer animation
 */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-[#111827] border border-white/[0.07] rounded-lg p-5 h-48 animate-pulse">
      {/* Title skeleton */}
      <div className="h-6 bg-white/10 rounded-md w-3/4 mb-3" />

      {/* Code skeleton */}
      <div className="h-4 bg-white/10 rounded-md w-1/3 mb-4" />

      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-white/10 rounded-md w-full" />
        <div className="h-3 bg-white/10 rounded-md w-5/6" />
      </div>

      {/* Status badge skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 bg-white/10 rounded-md w-20" />
        <div className="h-5 bg-white/10 rounded-md w-16" />
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards
 */
export function ProjectsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="p-6 min-h-screen bg-[#080D1A]">
      <div className="mb-8">
        <div className="h-8 bg-white/10 rounded-md w-1/3 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
