import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"
import { Zap } from "lucide-react"

interface ServiceCardProps {
  id: string
  title: string
  price?: number
  category?: string
  subtitle?: string
  icon?: ReactNode
  imageUrl?: string
  bgColor?: string
}

export function ServiceCard({
  id,
  title,
  price,
  category,
  subtitle,
  icon,
  imageUrl,
  bgColor = "bg-midnight",
}: ServiceCardProps) {
  const displaySubtitle = subtitle || category || "Premium Service"
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
          {icon || <Zap className="h-5 w-5 text-gold" />}
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <h3 className="text-xl font-black italic uppercase tracking-wider text-white">
            {title}
          </h3>
          <div className="flex items-center justify-between mt-1">
             <p className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
               {displaySubtitle}
             </p>
             {price !== undefined && (
                <p className="text-sm font-black text-gold">₦{price.toLocaleString()}</p>
             )}
          </div>
        </div>
      </div>
    </Link>
  )
}
