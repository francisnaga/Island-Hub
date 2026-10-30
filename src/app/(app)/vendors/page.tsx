import Link from 'next/link'
import { Search, Store, BadgeCheck, ExternalLink, ArrowRight } from 'lucide-react'
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
  searchParams: Promise<{ q?: string; category?: string; filter?: string }>
}) {
  const sp = await searchParams
  const query = sp.q || ''
  const category = sp.category || 'all'
  const filter = sp.filter || 'verified' // 'verified' | 'all'
  const isVerifiedOnly = filter !== 'all'

  const [vendors, allCategories] = await Promise.all([
    getPublicVendors({
      query,
      category,
      verifiedOnly: isVerifiedOnly,
    }),
    getPublicCategories(),
  ])

  // Exclude services from physical merchandise vendor categories
  const categories = allCategories.filter((c) => c.slug !== 'campus-services')

  const buildUrl = (overrides: { filter?: string; category?: string; q?: string }) => {
    const nextFilter = overrides.filter !== undefined ? overrides.filter : filter
    const nextCategory = overrides.category !== undefined ? overrides.category : category
    const nextQuery = overrides.q !== undefined ? overrides.q : query

    const params = new URLSearchParams()
    if (nextFilter && nextFilter !== 'verified') params.set('filter', nextFilter)
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory)
    if (nextQuery) params.set('q', nextQuery)

    const str = params.toString()
    return `/vendors${str ? `?${str}` : ''}`
  }

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-5 sm:space-y-6 min-w-0">
        {/* Tier-One Header (Clean, minimal, no competing open store button) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
              {isVerifiedOnly ? 'Verified Campus Vendors' : 'All Campus Vendors'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Direct WhatsApp storefronts across NMU Okerenkoko &amp; Kurutie campuses.
            </p>
          </div>

          {/* Clean Segmented Filter (Just Verified & All Vendors) */}
          <div
            role="radiogroup"
            aria-label="Filter vendors by verification status"
            className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <Link
              href={buildUrl({ filter: 'verified' })}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
                isVerifiedOnly
                  ? 'bg-card text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BadgeCheck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
              <span>Verified ({vendors.filter((v) => v.verification_status === 'verified').length})</span>
            </Link>
            <Link
              href={buildUrl({ filter: 'all' })}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
                !isVerifiedOnly
                  ? 'bg-card text-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Store className="h-3.5 w-3.5 text-muted-foreground" />
              <span>All Vendors</span>
            </Link>
          </div>
        </div>

        {/* Clean Integrated Search & Category Control Strip */}
        <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 space-y-3 shadow-2xs">
          {/* Instant Search Bar */}
          <form action="/vendors" method="GET" className="relative w-full">
            {filter !== 'verified' && <input type="hidden" name="filter" value={filter} />}
            {category !== 'all' && <input type="hidden" name="category" value={category} />}
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search vendor name, landmark, or merchandise..."
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0F6E6E] dark:focus:border-[#E8B84A] focus:outline-none transition-colors"
            />
          </form>

          {/* Category Pills (Physical Goods Only, No Campus Services) */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
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

            {/* Quiet Link to Campus Services Directory */}
            <Link
              href="/services"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-[#0F6E6E] dark:text-[#E8B84A] hover:underline shrink-0"
            >
              <span>Campus Services Directory</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 2-Column Desktop Grid with Naga's Founder Card + Merchant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Naga's Founder Card (Portfolio link retained, Tip button removed as requested) */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-foreground/30 hover:shadow-xs transition-all flex flex-col justify-between gap-3 min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex items-start sm:items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Clean Naga mark avatar */}
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
                        className="h-4 w-4 text-[#E8B84A] shrink-0"
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

                {/* Desktop Action: Portfolio Only (Tip Naga removed) */}
                <div className="hidden sm:flex items-center shrink-0">
                  <a
                    href="https://francisnaga.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted hover:border-foreground/40 transition-colors"
                  >
                    <span>Portfolio</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                Building Jetty — Sovereign campus marketplace and peer commerce for Nigeria Maritime University.
              </p>
            </div>

            {/* Mobile Action: Portfolio Only */}
            <div className="sm:hidden pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Architect</span>
              <a
                href="https://francisnaga.site"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline flex items-center gap-1"
              >
                <span>Portfolio</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Verified / Public Merchant Cards */}
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>

        {vendors.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 sm:p-14 text-center max-w-lg mx-auto my-6">
            <Store className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-base font-bold text-foreground">
              No matching vendor storefronts found
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5">
              Try resetting your search query or view all campus vendors.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/vendors"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Reset Filters
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
