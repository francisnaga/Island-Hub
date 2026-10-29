import Link from 'next/link'
import { Search, Store, MapPin, BadgeCheck, ExternalLink, HeartHandshake } from 'lucide-react'
import { VendorCard } from '@/components/cards/VendorCard'
import { NagaLogo } from '@/components/brand/NagaLogo'
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
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Verified Vendors ({vendors.length})
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Okerenkoko &amp; Kurutie · Direct WhatsApp storefronts
            </p>
          </div>

          <Link
            href="/vendor/apply"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-foreground text-background px-4 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            <Store className="h-3.5 w-3.5" />
            <span>Open Store</span>
          </Link>
        </div>

        {/* Founder Account Spotlight Card */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 text-primary shadow-xs">
                <NagaLogo size={24} className="text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                  <BadgeCheck className="h-3 w-3" />
                </span>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Francis Naga
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <BadgeCheck className="h-2.5 w-2.5" />
                    Founder &amp; Architect
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-1">
                  Building Jetty — High-speed sovereign campus commerce for NMU
                </p>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">Okerenkoko &amp; Kurutie</span>
                  <span>·</span>
                  <span>Platform Lead</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 sm:self-center">
              <a
                href="https://francisnaga.site"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-colors"
              >
                <span>Portfolio</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>

              <a
                href="https://francisnaga.site#tip"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3.5 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
              >
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>Tip Francis</span>
              </a>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 space-y-3 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
            {/* Campus Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
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
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary/40'
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
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-xs text-foreground focus:border-primary focus:outline-none"
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

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-border/60">
            <Link
              href={`/vendors?campus=${campus}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold border transition-colors',
                category === 'all'
                  ? 'border-primary bg-accent text-accent-foreground font-bold'
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
                      ? 'border-primary bg-accent text-accent-foreground font-bold'
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
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90"
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
