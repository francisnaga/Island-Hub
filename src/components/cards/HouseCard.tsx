import Link from "next/link"
import { MapPin, Building } from "lucide-react"

interface HouseCardProps {
  id: string
  title: string
  price: number
  location: string
  image?: string
}

export function HouseCard({ id, title, price, location, image }: HouseCardProps) {
  return (
    <Link 
      href={`/houses/${id}`} 
      className="bg-[#121212] rounded-3xl border border-white/5 p-4 flex flex-col gap-3 group relative overflow-hidden h-64 justify-end transition-transform hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A111F] via-[#0A111F]/80 to-transparent z-10" />
      
      {image ? (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-500" 
          style={{ backgroundImage: `url('${image}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-navy/20 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
           <Building className="h-12 w-12 text-white/5" />
        </div>
      )}
      
      <div className="relative z-20">
        <div className="inline-flex bg-blue-500/20 backdrop-blur-md rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide mb-2 uppercase border border-blue-500/30 text-blue-300">
          ₦{price.toLocaleString()} / session
        </div>
        <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-[10px] font-medium text-white/50 flex items-center gap-1 uppercase tracking-widest leading-none">
          <MapPin className="h-3 w-3 text-blue-400" />
          {location}
        </p>
      </div>
    </Link>
  )
}
