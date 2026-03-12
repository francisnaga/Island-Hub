import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SaveButton } from "@/components/ui/SaveButton"
import { MapPin, Info, Share2, Shield, Calendar, Bed, Bath, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function HouseDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch Listing
  const { data: house, error } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('id', params.id)
    .single()

  if (error || !house) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Image Gallery Mockup */}
      <div className="h-[40vh] sm:h-[50vh] bg-midnight relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent z-10" />
         <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" 
            alt={house.title}
            className="w-full h-full object-cover"
         />
         <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Featured</span>
               <span className="bg-white/10 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full border border-white/10">House</span>
            </div>
            <div className="flex items-center gap-2">
               <SaveButton itemId={house.id} itemType="house" />
               <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md text-white rounded-full">
                  <Share2 className="h-5 w-5" />
               </Button>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-10 relative z-30">
        <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{house.title}</h1>
            <div className="flex items-center gap-2 text-white/50">
               <MapPin className="h-4 w-4" />
               <span className="text-sm">{house.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 py-6 border-y border-white/5">
             <div className="flex flex-col justify-center">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Price</p>
                <p className="text-2xl font-black text-gold">₦{Number(house.price).toLocaleString()}<span className="text-sm font-normal text-white/40">/yr</span></p>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white">
                   <Bed className="h-4 w-4 text-white/40" />
                   <span className="font-bold">2</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                   <Bath className="h-4 w-4 text-white/40" />
                   <span className="font-bold">1</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                   <Maximize className="h-4 w-4 text-white/40" />
                   <span className="font-bold">45sqm</span>
                </div>
             </div>
             <div className="flex flex-col md:items-end justify-center">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-1.5 text-green-400 font-bold">
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                   Available
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 flex flex-col gap-8">
                <section>
                   <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                      <Info className="h-5 w-5 text-gold" />
                      Description
                   </h3>
                   <p className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap">
                      {house.description}
                   </p>
                </section>

                <section>
                   <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                      <Shield className="h-5 w-5 text-gold" />
                      Amenities
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                      {['24/7 Power', 'Running Water', 'Security Post', 'Tiled Floor', 'Wardrobe', 'Parking Space'].map(item => (
                         <div key={item} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-white/70">
                            <div className="h-1.5 w-1.5 rounded-full bg-gold/50" />
                            {item}
                         </div>
                      ))}
                   </div>
                </section>
             </div>

             <aside className="lg:col-span-1">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sticky top-24">
                   <h4 className="font-bold mb-4 text-white">Owner / Agent</h4>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="h-12 w-12 rounded-full bg-midnight border border-white/10 flex items-center justify-center text-white font-bold">
                         {house.profiles.full_name.charAt(0)}
                      </div>
                      <div>
                         <p className="font-bold text-white text-sm">{house.profiles.full_name}</p>
                         <p className="text-xs text-white/40 italic">Verified Host</p>
                      </div>
                   </div>
                   <div className="flex flex-col gap-3">
                      <Button className="bg-gold text-navy hover:bg-gold/90 font-bold rounded-xl w-full">Message Agent</Button>
                      <Button variant="outline" className="border-white/10 rounded-xl w-full text-white">Call 0812...</Button>
                   </div>
                   <div className="mt-6 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                         <Calendar className="h-3 w-3" />
                         Posted 2 days ago
                      </div>
                   </div>
                </div>
             </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
