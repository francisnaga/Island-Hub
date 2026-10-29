export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A4F4F] text-white gap-4">
      <img
        src="/jetty-mark.svg"
        alt="Jetty"
        width={84}
        height={84}
        className="h-21 w-21 animate-pulse"
      />
      <span className="text-xl font-semibold tracking-[0.02em] text-white lowercase">
        jetty
      </span>
    </div>
  )
}
