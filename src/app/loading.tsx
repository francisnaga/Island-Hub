export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-3">
      <img
        src="/jetty-loader.svg"
        alt="Loading"
        width={72}
        height={72}
        className="h-18 w-18 drop-shadow-xs"
      />
      <span className="text-xs font-semibold tracking-wider text-muted-foreground font-[family-name:var(--font-bricolage)]">
        loading…
      </span>
    </div>
  )
}
