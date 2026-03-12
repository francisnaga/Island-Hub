import { Anchor, ArrowRight, Home, Scissors, ShoppingBag, Speaker, MapPin, HandHeart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/cards/ServiceCard"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-navy text-white selection:bg-gold selection:text-navy">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-navy/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean to-blue-900 shadow-inner border border-white/10">
              <Anchor className="text-gold h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">IslandHub</span>
          </div>
          
          <div className="flex items-center gap-3 space-x-2">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full px-6">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-navy hover:bg-white/90 rounded-full px-6 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[600px] w-[600px] rounded-full bg-ocean blur-[120px] opacity-40 mix-blend-screen" />
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-[600px] w-[600px] rounded-full bg-blue-900 blur-[120px] opacity-30 mix-blend-screen" />
          
          <div className="container relative mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium mb-8 backdrop-blur-md transition-colors hover:bg-white/10">
              <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse"></span>
              The Ultimate Campus Platform
            </div>
            
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl mb-6">
              Connect. Solve. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-gold">Thrive Together.</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-white/60 mb-10 leading-relaxed font-light">
              This is a student platform for housing, services, marketplace, and campus updates. Everything you need, one anchor away.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 rounded-full bg-gold text-navy hover:bg-gold/90 text-lg font-bold shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] hover:scale-105 active:scale-95">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Services / Quick Access Strip - As requested exactly */}
        <section className="py-16 bg-[#0B1120] relative border-y border-white/5">
          <div className="container mx-auto px-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Campus Services
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
            </h2>
          </div>
          
          {/* Horizontal scroll container */}
          <div className="flex overflow-x-auto pb-8 pt-4 px-4 gap-6 snap-x snap-mandatory container mx-auto hide-scrollbar">
            <div className="snap-start shrink-0">
               <ServiceCard
                id="grooming"
                title="GROOMING"
                subtitle="SHARP FADES & STYLING"
                icon={<Scissors className="h-5 w-5" />}
                bgColor="bg-[#111111]"
                // No image for the first one as requested
              />
            </div>
            <div className="snap-start shrink-0">
               <ServiceCard
                id="food"
                title="ISLAND EATS"
                subtitle="CAMPUS FOOD DELIVERY"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 2v20"/><path d="M7 2v20"/><path d="M22 12H2"/></svg>} // Placeholder fork/knife
                bgColor="bg-[#1A1A1A]"
                imageUrl="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop"
              />
            </div>
            <div className="snap-start shrink-0">
               <ServiceCard
                id="errands"
                title="ERRANDS"
                subtitle="FAST ISLAND LOGISTICS"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>} // Truck
                bgColor="bg-[#1A1A1A]"
                imageUrl="https://images.unsplash.com/photo-1617865261313-0941911964f4?q=80&w=600&auto=format&fit=crop" // Logistics/bike image
              />
            </div>
            
            {/* View all card */}
            <div className="snap-start shrink-0 flex items-center justify-center w-[100px] h-[360px]">
               <Link href="/services" className="flex flex-col items-center justify-center gap-2 text-white/50 hover:text-white transition-colors">
                  <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">See All</span>
               </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Home, title: "Housing", desc: "Find comfortable rooms, apartments, and roommates easily.", color: "text-blue-400" },
                { icon: ShoppingBag, title: "Marketplace", desc: "Buy and sell electronics, books, and campus essentials.", color: "text-green-400" },
                { icon: HandHeart, title: "Requests", desc: "Need something? Ask the community and get fast replies.", color: "text-pink-400" },
                { icon: MapPin, title: "Lost & Found", desc: "Report lost items or post things you've found around campus.", color: "text-yellow-400" },
                { icon: Speaker, title: "Announcements", desc: "Stay updated with official campus news and admin posts.", color: "text-purple-400" },
                { icon: Anchor, title: "Verified Vendors", desc: "Interact safely with matric-verified student vendors.", color: "text-gold" }
              ].map((feature, i) => (
                <div key={i} className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
                  <div className={`mb-6 inline-flex rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition-transform group-hover:scale-110 group-hover:bg-white/10 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold tracking-tight">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed font-light">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-midnight py-12 text-center">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
           <Anchor className="h-8 w-8 text-white/20 mb-6" />
           <p className="text-sm text-white/40 mb-2 font-medium">IslandHub Campus Platform</p>
           <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
      
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
