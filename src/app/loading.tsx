export default function RootLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="min-h-[65vh] w-full flex flex-col items-center justify-center bg-background text-foreground gap-3 px-4"
    >
      <img
        src="/jetty-loader.svg"
        alt="Loading"
        width={56}
        height={56}
        className="h-14 w-14 drop-shadow-2xs"
      />
      <span className="text-xs font-medium tracking-wide text-muted-foreground font-[family-name:var(--font-bricolage)]">
        Loading…
      </span>
    </div>
  )
}
