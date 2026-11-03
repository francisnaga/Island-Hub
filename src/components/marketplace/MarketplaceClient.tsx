'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Store,
  ExternalLink,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Bed,
  Briefcase,
  X,
} from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { VendorCard } from '@/components/cards/VendorCard'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { NagaLogo } from '@/components/brand/NagaLogo'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters'
import { Category, Product, Vendor } from '@/lib/types'
import { LodgeListing } from '@/lib/lodge-data'
import { SERVICES_LIST } from '@/lib/services-data'
import { cn } from '@/lib/utils'

interface MarketplaceClientProps {
  initialTab: 'items' | 'stores'
  categories: Category[]
  products: Product[]
  totalCount: number
  vendors: Vendor[]
  matchingLodges: LodgeListing[]
  rawQuery: string
  hasItemFilters: boolean
  page: number
  totalPages: number
  initialStoreFilter: 'verified' | 'all'
  searchParamsRecord: Record<string, string | undefined>
}

export function MarketplaceClient({
  initialTab,
  categories,
  products,
  totalCount,
  vendors,
  matchingLodges,
  rawQuery,
  hasItemFilters,
  page,
  totalPages,
  initialStoreFilter,
  searchParamsRecord,
}: MarketplaceClientProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'items' | 'stores'>(initialTab)
  const [storeSearch, setStoreSearch] = useState(rawQuery)
  const [storeFilter, setStoreFilter] = useState<'verified' | 'all'>(initialStoreFilter)

  // Keep activeTab in sync if URL changes externally (e.g. clicking /vendors or back button)
  const urlTab = searchParams.get('tab') === 'stores' ? 'stores' : 'items'
  useEffect(() => {
    setActiveTab(urlTab)
  }, [urlTab])

  const handleSwitchTab = (targetTab: 'items' | 'stores') => {
    setActiveTab(targetTab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (targetTab === 'stores') {
        url.searchParams.set('tab', 'stores')
      } else {
        url.searchParams.delete('tab')
      }
      window.history.replaceState(null, '', url.pathname + url.search)
    }
  }

  // Filter & sort vendors client-side for 0ms instant search & filter switching
  const filteredVendors = vendors
    .filter((v) => {
      if (storeFilter === 'verified' && v.verification_status !== 'verified') {
        return false
      }
      if (storeSearch.trim()) {
        const tokens = storeSearch.trim().toLowerCase().split(/\s+/).filter(Boolean)
        const searchable = [
          v.shop_name || '',
          v.business_name || '',
          v.description || '',
          v.location_label || '',
          v.campus || '',
          ...(v.categories_offered || []),
        ]
          .join(' ')
          .toLowerCase()
        if (!tokens.every((t) => searchable.includes(t))) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => {
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

  // Match service categories when user searches a keyword from the Home general search bar
  const matchingServices = rawQuery
    ? SERVICES_LIST.filter((s) => {
        const text = `${s.title} ${s.slug} ${s.tagline} ${s.description}`.toLowerCase()
        return rawQuery
          .toLowerCase()
          .split(/\s+/)
          .some((tok) => tok.length >= 3 && text.includes(tok))
      })
    : []

  const buildPageHref = (targetPage: number) => {
    const sp = new URLSearchParams()
    Object.entries(searchParamsRecord).forEach(([k, v]) => {
      if (v) sp.set(k, v)
    })
    sp.set('page', String(targetPage))
    return `/marketplace?${sp.toString()}`
  }

  return (
    <div className="space-y-5 min-w-0">
      {/* Page Title & Instant 0ms Segmented Switch: [ Items | Stores ] */}
      <div className="space-y-3 border-b border-border/60 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
            Market
          </h1>
          <span className="text-xs text-muted-foreground font-medium">
            {activeTab === 'items'
              ? `${totalCount} ${totalCount === 1 ? 'listing' : 'listings'}`
              : `${filteredVendors.length} ${filteredVendors.length === 1 ? 'vendor' : 'vendors'}`}
          </span>
        </div>

        {/* Instant Client-Side Segmented Control */}
        <div
          role="tablist"
          aria-label="Market view switcher"
          className="grid grid-cols-2 w-full sm:w-[280px] p-1 rounded-xl bg-muted border border-border text-xs shadow-2xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'items'}
            onClick={() => handleSwitchTab('items')}
            className={cn(
              'flex items-center justify-center gap-1.5 min-h-[38px] px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer select-none',
              activeTab === 'items'
                ? 'bg-card text-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Items</span>
            <span className="text-[11px] opacity-70">({totalCount})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stores'}
            onClick={() => handleSwitchTab('stores')}
            className={cn(
              'flex items-center justify-center gap-1.5 min-h-[38px] px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer select-none',
              activeTab === 'stores'
                ? 'bg-card text-foreground shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Stores</span>
            <span className="text-[11px] opacity-70">({vendors.length})</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: ITEMS CATALOG ── */}
      {activeTab === 'items' && (
        <div className="space-y-5">
          <Suspense fallback={null}>
            <MarketplaceFilters categories={categories} />
          </Suspense>

          {/* Cross-Category General Search Results (Services & Rooms matching query) */}
          {rawQuery && (matchingServices.length > 0 || matchingLodges.length > 0) && (
            <div className="space-y-4 pb-2 border-b border-border/60">
              {matchingServices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Briefcase className="w-3.5 h-3.5" />
                      Matching Campus Services
                    </span>
                    <Link href="/services" className="text-xs font-semibold text-[#0F6E6E] hover:underline">
                      All services &rarr;
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchingServices.map((svc) => {
                      const Icon = svc.icon
                      return (
                        <Link
                          key={svc.id}
                          href={`/services/${svc.slug}`}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:border-foreground/30 text-xs font-semibold text-foreground shadow-2xs"
                        >
                          <Icon className="w-4 h-4 text-[#0F6E6E] dark:text-foreground stroke-[1.75]" />
                          <span>{svc.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {matchingLodges.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Bed className="w-3.5 h-3.5" />
                      Matching Student Rooms ({matchingLodges.length})
                    </span>
                    <Link
                      href={`/housing?q=${encodeURIComponent(rawQuery)}`}
                      className="text-xs font-semibold text-[#0F6E6E] hover:underline"
                    >
                      View in Lodge &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {matchingLodges.slice(0, 4).map((lodge) => (
                      <WaterlineRoomCard key={lodge.id} lodge={lodge} variant="grid" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 sm:p-12 text-center max-w-md mx-auto my-6">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3 stroke-[1.6]" />
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                {hasItemFilters ? 'No listings match your search' : 'No items listed yet'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                {hasItemFilters
                  ? 'Try adjusting your search terms, changing categories, or clearing active filters.'
                  : 'Items posted by verified campus vendors will appear here.'}
              </p>
              {hasItemFilters && (
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center mt-4 h-9 px-4 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                >
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
      {activeTab === 'stores' && (
        <div className="space-y-5">
          {/* Instant Client Search & Filter Strip */}
          <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 space-y-3 shadow-2xs">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search vendor name, landmark, or merchandise..."
                className="w-full h-10 pl-10 pr-9 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none transition-colors"
              />
              {storeSearch && (
                <button
                  type="button"
                  onClick={() => setStoreSearch('')}
                  aria-label="Clear store search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setStoreFilter('all')}
                className={cn(
                  'pill-proto text-xs font-semibold cursor-pointer',
                  storeFilter === 'all' && 'active'
                )}
              >
                All vendors
              </button>
              <button
                type="button"
                onClick={() => setStoreFilter('verified')}
                className={cn(
                  'pill-proto text-xs font-semibold cursor-pointer',
                  storeFilter === 'verified' && 'active'
                )}
              >
                Verified
              </button>
            </div>
          </div>

          {/* Stores Grid (1 col mobile, 2 cols tablet, 3 cols desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Naga's Founder Card */}
            <div className="relative rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs hover:border-foreground/30 hover:shadow-xs transition-all text-center">
              {/* Golden Verified Badge for Founder */}
              <div
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex items-center justify-center shrink-0"
                aria-label="Verified Founder"
                title="Verified Platform Founder"
              >
                <VerifiedBadge size={19} variant="gold" />
              </div>

              {/* Avatar */}
              <div className="flex justify-center">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-[#0A4F4F] border border-border/80 shadow-2xs flex items-center justify-center text-white ring-2 ring-border/70">
                  <NagaLogo size={30} color="#FFFFFF" />
                </div>
              </div>

              {/* Details */}
              <div className="mt-2.5 space-y-0.5">
                <h3 className="font-sans text-base sm:text-lg font-bold text-foreground tracking-tight inline-flex items-center justify-center gap-1.5">
                  <span>Naga</span>
                  <VerifiedBadge size={15} variant="gold" />
                </h3>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  FOUNDER
                </p>
              </div>

              <div className="my-2.5 border-t border-border/60" />

              <div className="text-center">
                <span className="text-xs font-semibold text-[#0F6E6E] dark:text-[#22D3EE]">
                  Platform Founder
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-border/50">
                <a
                  href="https://francisnaga.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-border bg-muted/30 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <span>Portfolio</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              </div>
            </div>

            {/* Vendors (Featured & Verified sorted first, followed by unverified stores) */}
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 sm:p-12 text-center max-w-md mx-auto my-6">
              <Store className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3 stroke-[1.6]" />
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                {storeSearch.trim() ? 'No stores match your search' : 'No stores registered yet'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                {storeSearch.trim()
                  ? 'Try searching by a different name or clear the search query.'
                  : 'Verified student and campus vendor stores will appear here.'}
              </p>
              {storeSearch.trim() && (
                <button
                  type="button"
                  onClick={() => setStoreSearch('')}
                  className="inline-flex items-center justify-center mt-4 h-9 px-4 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
