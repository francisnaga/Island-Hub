import Link from "next/link"
export const dynamic = "force-dynamic"
import { Sparkles, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { ServiceCard } from "@/components/cards/ServiceCard"
import { SearchInput } from "@/components/ui/SearchInput"

export default async function ServicesPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams?.q || ''
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let dbQuery = supabase
    .from('services')
    .select('*, profiles(full_name, badge)')
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const { data: services, error } = await dbQuery

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-gold" />
            Services
          </h1>
          <p className="text-white/60 font-light text-sm sm:text-base">
            Professional campus services by verified student vendors.
          </p>
        </div>
        <Link href="/services/new">
          <Button className="bg-gold hover:bg-gold/90 text-black font-bold rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Offer Service
          </Button>
        </Link>
      </div>

      <SearchInput placeholder="Search services..." className="mb-4" />

      {/* Grid */}
      {services && services.length > 0 ? (
        <div className="flex flex-wrap gap-6 items-center justify-center sm:justify-start">
          {services.map(service => (
            <ServiceCard 
              key={service.id}
              id={service.id}
              title={service.name}
              price={Number(service.price)}
              category={service.category}
              imageUrl={undefined} 
              bgColor="bg-midnight"
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-white/50">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No services offered yet. Start your campus business!</p>
        </div>
      )}

    </div>
  )
}
