import Link from 'next/link'
import { Search, Store } from 'lucide-react'
import { VendorCard } from '@/components/cards/VendorCard'
import { getPublicVendors } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function VendorsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>
}) {
  const sp = await searchParams
  const query = sp.q || ''
  const tab = sp.tab === 'all' ? 'all' : 'verified'

  const vendors = await getPublicVendors({
    query,
    verifiedOnly: tab === 'verified',
  })

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-5 min-w-0">
        {/* Header (No Eyebrow Pill Slop) */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Vendor Storefronts
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Browse verified student sellers and Okerenkoko &amp; Kurutie shops. View their published inventory, check pickup landmarks, and message them on WhatsApp.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/vendor/apply"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F6E6E] px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors"
            >
              <Store className="h-4 w-4" />
              Become a Vendor
            </Link>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/vendors?tab=verified${query ? `&q=${encodeURIComponent(query)}` : ''}`}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-colors',
                tab === 'verified'
                  ? 'bg-[#0F6E6E] text-white border-[#0F6E6E]'
                  : 'bg-card text-foreground border-border hover:border-[#0F6E6E]/40'
              )}
            >
              Verified Vendors
            </Link>
            <Link
              href={`/vendors?tab=all${query ? `&q=${encodeURIComponent(query)}` : ''}`}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-colors',
                tab === 'all'
                  ? 'bg-[#0F6E6E] text-white border-[#0F6E6E]'
                  : 'bg-card text-foreground border-border hover:border-[#0F6E6E]/40'
              )}
            >
              All Storefronts
            </Link>
          </div>

          <form action="/vendors" method="GET" className="flex gap-2 w-full sm:w-80 min-w-0">
            <input type="hidden" name="tab" value={tab} />
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search shops or pickup area..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-card text-xs text-foreground focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-[#0F6E6E] text-white text-xs font-semibold hover:bg-[#0A4F4F] shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Grid */}
        {vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 sm:p-14 text-center max-w-lg mx-auto my-6">
            <Store className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-base font-bold text-foreground">
              No matching vendor storefronts found
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5">
              Try clearing your search query or apply to open your own storefront on Jetty.
            </p>
            <Link
              href="/vendor/apply"
              className="inline-flex items-center justify-center rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0A4F4F]"
            >
              Apply to Sell on Jetty
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
