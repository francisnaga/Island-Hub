import Link from "next/link"
import { Building, Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock Data
const MOCK_HOUSES = [
  {
    id: "h1",
    title: "Spacious Room in Favour Hostel",
    price: 250000,
    location: "North Gate Area",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "h2",
    title: "Self Con Near Annex",
    price: 150000,
    location: "South Gate Area",
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "h3",
    title: "1 Bedroom Flat for 2",
    price: 350000,
    location: "Campus Road Phase 2",
    image: "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=800&auto=format&fit=crop"
  }
]

export default function HousesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
            <Building className="h-7 w-7 text-blue-400" />
            Housing
          </h1>
          <p className="text-white/60 font-light text-sm sm:text-base">
            Find rooms, flats, and roommates around campus.
          </p>
        </div>
        <Link href="/houses/new">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Post
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_HOUSES.map(house => (
           <Link href={`/houses/${house.id}`} key={house.id} className="bg-[#121212] rounded-3xl border border-white/5 p-4 flex flex-col gap-3 group relative overflow-hidden h-72 justify-end transition-transform hover:-translate-y-1 hover:shadow-2xl">
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A111F] via-[#0A111F]/80 to-transparent z-10" />
              
              {/* Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-500" 
                style={{ backgroundImage: `url('${house.image}')` }}
              />
              
              {/* Content */}
              <div className="relative z-20">
                <div className="inline-flex bg-blue-500/20 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold tracking-wide mb-3 uppercase border border-blue-500/30 text-blue-300">
                  ₦{house.price.toLocaleString()} / session
                </div>
                <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                  {house.title}
                </h3>
                <p className="text-sm font-medium text-white/70 flex items-center gap-1.5 uppercase tracking-wide">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  {house.location}
                </p>
              </div>
           </Link>
        ))}
      </div>

    </div>
  )
}
