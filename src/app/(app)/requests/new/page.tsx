'use client'

import { useState } from "react"
import { MessageSquare, Calendar, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewRequestPage() {
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
      body: formData.get('body') as string,
      status: 'open',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please login first")
      setIsLoading(false)
      return
    }

    const { error } = await supabase
      .from('requests')
      .insert({
        ...data,
        user_id: user.id
      })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Request posted successfully!")
      router.push("/requests")
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-8 p-6 container mx-auto max-w-2xl pt-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-white">Post a Request</h1>
        <p className="text-white/50 font-medium">Need help with something? Ask your fellow students.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">What do you need?</label>
          <input 
            name="title"
            required
            placeholder="e.g. Need a ride to the airport"
            className="h-14 rounded-2xl bg-[#0A111F] border border-white/10 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-bold"
          />
        </div>

        <div className="flex flex-col gap-2 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Request Details</label>
          <textarea 
            name="body"
            required
            rows={6}
            placeholder="Describe your request in detail. Be clear and concise..."
            className="rounded-2xl bg-[#0A111F] border border-white/10 p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gold/5 border border-gold/10 text-gold/80 text-[10px] font-bold uppercase tracking-widest">
           <Calendar className="h-3 w-3" />
           This request will automatically expire in 7 days.
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-16 bg-white text-navy hover:bg-white/90 font-black rounded-[1.5rem] mt-4 shadow-xl active:scale-[0.98] text-lg"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Post Request
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
