import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SaveButton } from "@/components/ui/SaveButton"
import { MapPin, Info, Share2, Shield, Calendar, ExternalLink, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch Service
  const { data: service, error } = await supabase
    .from('services')
    .select('*, profiles(*)')
    .eq('id', params.id)
    .single()

  if (error || !service) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
       <div className="container mx-auto px-4 max-w-4xl pt-10">
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/6] mb-10 group">
             <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-60 z-10" />
             <img 
                src={`https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop`} 
                alt={service.name}
                className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 z-20">
                <div className="flex items-center gap-2 mb-3">
                   <div className="bg-gold text-navy text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.2em]">Service</div>
                   <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-[0.1em] border border-white/20">{service.category}</div>
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tighter mb-4">{service.name}</h1>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 flex flex-col gap-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                   <div className="flex flex-col">
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Starting Price</p>
                      <p className="text-4xl font-extrabold text-gold">₦{Number(service.price).toLocaleString()}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <SaveButton itemId={service.id} itemType="service" />
                      <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 border border-white/10 rounded-full text-white/50">
                         <Share2 className="h-5 w-5" />
                      </Button>
                   </div>
                </div>

                <section>
                   <h3 className="text-xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                      <div className="h-1.5 w-8 bg-gold rounded-full" />
                      About this Service
                   </h3>
                   <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 text-white/60 leading-relaxed space-y-4">
                      {service.description}
                   </div>
                </section>

                <section>
                   <h3 className="text-xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                      <div className="h-1.5 w-8 bg-gold rounded-full" />
                      Features
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['Same Day Delivery', 'Student Discount', 'Verified Quality', 'Campus Wide'].map(f => (
                         <div key={f} className="flex items-center gap-4 p-5 rounded-2xl bg-[#0A111F] border border-white/5 transition-all hover:border-gold/20 group">
                            <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                               <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-white/80">{f}</span>
                         </div>
                      ))}
                   </div>
                </section>
             </div>

             <aside className="lg:col-span-1">
                <div className="sticky top-24 flex flex-col gap-6">
                   <div className="p-8 rounded-[2rem] bg-gradient-to-br from-navy/50 to-midnight border border-white/10 shadow-2xl">
                      <h4 className="text-xs text-white/40 uppercase tracking-widest font-black mb-6">Provider</h4>
                      <div className="flex items-center gap-4 mb-8">
                         <div className="h-16 w-16 rounded-2xl bg-midnight border border-white/10 flex items-center justify-center text-2xl font-bold text-gold">
                            {service.profiles.full_name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-lg font-black text-white truncate">{service.profiles.full_name}</p>
                            <p className="text-xs text-gold font-bold uppercase tracking-widest">Premium Vendor</p>
                         </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                         <Button className="h-14 bg-gold text-navy hover:bg-gold/90 font-black rounded-2xl w-full shadow-lg shadow-gold/10">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Contact Vendor
                         </Button>
                         <Button variant="ghost" className="h-12 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl w-full">
                            Report Service
                         </Button>
                      </div>
                   </div>

                   <div className="p-6 rounded-2xl bg-[#0A111F] border border-white/5">
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Calendar className="h-3 w-3" />
                         Service Availability
                      </p>
                      <p className="text-sm text-white/60 font-medium">Mon - Sat: 8:00 AM - 6:00 PM</p>
                   </div>
                </div>
             </aside>
          </div>
       </div>
    </div>
  )
}
