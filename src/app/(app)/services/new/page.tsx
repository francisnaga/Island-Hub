'use client'

import { useState } from "react"
import { Briefcase, Zap, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewServicePage() {
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
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
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
      .from('services')
      .insert({
        ...data,
        vendor_id: user.id
      })

    if (error) {
       toast.error(error.message)
    } else {
       toast.success("Service published successfully!")
       router.push("/services")
       router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-8 p-6 container mx-auto max-w-2xl pt-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-white">Offer a Service</h1>
        <p className="text-white/50 font-medium">Register your skill or business to reach thousands of students.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Service Name</label>
            <input 
              name="name"
              required
              placeholder="e.g. Sharp Fades Barbing"
              className="h-14 rounded-2xl bg-[#0A111F] border border-white/10 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Starting Price (₦)</label>
              <div className="relative">
                 <input 
                  name="price"
                  type="number"
                  required
                  placeholder="2,000"
                  className="w-full h-14 rounded-2xl bg-[#0A111F] border border-white/10 pl-12 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-bold"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gold font-bold">₦</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Category</label>
              <select 
                name="category"
                required
                className="h-14 rounded-2xl bg-[#0A111F] border border-white/10 px-6 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all appearance-none"
              >
                <option value="Grooming">Grooming</option>
                <option value="Errands">Errands</option>
                <option value="Food Delivery">Food Delivery</option>
                <option value="Laundry">Laundry</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Academia">Academia</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Service Description</label>
          <textarea 
            name="description"
            required
            rows={5}
            placeholder="Explain what you offer, delivery times, and why students should choose you..."
            className="rounded-2xl bg-[#0A111F] border border-white/10 p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none text-sm leading-relaxed"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-16 bg-gold text-navy hover:bg-gold/90 font-black rounded-[1.5rem] mt-4 shadow-xl active:scale-[0.98] text-lg"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              Publish Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
