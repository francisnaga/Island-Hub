import Link from "next/link"
export const dynamic = "force-dynamic"
import { Building, Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { SearchInput } from "@/components/ui/SearchInput"

export default async function HousesPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams?.q || ''
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let dbQuery = supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`)
  }

  const { data: listings, error } = await dbQuery

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
            <Building className="h-7 w-7 text-blue-400" />
            Housing
          </h1>
          <p className="text-white/60 font-light text-sm sm:text-base">
            Find rooms, flats, and roommates around campus.
          </p>
        </div>
        <Link href="/houses/new">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Post
          </Button>
        </Link>
      </div>

      <SearchInput placeholder="Search houses by name or location..." className="mb-4" />

      {/* Grid */}
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map(house => (
            <Link href={`/houses/${house.id}`} key={house.id} className="bg-[#121212] rounded-3xl border border-white/5 p-4 flex flex-col gap-3 group relative overflow-hidden h-72 justify-end transition-transform hover:-translate-y-1 hover:shadow-2xl">
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A111F] via-[#0A111F]/80 to-transparent z-10" />
                
                {/* Image */}
                {house.images && house.images[0] ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-500" 
                    style={{ backgroundImage: `url('${house.images[0]}')` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-navy/20 group-hover:scale-105 transition-transform duration-500" />
                )}
                
                {/* Content */}
                <div className="relative z-20">
                  <div className="inline-flex bg-blue-500/20 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold tracking-wide mb-3 uppercase border border-blue-500/30 text-blue-300">
                    ₦{house.price.toLocaleString()} / session
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {house.title}
                  </h3>
                  <p className="text-sm font-medium text-white/70 flex items-center gap-1.5 uppercase tracking-wide">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    {house.location}
                  </p>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-white/50">
          <Building className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No listings found. Be the first to post!</p>
        </div>
      )}

    </div>
  )
}
