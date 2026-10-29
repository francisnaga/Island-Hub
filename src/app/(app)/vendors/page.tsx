import Link from 'next/link'
import { Search, Store, MapPin } from 'lucide-react'
import { VendorCard } from '@/components/cards/VendorCard'
import { getPublicCategories, getPublicVendors } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function VendorsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; campus?: string; category?: string }>
}) {
  const sp = await searchParams
  const query = sp.q || ''
  const campus = sp.campus || 'all'
  const category = sp.category || 'all'

  const [vendors, categories] = await Promise.all([
    getPublicVendors({
      query,
      campus,
      category,
    }),
    getPublicCategories(),
  ])

  const campusOptions = [
    { id: 'all', label: 'All Campuses' },
    { id: 'Okerenkoko', label: 'Okerenkoko' },
    { id: 'Kurutie', label: 'Kurutie' },
  ]

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-5 min-w-0">
        {/* Header */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Vendor Storefronts
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Browse verified student sellers, independent food &amp; service providers, and local shops across Okerenkoko and Kurutie. Compare storefronts, check pickup landmarks, and contact sellers on WhatsApp.
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

        {/* Search & Filters Bar */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 space-y-3 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
            {/* Campus Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
                <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                Campus:
              </span>
              {campusOptions.map((c) => {
                const active = campus.toLowerCase() === c.id.toLowerCase()
                return (
                  <Link
                    key={c.id}
                    href={`/vendors?campus=${c.id}${category !== 'all' ? `&category=${category}` : ''}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors',
                      active
                        ? 'bg-[#0F6E6E] text-white border-[#0F6E6E]'
                        : 'bg-background text-foreground border-border hover:border-[#0F6E6E]/40'
                    )}
                  >
                    {c.label}
                  </Link>
                )
              })}
            </div>

            {/* Search Input */}
            <form action="/vendors" method="GET" className="flex gap-2 w-full md:w-80 min-w-0">
              {campus !== 'all' && <input type="hidden" name="campus" value={campus} />}
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search vendor name or landmark..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-xs text-foreground focus:border-[#0F6E6E] focus:outline-none"
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

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-border/60">
            <Link
              href={`/vendors?campus=${campus}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold border transition-colors',
                category === 'all'
                  ? 'border-[#0F6E6E] bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              All Categories
            </Link>
            {categories.map((cat) => {
              const active = category === cat.slug
              return (
                <Link
                  key={cat.slug}
                  href={`/vendors?campus=${campus}&category=${cat.slug}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold border transition-colors',
                    active
                      ? 'border-[#0F6E6E] bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>
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
              Try clearing your filters or apply to open your own storefront on Jetty.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/vendors"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Reset Filters
              </Link>
              <Link
                href="/vendor/apply"
                className="inline-flex items-center justify-center rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0A4F4F]"
              >
                Apply to Sell on Jetty
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
