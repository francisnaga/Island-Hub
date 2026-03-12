'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Clock, MapPin, ChevronLeft, Loader2, User, AlertCircle, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function LostFoundDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('lost_found')
        .select('*, profiles(full_name)')
        .eq('id', params.id)
        .single()

      if (error) {
        toast.error("Item not found")
        router.push('/lost-found')
        return
      }

      setItem(data)
      setLoading(false)
    }

    fetchData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 pt-6 container mx-auto pb-20 max-w-4xl">
      
      <Link href="/lost-found" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit group">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Lost & Found
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Image / Thumbnail placeholder */}
        <div className="aspect-square rounded-3xl bg-[#121212] border border-white/5 overflow-hidden relative flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/10 uppercase font-black">
               <AlertCircle className="h-16 w-16" />
               <span>No Image Provided</span>
            </div>
          )}
          
          <div className={cn(
             "absolute top-6 left-6 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border",
             item.type === 'lost' ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"
          )}>
            {item.type}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 text-white/40 mb-4 text-xs font-bold uppercase tracking-widest">
            <Clock className="h-3.5 w-3.5" />
            Reported on {new Date(item.created_at).toLocaleDateString()}
          </div>

          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            {item.title}
          </h1>

          <div className="flex items-center gap-3 text-white/60 mb-8 font-medium">
             <MapPin className="h-4 w-4 text-yellow-500" />
             {item.location}
          </div>

          <p className="text-white/70 leading-relaxed mb-8 font-light">
            {item.description}
          </p>

          {/* Reporter Info */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8">
             <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-4">Reported By</p>
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-navy flex items-center justify-center font-bold text-white border border-white/10">
                 {item.profiles.full_name.charAt(0)}
               </div>
               <div>
                  <p className="font-bold text-white text-sm uppercase tracking-wide">{item.profiles.full_name}</p>
                  <p className="text-[10px] text-white/40 uppercase font-black">Campus Resident</p>
               </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
             <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-widest rounded-full py-6">
                <Phone className="h-4 w-4 mr-2" />
                Contact Reporter
             </Button>
             <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest rounded-full py-6">
                <MessageSquare className="h-4 w-4 mr-2 text-yellow-500" />
                Chat Now
             </Button>
          </div>
        </div>
      </div>

    </div>
  )
}
