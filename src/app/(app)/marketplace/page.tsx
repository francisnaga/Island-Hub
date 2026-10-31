import Link from 'next/link'
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { Search, ChevronLeft, ChevronRight, Store, ExternalLink } from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { VendorCard } from '@/components/cards/VendorCard'
import { NagaLogo } from '@/components/brand/NagaLogo'
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters'
import { getPublicCategories, getPublicProducts, getPublicVendors } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 12

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    q?: string
    category?: string
    campus?: string
    minPrice?: string
    maxPrice?: string
    condition?: string
    availability?: string
    sort?: string
    page?: string
    filter?: string
  }>
}) {
  const params = await searchParams
  const cookieStore = await cookies()
  const cookieCampus = cookieStore.get('jetty_campus')?.value
  const activeCampus =
    params.campus || (cookieCampus && cookieCampus !== 'all' ? cookieCampus : 'all')

  const currentTab = params.tab === 'stores' ? 'stores' : 'items'
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined

  // Parallel fetch based on active tab
  const [categories, productsData, vendorsData] = await Promise.all([
    getPublicCategories(),
    currentTab === 'items'
      ? getPublicProducts({
          q: params.q || '',
          category: params.category || 'all',
          campus: activeCampus,
          minPrice,
          maxPrice,
          condition: params.condition || 'all',
          availability: params.availability === 'all' ? 'all' : 'available_only',
          sort: (params.sort as 'newest' | 'price_asc' | 'price_desc' | 'relevance') || 'newest',
          limit: ITEMS_PER_PAGE,
          page,
        })
      : Promise.resolve({ products: [], totalCount: 0 }),
    currentTab === 'stores'
      ? getPublicVendors({
          query: params.q || '',
          verifiedOnly: params.filter !== 'all',
          campus: activeCampus,
        })
      : Promise.resolve([]),
  ])

  const { products, totalCount } = productsData
  const vendors = vendorsData
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  // Sort vendors so featured vendors and verified vendors strictly come first (monetization priority)
  const sortedVendors = [...vendors].sort((a, b) => {
    if (Boolean(a.is_featured) !== Boolean(b.is_featured)) {
      return a.is_featured ? -1 : 1
    }
    if (a.verification_status === 'verified' && b.verification_status !== 'verified') {
      return -1
    }
    if (b.verification_status === 'verified' && a.verification_status !== 'verified') {
      return 1
    }
    return a.shop_name.localeCompare(b.shop_name)
  })

  const buildTabHref = (tab: 'items' | 'stores') => {
    const sp = new URLSearchParams()
    if (tab === 'stores') sp.set('tab', 'stores')
    if (params.q) sp.set('q', params.q)
    const qStr = sp.toString()
    return `/marketplace${qStr ? `?${qStr}` : ''}`
  }

  const buildStoreFilterHref = (filterVal: 'verified' | 'all') => {
    const sp = new URLSearchParams()
    sp.set('tab', 'stores')
    if (params.q) sp.set('q', params.q)
    if (filterVal !== 'verified') sp.set('filter', filterVal)
    const qStr = sp.toString()
    return `/marketplace?${qStr}`
  }

  const buildPageHref = (targetPage: number) => {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v)
    })
    sp.set('page', String(targetPage))
    return `/marketplace?${sp.toString()}`
  }

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-5 min-w-0">
        {/* Page Title & Segmented Switch: [ Items | Stores ] */}
        <div className="space-y-3 border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
              Market
            </h1>
            <span className="text-xs text-muted-foreground font-medium">
              {currentTab === 'items'
                ? `${totalCount} listings`
                : `${vendors.length} campus stores`}
            </span>
          </div>

          {/* Prototype-Standard Segmented Control (.seg) */}
          <div className="inline-flex w-full sm:w-auto p-1 rounded-xl bg-muted border border-border text-xs shadow-2xs">
            <Link
              href={buildTabHref('items')}
              className={cn(
                'flex-1 sm:flex-initial text-center px-5 py-2 rounded-lg font-semibold transition-all',
                currentTab === 'items'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Items
            </Link>
            <Link
              href={buildTabHref('stores')}
              className={cn(
                'flex-1 sm:flex-initial text-center px-5 py-2 rounded-lg font-semibold transition-all',
                currentTab === 'stores'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Stores
            </Link>
          </div>
        </div>

        {/* ── TAB 1: ITEMS CATALOG ── */}
        {currentTab === 'items' && (
          <div className="space-y-5">
            <Suspense fallback={<div className="h-16 rounded-xl bg-muted animate-pulse" />}>
              <MarketplaceFilters categories={categories} />
            </Suspense>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 sm:p-14 text-center max-w-lg mx-auto my-6 space-y-3">
                <p className="text-base font-bold text-foreground">No listings found</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Try another keyword, or clear your price and category filters.
                </p>
                <div className="pt-2">
                  <Link
                    href="/marketplace"
                    className="inline-flex h-9 items-center px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Reset Filters
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-border/60">
                <Link
                  href={buildPageHref(page - 1)}
                  aria-disabled={page <= 1}
                  className={cn(
                    'inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors',
                    page <= 1 && 'pointer-events-none opacity-40'
                  )}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Link>
                <span className="text-xs font-medium text-muted-foreground px-2">
                  Page {page} of {totalPages}
                </span>
                <Link
                  href={buildPageHref(page + 1)}
                  aria-disabled={page >= totalPages}
                  className={cn(
                    'inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors',
                    page >= totalPages && 'pointer-events-none opacity-40'
                  )}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: STORES / VENDORS DIRECTORY ── */}
        {currentTab === 'stores' && (
          <div className="space-y-5">
            {/* Search & Verified Filter Strip */}
            <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 space-y-3 shadow-2xs">
              <form action="/marketplace" method="GET" className="relative w-full">
                <input type="hidden" name="tab" value="stores" />
                {params.filter && <input type="hidden" name="filter" value={params.filter} />}
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  name="q"
                  defaultValue={params.q || ''}
                  placeholder="Search vendor name, landmark, or merchandise..."
                  className="w-full h-10 pl-10 pr-3 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none transition-colors"
                />
              </form>

              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <Link
                  href={buildStoreFilterHref('all')}
                  className={cn(
                    'pill-proto text-xs font-semibold',
                    params.filter === 'all' && 'active'
                  )}
                >
                  All vendors
                </Link>
                <Link
                  href={buildStoreFilterHref('verified')}
                  className={cn(
                    'pill-proto text-xs font-semibold',
                    params.filter !== 'all' && 'active'
                  )}
                >
                  Verified
                </Link>
              </div>
            </div>

            {/* 2-Column Grid Matching Reference Image & Prototype */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Naga's Founder Card */}
              <div className="relative rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xs hover:border-foreground/30 hover:shadow-xs transition-all">
                {/* Golden Circular Verified Badge for Founder */}
                <div
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 w-6 h-6 rounded-full bg-[#E8B84A] text-slate-950 flex items-center justify-center shrink-0 shadow-2xs"
                  aria-label="Verified Founder"
                  title="Verified Platform Founder"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>

                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-slate-900 border border-border/80 shadow-2xs flex items-center justify-center text-white ring-2 ring-border/70">
                    <NagaLogo size={36} color="#FFFFFF" />
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3.5 text-center space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    Naga
                  </h3>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                    FOUNDER
                  </p>
                </div>

                <div className="my-5 border-t border-border/60" />

                <div className="text-center space-y-0.5">
                  <div className="text-sm font-bold text-[#E8B84A] flex items-center justify-center gap-1">
                    <span>★</span>
                    <span>5.0 Founder</span>
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                    PLATFORM FOUNDER
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50">
                  <a
                    href="https://francisnaga.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-border bg-muted/30 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <span>Portfolio</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </div>
              </div>

              {/* Verified & Featured Vendors (sorted first) */}
              {sortedVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>

            {sortedVendors.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 sm:p-14 text-center max-w-lg mx-auto my-6 space-y-3">
                <Store className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-base font-bold text-foreground">No matching vendors</p>
                <p className="text-xs text-muted-foreground">
                  Try another keyword or view all campus vendors.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
