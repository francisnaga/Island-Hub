import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { VerificationBadge } from "@/components/badges/VerificationBadge"
import { FollowButton } from "@/components/vendor/FollowButton"
import { ServiceCard } from "@/components/cards/ServiceCard"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Calendar, Users, Grid, MessageSquare } from "lucide-react"

export default async function VendorProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch Vendor Profile
  const { data: vendor, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !vendor) {
    notFound()
  }

  // Fetch Vendor's Services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('vendor_id', params.id)

  const mockStats = {
    joined: "Aug 2023",
    completed: 48,
    responseTime: "< 1hr"
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Cover Backdrop */}
      <div className="h-40 bg-gradient-to-b from-navy to-midnight relative">
         <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-sm" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="rounded-3xl border border-white/10 bg-[#121212]/80 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          
          {/* Avatar */}
          <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-midnight bg-midnight ring-1 ring-white/10 shadow-2xl relative">
             <div className="flex h-full w-full items-center justify-center bg-gray-800 text-4xl font-bold text-white">
                {vendor.full_name.charAt(0)}
             </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {vendor.full_name}
                {vendor.badge !== 'none' && <VerificationBadge type={vendor.badge} />}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-1 text-gold">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-bold">{vendor.rating || 0}</span>
                <span className="text-white/40 text-sm">({vendor.rating_count || 0} reviews)</span>
              </div>
            </div>

            <p className="text-white/60 font-medium">{vendor.matric_number || "Verified Campus Vendor"}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <Calendar className="h-4 w-4" />
                Joined {mockStats.joined}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <Users className="h-4 w-4" />
                {vendor.follower_count || 0} Followers
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
               <FollowButton followingId={vendor.id} followerCount={vendor.follower_count} />
               <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/5 transition-all text-white/80">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
               </Button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Response</p>
              <p className="text-white font-bold">{mockStats.responseTime}</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Orders</p>
              <p className="text-white font-bold">{mockStats.completed}+</p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-10">
           <div className="flex items-center gap-8 border-b border-white/10 pb-4 mb-6">
              <button className="text-white font-bold border-b-2 border-gold pb-4 -mb-4.5 flex items-center gap-2">
                 <Grid className="h-4 w-4" />
                 Services & Products
              </button>
              <button className="text-white/40 hover:text-white font-medium flex items-center gap-2">
                 <Star className="h-4 w-4" />
                 Reviews
              </button>
           </div>

           {/* Services Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services && services.length > 0 ? (
                services.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    id={service.id}
                    title={service.name} 
                    price={Number(service.price)} 
                    category={service.category}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-white/30 border-2 border-dashed border-white/5 rounded-3xl">
                   No active services published yet.
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
