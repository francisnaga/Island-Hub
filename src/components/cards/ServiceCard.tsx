import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"

interface ServiceCardProps {
  id: string
  title: string
  subtitle: string
  icon: ReactNode
  imageUrl?: string
  bgColor?: string
}

export function ServiceCard({
  id,
  title,
  subtitle,
  icon,
  imageUrl,
  bgColor = "bg-midnight",
}: ServiceCardProps) {
  return (
    <Link
      href={`/services/${id}`}
      className="group relative flex h-[360px] w-[260px] shrink-0 flex-col justify-end overflow-hidden rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Background layer */}
      <div className={`absolute inset-0 ${bgColor}`}>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover opacity-60 transition-opacity group-hover:opacity-80"
          />
        )}
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-5 flex flex-col gap-3">
        {/* Icon box */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm text-white border border-white/10">
          {icon}
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <h3 className="text-xl font-black italic uppercase tracking-wider text-white">
            {title}
          </h3>
          <p className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  )
}
