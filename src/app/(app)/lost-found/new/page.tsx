'use client'

import { useState } from "react"
import { Search, MapPin, Loader2, ArrowRight, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewLostFoundPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<"lost" | "found">("lost")
  
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
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      type: type,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please login first")
      setIsLoading(false)
      return
    }

    const { error } = await supabase
      .from('lost_found')
      .insert({
        ...data,
        user_id: user.id
      })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Lost & Found report posted!")
      router.push("/lost-found")
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-8 p-6 container mx-auto max-w-2xl pt-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-white">Lost & Found</h1>
        <p className="text-white/50 font-medium">Reunite students with their missing belongings.</p>
      </div>

      <div className="flex p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
         <button 
            onClick={() => setType("lost")}
            className={cn(
               "flex-1 h-12 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
               type === "lost" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-white/40 hover:text-white"
            )}
         >
            I Lost Something
         </button>
         <button 
            onClick={() => setType("found")}
            className={cn(
               "flex-1 h-12 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
               type === "found" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "text-white/40 hover:text-white"
            )}
         >
            I Found Something
         </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">What is the item?</label>
            <input 
              name="title"
              required
              placeholder="e.g. Blue Calculus Textbook"
              className="h-14 rounded-2xl bg-[#0A111F] border border-white/10 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-bold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Location</label>
            <div className="relative">
               <input 
                name="location"
                required
                placeholder="Where was it lost/found?"
                className="w-full h-14 rounded-2xl bg-[#0A111F] border border-white/10 pl-12 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-medium"
              />
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Description</label>
          <textarea 
            name="description"
            required
            rows={4}
            placeholder="Add any identifying details..."
            className="rounded-2xl bg-[#0A111F] border border-white/10 p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-white/[0.05] transition-all group">
          <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
             <Camera className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-white">Add Photo (Optional)</p>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className={cn(
             "h-16 text-navy font-black rounded-[1.5rem] mt-4 shadow-xl transition-all active:scale-[0.98] text-lg",
             type === "lost" ? "bg-red-500 hover:bg-red-600 shadow-red-500/10" : "bg-green-500 hover:bg-green-600 shadow-green-500/10"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Post {type === "lost" ? "Lost" : "Found"} Item
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
