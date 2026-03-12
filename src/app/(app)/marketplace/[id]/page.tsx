import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SaveButton } from "@/components/ui/SaveButton"
import { Star, ShoppingBag, ShieldCheck, ArrowLeft, Share2, Heart, Tag, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function MarketplaceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch Item
  const { data: item, error } = await supabase
    .from('marketplace_items')
    .select('*, profiles(*)')
    .eq('id', params.id)
    .single()

  if (error || !item) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8 pb-20 bg-[#050505] min-h-screen">
      {/* Top Header */}
      <div className="container mx-auto px-4 pt-6 flex items-center justify-between">
         <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white rounded-full">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Shop
            </Button>
         </Link>
         <div className="flex items-center gap-2">
            <SaveButton itemId={item.id} itemType="marketplace" />
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-white/50 hover:bg-white/5">
                <Share2 className="h-4 w-4" />
            </Button>
         </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Product Media */}
        <div className="flex flex-col gap-4">
           <div className="aspect-square rounded-[3rem] overflow-hidden bg-white/5 border border-white/10 group relative">
              <img 
                 src={item.images?.[0] || "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?q=80&w=2070&auto=format&fit=crop"} 
                 alt={item.name}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              {item.is_featured && (
                <div className="absolute top-6 left-6 z-20">
                   <div className="bg-gold text-navy text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">Exclusive Listing</div>
                </div>
              )}
           </div>
           
           {/* Thumbnails */}
           <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                 <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/5 overflow-hidden opacity-40 hover:opacity-100 cursor-pointer transition-opacity">
                    <img src={`https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?q=80&w=2070&auto=format&fit=crop`} className="w-full h-full object-cover" />
                 </div>
              ))}
           </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
           <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                 <Tag className="h-3 w-3 text-gold" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Marketplace Item</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight mb-4">{item.name}</h1>
              <div className="flex items-center gap-4">
                 <p className="text-3xl font-black text-gold">₦{Number(item.price).toLocaleString()}</p>
                 <div className="h-6 w-px bg-white/10" />
                 <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-bold text-green-400">Verified Seller</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-8">
              <section>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-white/40" />
                    Description
                 </h3>
                 <p className="text-white/60 leading-relaxed text-sm">
                    {item.description || "No description provided for this item. Contact seller for more details."}
                 </p>
              </section>

              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-navy/30 to-midnight/80 border border-white/5 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
                          {item.profiles.full_name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-white">{item.profiles.full_name}</p>
                          <div className="flex items-center gap-1 text-gold">
                             <Star className="h-3 w-3 fill-current" />
                             <span className="text-[10px] font-black">4.9</span>
                          </div>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full text-white/40 font-bold hover:text-white uppercase tracking-widest text-[10px]">View Store</Button>
                 </div>

                 <div className="flex flex-col gap-3">
                    <Button className="h-14 bg-white text-navy hover:bg-white/90 font-black rounded-2xl w-full text-base transition-all active:scale-[0.98]">
                       <ShoppingBag className="h-5 w-5 mr-3" />
                       Buy This Item
                    </Button>
                    <p className="text-center text-[10px] text-white/20 font-medium">Safe payment handled via IslandHub Escrow (optional)</p>
                 </div>
              </div>

              {/* Item Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Condition</p>
                    <p className="text-sm font-bold text-white">Like New</p>
                 </div>
                 <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm font-bold text-white">Near Gate</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
