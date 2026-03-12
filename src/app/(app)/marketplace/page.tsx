import Link from "next/link"
import { ShoppingBag, Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Mock Data
const MOCK_ITEMS = [
  {
    id: "m1",
    name: "PS5 Controller",
    price: 45000,
    seller: "John Doe",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: "m2",
    name: "MTH101 Textbook",
    price: 5000,
    seller: "Sarah Smith",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: "m3",
    name: "Standing Fan (Used)",
    price: 15000,
    seller: "Titilayo Uba",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1616853501062-81734ef98059?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: "m4",
    name: "Mini Fridge",
    price: 65000,
    seller: "Alex Repairs",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=400&auto=format&fit=crop"
  }
]

export default function MarketplacePage() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-green-400" />
            Marketplace
          </h1>
          <p className="text-white/60 font-light text-sm sm:text-base">
            Buy and sell items within the campus community.
          </p>
        </div>
        <Link href="/marketplace/new">
          <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Sell Item
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {MOCK_ITEMS.map(item => (
           <Link href={`/marketplace/${item.id}`} key={item.id} className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden group hover:border-green-500/30 transition-colors">
              <div 
                className="h-48 w-full bg-cover bg-center opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" 
                style={{ backgroundImage: `url('${item.image}')` }}
              />
              <div className="p-5 bg-[#121212] relative z-10">
                <h3 className="font-bold text-lg mb-1 truncate text-white">{item.name}</h3>
                <p className="text-green-400 font-extrabold text-lg mb-3">₦{item.price.toLocaleString()}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-white/50 font-medium truncate max-w-[100px]">{item.seller}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    <span className="text-xs font-bold text-gold">{item.rating}</span>
                  </div>
                </div>
              </div>
           </Link>
        ))}
      </div>

    </div>
  )
}
