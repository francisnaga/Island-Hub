'use client'

import { useState } from "react"
import { Home, MapPin, Image as ImageIcon, Info, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewHousePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      price: Number(formData.get('price')),
      location: formData.get('location') as string,
      description: formData.get('description') as string,
      is_featured: false,
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please login first")
      setIsLoading(false)
      return
    }

    const { error } = await supabase
      .from('listings')
      .insert({
        ...data,
        user_id: user.id
      })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Listing created successfully!")
      router.push("/houses")
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-8 p-6 container mx-auto max-w-2xl pt-10 pb-20">
      <div className="flex flex-col gap-2 scale-in">
        <h1 className="text-4xl font-black tracking-tighter text-white">List Your Space</h1>
        <p className="text-white/50 font-medium">Share your housing or accommodation with the campus community.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic Info */}
        <div className="grid gap-6 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Listing Title</label>
            <input 
              name="title"
              required
              placeholder="e.g. Spacious Room in Favour Hostel"
              className="h-14 rounded-2xl bg-[#0A111F] border border-white/10 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Price (₦ / year)</label>
              <div className="relative">
                 <input 
                  name="price"
                  type="number"
                  required
                  placeholder="250,000"
                  className="w-full h-14 rounded-2xl bg-[#0A111F] border border-white/10 pl-12 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-bold"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gold font-bold">₦</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Location</label>
              <div className="relative">
                 <input 
                  name="location"
                  required
                  placeholder="Gate / School Area"
                  className="w-full h-14 rounded-2xl bg-[#0A111F] border border-white/10 pl-12 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                />
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Detailed Description</label>
          <textarea 
            name="description"
            required
            rows={5}
            placeholder="Tell us more about the space, amenities, and terms..."
            className="rounded-2xl bg-[#0A111F] border border-white/10 p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none text-sm leading-relaxed"
          />
        </div>

        {/* Media Upload Mock */}
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-white/[0.05] transition-all group">
          <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
             <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Upload Photos</p>
            <p className="text-xs text-white/30">Drag and drop or click to browse</p>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-16 bg-gold text-navy hover:bg-gold/90 font-black rounded-[1.5rem] mt-4 shadow-xl shadow-gold/10 transition-all active:scale-[0.98] text-lg"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Publish Listing
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
