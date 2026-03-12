import Link from "next/link"
import { Sparkles, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/cards/ServiceCard"

// Mock Data
const MOCK_SERVICES = [
  {
    id: "grooming",
    title: "GROOMING",
    subtitle: "SHARP FADES & STYLING",
    icon: <Sparkles className="h-5 w-5" />, // Using sparkles as placeholder since we don't have scissors in this file direct import
    bgColor: "bg-[#111111]",
    category: "Beauty"
  },
  {
    id: "food",
    title: "ISLAND EATS",
    subtitle: "CAMPUS FOOD DELIVERY",
    icon: <Sparkles className="h-5 w-5" />,
    bgColor: "bg-[#1A1A1A]",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
    category: "Food"
  },
  {
    id: "errands",
    title: "ERRANDS",
    subtitle: "FAST ISLAND LOGISTICS",
    icon: <Sparkles className="h-5 w-5" />,
    bgColor: "bg-[#1A1A1A]",
    imageUrl: "https://images.unsplash.com/photo-1617865261313-0941911964f4?q=80&w=600&auto=format&fit=crop",
    category: "Logistics"
  },
  {
    id: "tech",
    title: "TECH FIX",
    subtitle: "PC & PHONE REPAIRS",
    icon: <Sparkles className="h-5 w-5" />,
    bgColor: "bg-[#111111]",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=600&auto=format&fit=crop",
    category: "IT Support"
  }
]

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-gold" />
            Services
          </h1>
          <p className="text-white/60 font-light text-sm sm:text-base">
            Discover verified student skills and services.
          </p>
        </div>
        <Link href="/services/new">
          <Button className="bg-gold hover:bg-gold/90 text-navy font-bold rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Offer Service
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center sm:justify-items-start">
        {MOCK_SERVICES.map(service => (
           <ServiceCard key={service.id} {...service} />
        ))}
      </div>

    </div>
  )
}
