import Link from "next/link"
import { ArrowRight, Scissors, TrendingUp, Sparkles, Building, ShoppingBag } from "lucide-react"
import { ServiceCard } from "@/components/cards/ServiceCard"
import { VendorCard } from "@/components/cards/VendorCard"

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 pb-10 pt-6">
      
      {/* Services Strip */}
      <section className="relative">
        <div className="container mx-auto px-4 mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            Featured Services
          </h2>
          <Link href="/services" className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-1">
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto pb-4 px-4 gap-4 snap-x snap-mandatory hide-scrollbar">
          <div className="snap-start shrink-0">
             <ServiceCard
              id="grooming"
              title="GROOMING"
              subtitle="SHARP FADES & STYLING"
              icon={<Scissors className="h-4 w-4" />}
              bgColor="bg-[#111111]"
            />
          </div>
          <div className="snap-start shrink-0">
             <ServiceCard
              id="food"
              title="ISLAND EATS"
              subtitle="CAMPUS FOOD DELIVERY"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 2v20"/><path d="M7 2v20"/><path d="M22 12H2"/></svg>}
              bgColor="bg-[#1A1A1A]"
              imageUrl="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop"
            />
          </div>
          <div className="snap-start shrink-0">
             <ServiceCard
              id="errands"
              title="ERRANDS"
              subtitle="FAST ISLAND LOGISTICS"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>}
              bgColor="bg-[#1A1A1A]"
              imageUrl="https://images.unsplash.com/photo-1617865261313-0941911964f4?q=80&w=600&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            Top Vendors
          </h2>
          <Link href="/vendors" className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-1">
            Browse all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VendorCard
            id="v1"
            name="Titilayo Uba"
            role="CAMPUS MERCHANT"
            rating={4.8}
            badge="blue"
          />
          <VendorCard
            id="v2"
            name="Cloudinary"
            role="OFFICIAL PARTNER"
            rating={5.0}
            badge="gold"
          />
        </div>
      </section>

      {/* Recent Houses */}
      <section className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-400" />
            Latest Housing
          </h2>
          <Link href="/houses" className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Placeholder for House Card */}
           <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 flex flex-col gap-3 group relative overflow-hidden h-64 justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A111F] to-transparent z-10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-500" />
              <div className="relative z-20">
                <div className="inline-flex bg-white/10 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide mb-2 uppercase border border-white/10 text-white">
                  ₦250k / session
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">Spacious Room in Favour Hostel</h3>
                <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                  📍 North Gate Area
                </p>
              </div>
           </div>
           
           <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 flex flex-col gap-3 group relative overflow-hidden h-64 justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A111F] to-transparent z-10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-500" />
              <div className="relative z-20">
                <div className="inline-flex bg-white/10 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide mb-2 uppercase border border-white/10 text-white">
                  ₦150k / session
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">Self Con Near Annex</h3>
                <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                  📍 South Gate Area
                </p>
              </div>
           </div>
        </div>
      </section>

      {/* Marketplace Picks */}
      <section className="container mx-auto px-4 mb-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-400" />
            Marketplace Picks
          </h2>
          <Link href="/marketplace" className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-1">
            Shop all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden group">
            <div className="h-40 bg-[url('https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="p-4">
              <h3 className="font-bold text-sm mb-1 truncate">PS5 Controller</h3>
              <p className="text-gold font-bold text-sm">₦45,000</p>
            </div>
          </div>
          
          <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden group">
            <div className="h-40 bg-[url('https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="p-4">
              <h3 className="font-bold text-sm mb-1 truncate">MTH101 Textbook</h3>
              <p className="text-gold font-bold text-sm">₦5,000</p>
            </div>
          </div>
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
