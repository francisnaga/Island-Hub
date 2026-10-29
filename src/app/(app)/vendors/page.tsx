import Link from 'next/link'
import { Search, Store, ShieldCheck } from 'lucide-react'
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
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4 space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-900">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
              NMU & Okerenkoko Seller Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Vendor Storefronts
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Browse verified student sellers and Okerenkoko community shops. View their published inventory, check pickup or delivery options, and contact them directly on WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/vendor/apply"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-3 text-xs font-semibold text-white hover:bg-blue-900 transition-colors"
            >
              <Store className="h-4 w-4" />
              Become a Vendor
            </Link>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/vendors?tab=verified${query ? `&q=${encodeURIComponent(query)}` : ''}`}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors',
                tab === 'verified'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
              )}
            >
              Verified Vendors
            </Link>
            <Link
              href={`/vendors?tab=all${query ? `&q=${encodeURIComponent(query)}` : ''}`}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors',
                tab === 'all'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
              )}
            >
              All Storefronts
            </Link>
          </div>

          <form action="/vendors" method="GET" className="flex gap-2 w-full sm:w-80">
            <input type="hidden" name="tab" value={tab} />
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search shops or pickup area..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-blue-900 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Grid */}
        {vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center max-w-lg mx-auto my-8">
            <Store className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              No matching vendor storefronts found
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Try clearing your search query or apply to open your own storefront on IslandHub.
            </p>
            <Link
              href="/vendor/apply"
              className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-900"
            >
              Apply to Sell on IslandHub
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
