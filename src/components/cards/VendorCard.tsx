import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { VerificationBadge } from "@/components/badges/VerificationBadge"

interface VendorCardProps {
  id: string
  name: string
  role: string
  avatarUrl?: string
  rating: number
  badge: "none" | "blue" | "gold"
}

export function VendorCard({
  id,
  name,
  role,
  avatarUrl,
  rating,
  badge,
}: VendorCardProps) {
  return (
    <Link
      href={`/vendors/${id}`}
      className="group relative flex w-full flex-col items-center rounded-2xl bg-[#121212] p-6 transition-all hover:bg-[#1a1a1a] border border-white/5"
    >
      {/* Badge position - absolute top right */}
      {badge !== "none" && (
        <div className="absolute right-4 top-4">
          <VerificationBadge type={badge} iconSize={12} />
        </div>
      )}

      {/* Avatar */}
      <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-midnight ring-2 ring-black">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-xl font-bold text-white">
            {name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name and Role */}
      <h3 className="mb-1 flex items-center gap-1 text-lg font-bold text-white tracking-tight">
        {name}
      </h3>
      <p className="mb-6 text-xs font-bold uppercase tracking-wider text-white/50">
        {role}
      </p>

      {/* Divider */}
      <div className="h-px w-full bg-white/10 mb-5" />

      {/* Rating */}
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Star className="fill-[#1DA1F2] text-[#1DA1F2]" size={16} />
          <span className="text-[15px] font-bold text-[#1DA1F2]">
            {rating.toFixed(1)} Rating
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">
          MERCHANT QUALITY
        </span>
      </div>
    </Link>
  )
}
