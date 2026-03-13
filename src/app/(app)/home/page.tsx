import Link from "next/link"
import { ArrowRight, Scissors, TrendingUp, Sparkles, Building, ShoppingBag, Loader2, Zap } from "lucide-react"
import { ServiceCard } from "@/components/cards/ServiceCard"
import { VendorCard } from "@/components/cards/VendorCard"
import { HouseCard } from "@/components/cards/HouseCard"
import { createBrowserClient } from "@supabase/ssr"
import { cn } from "@/lib/utils"

export default async function HomePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch data in parallel
  const [
    { data: services },
    { data: vendors },
    { data: houses },
    { data: marketplace },
    { data: lostFound }
  ] = await Promise.all([
    supabase.from('services').select('*').limit(6).order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('role', 'vendor').order('rating', { ascending: false }).limit(4),
    supabase.from('listings').select('*').limit(3).order('created_at', { ascending: false }),
    supabase.from('marketplace_items').select('*').limit(4).order('created_at', { ascending: false }),
    supabase.from('lost_found').select('*').limit(4).order('created_at', { ascending: false })
  ])

  return (
    <div className="flex flex-col gap-10 pb-10 pt-6">
      
      {/* Services Strip */}
      <section className="relative">
        <div className="container mx-auto px-4 mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            Featured Services
          </h2>
          <Link href="/services" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white flex items-center gap-1 transition-colors">
            Explore All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto pb-4 px-4 gap-6 snap-x snap-mandatory scroll-smooth hide-scrollbar">
          {services && services.length > 0 ? services.map(service => (
            <div key={service.id} className="snap-start shrink-0">
               <ServiceCard
                  id={service.id}
                  title={service.name}
                  price={Number(service.price)}
                  category={service.category}
                  bgColor="bg-[#111111]"
               />
            </div>
          )) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-white/10 uppercase font-black text-xs">
               <Zap className="h-8 w-8 mb-2" />
               No services live
            </div>
          )}
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            Top Vendors
          </h2>
          <Link href="/vendors" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white flex items-center gap-1 transition-colors">
            Browse Directory <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendors && vendors.length > 0 ? vendors.map(vendor => (
            <VendorCard
              key={vendor.id}
              id={vendor.id}
              name={vendor.full_name}
              role="CAMPUS MERCHANT"
              rating={Number(vendor.rating)}
              badge={vendor.badge}
            />
          )) : (
            <div className="col-span-full py-8 text-center text-white/20 uppercase font-black text-xs tracking-widest border border-dashed border-white/5 rounded-2xl">
              Waiting for verified vendors...
            </div>
          )}
        </div>
      </section>

      {/* Recent Houses */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-400" />
            Latest Housing
          </h2>
          <Link href="/houses" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white flex items-center gap-1 transition-colors">
            View All Rooms <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {houses && houses.length > 0 ? houses.map(house => (
              <HouseCard 
                key={house.id}
                id={house.id}
                title={house.title}
                price={Number(house.price)}
                location={house.location}
                image={house.images?.[0]}
              />
           )) : (
             <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl">
                <Building className="h-10 w-10 mx-auto mb-4 opacity-10" />
                <p className="text-white/20 uppercase font-black text-xs tracking-[0.3em]">Fresh listings coming soon</p>
             </div>
           )}
        </div>
      </section>

      {/* Lost & Found */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Lost & Found
          </h2>
          <Link href="/lost-found" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white flex items-center gap-1 transition-colors">
            View All Reports <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
          {lostFound && lostFound.length > 0 ? lostFound.map(item => (
            <Link 
              key={item.id} 
              href={`/lost-found/${item.id}`} 
              className="snap-start shrink-0 w-64 bg-white/5 border border-white/5 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all"
            >
              <div 
                className="h-32 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                style={{ backgroundImage: `url('${item.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop'}')` }}
              />
              <div className="p-4">
                <div className={cn(
                  "inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mb-2",
                  item.type === 'lost' ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                )}>
                  {item.type}
                </div>
                <h3 className="font-bold text-sm truncate text-white">{item.title}</h3>
                <p className="text-white/40 text-xs truncate">{item.location}</p>
              </div>
            </Link>
          )) : (
            <div className="w-full py-8 text-center text-white/10 uppercase font-black text-xs border border-dashed border-white/10 rounded-2xl">
              No recent reports
            </div>
          )}
        </div>
      </section>

      {/* Marketplace Picks */}
      <section className="container mx-auto px-4 mb-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-400" />
            Marketplace Picks
          </h2>
          <Link href="/marketplace" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white flex items-center gap-1 transition-colors">
            Go Shopping <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {marketplace && marketplace.length > 0 ? marketplace.map(item => (
            <Link key={item.id} href={`/marketplace/${item.id}`} className="bg-[#121212] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-green-500/30 transition-all active:scale-[0.98]">
              <div 
                className="h-44 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                style={{ backgroundImage: `url('${item.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop'}')` }}
              />
              <div className="p-5">
                <h3 className="font-bold text-sm mb-1 truncate text-white">{item.name}</h3>
                <p className="text-green-400 font-black text-base">₦{Number(item.price).toLocaleString()}</p>
              </div>
            </Link>
          )) : (
            <div className="col-span-full py-12 text-center text-white/10 uppercase font-black text-[10px] tracking-widest">
              Marketplace is restocking...
            </div>
          )}
        </div>
      </section>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}
