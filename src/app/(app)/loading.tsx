export default function AppPageLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 py-10 space-y-6 animate-in fade-in duration-150">
      {/* Centered Jetty brand mark pulse */}
      <div className="flex flex-col items-center justify-center py-6 gap-2.5">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border shadow-xs">
          <img
            src="/jetty-mark.svg"
            alt="Loading Jetty"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg animate-pulse"
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground tracking-wide">
          Loading…
        </span>
      </div>

      {/* Minimal visual grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="aspect-square w-full bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-4/5 rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded-lg bg-muted animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
