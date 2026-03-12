import Link from "next/link"
import { ShoppingBag, Plus, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"

export default async function MarketplacePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: items, error } = await supabase
    .from('marketplace_items')
    .select('*, profiles(full_name, rating)')
    .order('created_at', { ascending: false })

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
      {items && items.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map(item => (
            <Link href={`/marketplace/${item.id}`} key={item.id} className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden group hover:border-green-500/30 transition-colors">
                <div 
                  className="h-48 w-full bg-cover bg-center opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" 
                  style={{ backgroundImage: `url('${item.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop'}')` }}
                />
                <div className="p-5 bg-[#121212] relative z-10">
                  <h3 className="font-bold text-lg mb-1 truncate text-white">{item.name}</h3>
                  <p className="text-green-400 font-extrabold text-lg mb-3">₦{item.price.toLocaleString()}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-white/50 font-medium truncate max-w-[100px]">
                      {(item.profiles as any)?.full_name || 'Anonymous'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      <span className="text-xs font-bold text-gold">{(item.profiles as any)?.rating || '0.0'}</span>
                    </div>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-white/50">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Marketplace is empty. Be the first to sell!</p>
        </div>
      )}

    </div>
  )
}
