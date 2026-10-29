import Image from 'next/image'

export default function AppPageLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="container mx-auto max-w-7xl px-4 py-12 space-y-8 animate-in fade-in duration-200"
    >
      {/* Centered flowing water Jetty loader */}
      <div className="flex flex-col items-center justify-center py-6 gap-3">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <Image
            src="/jetty-loader.svg"
            alt="Loading"
            width={80}
            height={80}
            priority
            className="w-20 h-20 drop-shadow-xs"
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground tracking-wide font-[family-name:var(--font-bricolage)]">
          Loading…
        </span>
      </div>

      {/* Geometric Card Skeletons with Waterline Flow */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2.5">
            <div className="aspect-square w-full rounded-[12px] skeleton-flow" />
            <div className="h-4 w-2/5 rounded-[6px] skeleton-flow" />
            <div className="h-3.5 w-4/5 rounded-[6px] skeleton-flow" />
            <div className="h-3 w-1/2 rounded-[6px] skeleton-flow" />
          </div>
        ))}
      </div>
    </div>
  )
}
