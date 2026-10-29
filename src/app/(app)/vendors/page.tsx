import Link from 'next/link'
import { Search, Store, MapPin, BadgeCheck, ExternalLink, HeartHandshake } from 'lucide-react'
import { VendorCard } from '@/components/cards/VendorCard'
import { NagaLogo } from '@/components/brand/NagaLogo'
import { getPublicCategories, getPublicVendors } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Verified Campus Vendors | Jetty NMU',
  description:
    'Browse verified student and local vendors across NMU Okerenkoko and Kurutie. Direct WhatsApp storefronts for uniforms, gadgets, tools, and hostel essentials.',
}

export default async function VendorsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; campus?: string; category?: string; filter?: string }>
}) {
  const sp = await searchParams
  const query = sp.q || ''
  const campus = sp.campus || 'all'
  const category = sp.category || 'all'
  const filter = sp.filter || 'verified' // 'verified' | 'all'
  const isVerifiedOnly = filter !== 'all'

  const [vendors, categories] = await Promise.all([
    getPublicVendors({
      query,
      campus,
      category,
      verifiedOnly: isVerifiedOnly,
    }),
    getPublicCategories(),
  ])

  const campusOptions = [
    { id: 'all', label: 'All Campuses' },
    { id: 'Okerenkoko', label: 'Okerenkoko' },
    { id: 'Kurutie', label: 'Kurutie' },
  ]

  const buildUrl = (overrides: { filter?: string; campus?: string; category?: string; q?: string }) => {
    const nextFilter = overrides.filter !== undefined ? overrides.filter : filter
    const nextCampus = overrides.campus !== undefined ? overrides.campus : campus
    const nextCategory = overrides.category !== undefined ? overrides.category : category
    const nextQuery = overrides.q !== undefined ? overrides.q : query

    const params = new URLSearchParams()
    if (nextFilter && nextFilter !== 'verified') params.set('filter', nextFilter)
    if (nextCampus && nextCampus !== 'all') params.set('campus', nextCampus)
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory)
    if (nextQuery) params.set('q', nextQuery)

    const str = params.toString()
    return `/vendors${str ? `?${str}` : ''}`
  }

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-5 sm:space-y-6 min-w-0">
        {/* Header & Monochrome Pill Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {isVerifiedOnly ? 'Verified Vendors' : 'All Vendors'} ({vendors.length})
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Okerenkoko &amp; Kurutie · Direct WhatsApp storefronts
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            {/* Clean Monochrome Pill Switch */}
            <div
              role="radiogroup"
              aria-label="Filter vendors by verification status"
              className="inline-flex p-1 rounded-xl bg-muted border border-border shadow-2xs"
            >
              <Link
                href={buildUrl({ filter: 'verified' })}
                role="radio"
                aria-checked={isVerifiedOnly}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isVerifiedOnly
                    ? 'bg-foreground text-background shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                <span>Verified</span>
              </Link>
              <Link
                href={buildUrl({ filter: 'all' })}
                role="radio"
                aria-checked={!isVerifiedOnly}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  !isVerifiedOnly
                    ? 'bg-foreground text-background shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Store className="h-3.5 w-3.5" />
                <span>All Vendors</span>
              </Link>
            </div>

            <Link
              href="/vendor/apply"
              className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 sm:px-4 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Open Store</span>
            </Link>
          </div>
        </div>

        {/* Founder Spotlight Card (Matches Vendor Card Layout with Golden Badge & Monochrome Buttons) */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-foreground/30 hover:shadow-xs transition-all flex flex-col justify-between gap-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Sharp, clean high-contrast Naga mark avatar */}
              <div className="relative flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-full border border-border/80 bg-slate-900 text-white shadow-2xs">
                <NagaLogo size={26} color="#FFFFFF" />
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Naga
                  </h3>
                  {/* Golden Verified Badge for Founder */}
                  <BadgeCheck
                    className="h-4 w-4 text-[#F59E0B] shrink-0"
                    aria-label="Verified Founder"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground/90">Founder</span>
                  <span>·</span>
                  <span>Okerenkoko &amp; Kurutie</span>
                </div>
              </div>
            </div>

            {/* Naga's special action buttons (Monochrome, no AI glowing teal) */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <a
                href="https://francisnaga.site"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted hover:border-foreground/40 transition-colors"
              >
                <span>Portfolio</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>

              <a
                href="https://francisnaga.site#tip"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
              >
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>Tip Naga</span>
              </a>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Building Jetty — High-speed sovereign campus commerce and peer marketplace for Nigeria Maritime University.
          </p>
        </div>

        {/* Search & Filters Bar (Clean Monochrome Active States) */}
        <div className="rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 space-y-3 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
            {/* Campus Filter Pills (Monochrome) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Campus:
              </span>
              {campusOptions.map((c) => {
                const active = campus.toLowerCase() === c.id.toLowerCase()
                return (
                  <Link
                    key={c.id}
                    href={buildUrl({ campus: c.id })}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors',
                      active
                        ? 'bg-foreground text-background border-foreground font-bold'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
                    )}
                  >
                    {c.label}
                  </Link>
                )
              })}
            </div>

            {/* Search Input */}
            <form action="/vendors" method="GET" className="flex gap-2 w-full md:w-80 min-w-0">
              {filter !== 'verified' && <input type="hidden" name="filter" value={filter} />}
              {campus !== 'all' && <input type="hidden" name="campus" value={campus} />}
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search vendor name or landmark..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-xs text-foreground focus:border-foreground/40 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 shrink-0 cursor-pointer transition-opacity"
              >
                Search
              </button>
            </form>
          </div>

          {/* Category Filter Chips (Monochrome Active States) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-border/60">
            <Link
              href={buildUrl({ category: 'all' })}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors',
                category === 'all'
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
              )}
            >
              All Categories
            </Link>
            {categories.map((cat) => {
              const active = category === cat.slug
              return (
                <Link
                  key={cat.slug}
                  href={buildUrl({ category: cat.slug })}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors',
                    active
                      ? 'bg-foreground text-background border-foreground font-bold'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
                  )}
                >
                  {cat.short_name || cat.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* 2-Column Desktop Grid of Matching Vendor Cards */}
        {vendors.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                className="inline-flex items-center justify-center rounded-xl bg-foreground text-background px-5 py-2.5 text-xs font-bold hover:opacity-90"
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
