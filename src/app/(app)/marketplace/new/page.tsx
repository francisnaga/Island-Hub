'use client'

import { useState } from "react"
import { ShoppingBag, Tag, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewMarketplaceItemPage() {
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
      .from('marketplace_items')
      .insert({
        ...data,
        seller_id: user.id
      })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Item listed successfully!")
      router.push("/marketplace")
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-8 p-6 container mx-auto max-w-2xl pt-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-white">Sell Something</h1>
        <p className="text-white/50 font-medium">Clear out your clutter or list your products for other students.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Item Name</label>
            <input 
              name="name"
              required
              placeholder="e.g. PS5 DualSense Controller"
              className="h-14 rounded-2xl bg-[#0A111F] border border-white/10 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-bold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Price (₦)</label>
            <div className="relative">
                 <input 
                  name="price"
                  type="number"
                  required
                  placeholder="25,000"
                  className="w-full h-14 rounded-2xl bg-[#0A111F] border border-white/10 pl-12 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-bold"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gold font-bold">₦</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Item Description</label>
          <textarea 
            name="description"
            required
            rows={5}
            placeholder="Condition, color, reason for selling..."
            className="rounded-2xl bg-[#0A111F] border border-white/10 p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none text-sm leading-relaxed"
          />
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
              List Item
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
