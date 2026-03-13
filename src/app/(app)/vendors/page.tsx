import Link from "next/link"
export const dynamic = "force-dynamic"
import { createBrowserClient } from "@supabase/ssr"
import { cn } from "@/lib/utils"
import { VendorCard } from "@/components/cards/VendorCard"
import { SearchInput } from "@/components/ui/SearchInput"

export default async function VendorsPage({ searchParams }: { searchParams: { q?: string, tab?: string } }) {
  const query = searchParams?.q || ''
  const activeTab = (searchParams?.tab || 'all') as "all" | "verified"
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let dbQuery = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'vendor')

  if (query) {
    dbQuery = dbQuery.ilike('full_name', `%${query}%`)
  }

  if (activeTab === "verified") {
    dbQuery = dbQuery.neq('badge', 'none')
  }

  const { data: vendors, error } = await dbQuery

  // Sort: Gold -> Blue -> None
  const sortedVendors = (vendors || []).sort((a, b) => {
    const rank: Record<string, number> = { gold: 3, blue: 2, none: 1 }
    return (rank[b.badge || 'none'] || 1) - (rank[a.badge || 'none'] || 1)
  })

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 container mx-auto">
      
      <SearchInput placeholder="Search vendors by name..." className="mb-2" />

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href={`/vendors?tab=all${query ? `&q=${query}` : ''}`}
          className={cn(
            "rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all",
            activeTab === "all" 
              ? "bg-[#1DA1F2] text-white shadow-[0_0_15px_rgba(29,161,242,0.4)]" 
              : "bg-[#121212] border border-white/10 text-white/60 hover:text-white"
          )}
        >
          ALL SELLERS
        </Link>
        <Link
          href={`/vendors?tab=verified${query ? `&q=${query}` : ''}`}
          className={cn(
            "rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all",
            activeTab === "verified" 
              ? "bg-[#1DA1F2] text-white shadow-[0_0_15px_rgba(29,161,242,0.4)]" 
              : "bg-[#121212] border border-white/10 text-white/60 hover:text-white"
          )}
        >
          VERIFIED
        </Link>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
        {sortedVendors.length > 0 ? (
          sortedVendors.map(vendor => (
            <VendorCard 
              key={vendor.id} 
              id={vendor.id}
              name={vendor.full_name}
              role="CAMPUS MERCHANT"
              rating={Number(vendor.rating)}
              badge={vendor.badge}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-white/50">
            No vendors found matching your search.
          </div>
        )}
      </div>

    </div>
  )
}
