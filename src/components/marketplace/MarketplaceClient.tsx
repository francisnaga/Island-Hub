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
  ShoppingBag,
  Bed,
  Briefcase,
  X,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { NagaLogo } from '@/components/brand/NagaLogo'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters'
import { cleanVendorDescription, getSellerTypeLabel } from '@/components/cards/VendorCard'
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

  // Keep activeTab in sync if URL changes externally
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
      // Exclude duplicate naga if present in db vendors
      if (
        v.shop_name?.toLowerCase() === 'naga' ||
        v.slug === 'naga' ||
        v.username === 'naga'
      ) {
        return false
      }
      if (storeFilter === 'verified' && v.verification_status !== 'verified') {
        return false
      }
      if (storeSearch.trim()) {
        const tokens = storeSearch.trim().toLowerCase().split(/\s+/).filter(Boolean)
        const searchable = [
          v.shop_name || '',
          v.business_name || '',
          cleanVendorDescription(v.description) || '',
          cleanVendorDescription(v.department_or_business_info) || '',
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

  // Determine if Naga matches the store search query
  const nagaMatchesSearch = () => {
    if (!storeSearch.trim()) return true
    const q = storeSearch.trim().toLowerCase()
    return (
      'naga'.includes(q) ||
      'founder'.includes(q) ||
      'developer'.includes(q) ||
      'portfolio'.includes(q) ||
      'francis'.includes(q)
    )
  }
  const showNaga = nagaMatchesSearch()
  const totalStoreCount = filteredVendors.length + (showNaga ? 1 : 0)

  // Match service categories when user searches a keyword from the general search bar
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
      {/* ── Page Header: Market Title & Counter + Tab Switcher (Items | Stores) ── */}
      <div className="space-y-3 border-b border-border/70 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Market
          </h1>
          <span className="text-xs text-muted-foreground font-medium">
            {activeTab === 'items'
              ? `${totalCount} ${totalCount === 1 ? 'listing' : 'listings'}`
              : `${totalStoreCount} ${totalStoreCount === 1 ? 'vendor' : 'vendors'}`}
          </span>
        </div>

        {/* Tab Switcher with Teal Indicator */}
        <div
          role="tablist"
          aria-label="Market sections"
          className="flex items-center gap-6 text-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'items'}
            onClick={() => handleSwitchTab('items')}
            className={cn(
              'pb-2 font-semibold transition-all cursor-pointer select-none relative',
              activeTab === 'items'
                ? 'text-foreground font-bold border-b-2 border-[#0F6E6E] dark:border-[#22D3EE]'
                : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
            )}
          >
            <span>Items</span>
            <span className="ml-1 text-xs opacity-75 font-normal">({totalCount})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stores'}
            onClick={() => handleSwitchTab('stores')}
            className={cn(
              'pb-2 font-semibold transition-all cursor-pointer select-none relative',
              activeTab === 'stores'
                ? 'text-foreground font-bold border-b-2 border-[#0F6E6E] dark:border-[#22D3EE]'
                : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
            )}
          >
            <span>Stores</span>
            <span className="ml-1 text-xs opacity-75 font-normal">({vendors.length + 1})</span>
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
                    <Link href="/services" className="text-xs font-semibold text-[#0F6E6E] dark:text-[#22D3EE] hover:underline">
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
                          <Icon className="w-4 h-4 text-[#0F6E6E] dark:text-[#22D3EE] stroke-[1.75]" />
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
                      className="text-xs font-semibold text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
                    >
                      View in Lodge &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {matchingLodges.slice(0, 4).map((lodge) => (
                      <WaterlineRoomCard key={lodge.id} lodge={lodge} variant="grid" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Grid: 2 columns mobile, 3-5 columns responsive */}
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 sm:p-12 text-center max-w-md mx-auto my-6">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3 stroke-[1.6]" />
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                {hasItemFilters ? 'No listings match your search' : 'No items listed yet'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                {hasItemFilters
                  ? 'Try adjusting your search terms, changing categories, or clearing active filters.'
                  : 'Items posted by verified campus merchants will appear here.'}
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
        <div className="space-y-4">
          {/* Search Input for Stores */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              placeholder="Search vendors and service teams"
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-input bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0F6E6E] focus:outline-none transition-colors"
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

          {/* Filter Pills: All vendors / Verified */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStoreFilter('all')}
                className={cn(
                  'h-8 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer select-none',
                  storeFilter === 'all'
                    ? 'bg-[#0E1B1B] text-white dark:bg-[#E6F2F2] dark:text-[#0E1B1B] shadow-2xs'
                    : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                All vendors
              </button>
              <button
                type="button"
                onClick={() => setStoreFilter('verified')}
                className={cn(
                  'h-8 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer select-none',
                  storeFilter === 'verified'
                    ? 'bg-[#0E1B1B] text-white dark:bg-[#E6F2F2] dark:text-[#0E1B1B] shadow-2xs'
                    : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                Verified
              </button>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {totalStoreCount} {totalStoreCount === 1 ? 'vendor' : 'vendors'}
            </span>
          </div>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* 1. Naga (Platform Founder) pinned at the top */}
            {showNaga && (
              <div className="relative rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:border-[#E8B84A]/60 hover:shadow-sm transition-all text-center flex flex-col justify-between">
                {/* Top-Right Golden Rosette Badge */}
                <div
                  className="absolute top-3.5 right-3.5 flex items-center justify-center shrink-0"
                  title="Verified Platform Founder"
                >
                  <VerifiedBadge size={20} variant="gold" />
                </div>

                {/* Avatar */}
                <div>
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-[#0A4F4F] border-2 border-[#E8B84A]/40 shadow-xs flex items-center justify-center text-white ring-2 ring-background">
                      <NagaLogo size={32} color="#FFFFFF" />
                    </div>
                  </div>

                  {/* Name + Subtitle + Campus */}
                  <div className="mt-3 space-y-1">
                    <h3 className="font-sans text-lg font-bold text-foreground tracking-tight inline-flex items-center justify-center gap-1.5">
                      <span>Naga</span>
                      <VerifiedBadge size={16} variant="gold" />
                    </h3>
                    <p className="text-xs text-muted-foreground font-normal">
                      Platform Founder &amp; Developer
                    </p>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                      <MapPin className="h-3 w-3 shrink-0 text-[#E8B84A]" />
                      <span>Both campuses</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action: View portfolio */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <a
                    href="https://francisnaga.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-muted/60 hover:bg-muted text-xs font-semibold text-[#0F6E6E] dark:text-[#22D3EE] transition-colors group cursor-pointer"
                  >
                    <span>View portfolio</span>
                    <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                  </a>
                </div>
              </div>
            )}

            {/* 2. Registered Campus Merchants */}
            {filteredVendors.map((vendor) => {
              const isVerified = vendor.verification_status === 'verified'
              const isBanned = vendor.verification_status === 'suspended'
              const campusLabel =
                vendor.campus === 'Both' ? 'Both campuses' : vendor.campus || 'Okerenkoko'
              const count = vendor.products_count ?? 0
              const vendorHref = vendor.username
                ? `/vendors/${vendor.username}`
                : `/vendors/${vendor.slug || vendor.id}`
              const roleLabel = getSellerTypeLabel(vendor)
              const displayBio =
                cleanVendorDescription(vendor.department_or_business_info) ||
                cleanVendorDescription(vendor.description) ||
                roleLabel

              return (
                <Link
                  key={vendor.id}
                  href={vendorHref}
                  className="group relative rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:border-foreground/30 hover:shadow-xs transition-all text-center flex flex-col justify-between min-w-0"
                >
                  {/* Top-Right Blue Rosette Badge (ONLY for verified) */}
                  {isVerified && !isBanned && (
                    <div
                      className="absolute top-3.5 right-3.5 flex items-center justify-center shrink-0"
                      title="Verified Campus Merchant"
                    >
                      <VerifiedBadge size={19} variant="blue" />
                    </div>
                  )}

                  <div>
                    {/* Circular Avatar */}
                    <div className="flex justify-center">
                      <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden bg-muted ring-2 ring-background border border-border/80 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                        <UserAvatar
                          src={vendor.logo_url}
                          seed={vendor.id || vendor.slug}
                          name={vendor.shop_name}
                          size={64}
                          className="h-full w-full"
                        />
                      </div>
                    </div>

                    {/* Name, Handle, Description & Campus */}
                    <div className="mt-3 space-y-1 min-w-0 w-full overflow-hidden">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground leading-snug tracking-[-0.02em] group-hover:text-[#0F6E6E] dark:group-hover:text-[#22D3EE] transition-colors flex items-center justify-center gap-1.5 min-w-0 max-w-full font-sans">
                        <span className="truncate min-w-0 max-w-full block">
                          {vendor.shop_name}
                        </span>
                        {isVerified && !isBanned && (
                          <VerifiedBadge size={15} variant="blue" />
                        )}
                      </h3>

                      {vendor.username && (
                        <p className="text-[11px] text-muted-foreground/70 font-medium truncate max-w-full">
                          @{vendor.username}
                        </p>
                      )}

                      {displayBio ? (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-full">
                          {displayBio}
                        </p>
                      ) : null}

                      <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground pt-0.5 min-w-0">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="truncate max-w-[160px]">{campusLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action / Listings count */}
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-center gap-1 text-xs">
                      {count > 0 ? (
                        <span className="font-semibold text-[#0F6E6E] dark:text-[#22D3EE]">
                          {count} {count === 1 ? 'listing' : 'listings'} &rarr;
                        </span>
                      ) : (
                        <span className="font-medium text-muted-foreground">
                          None yet &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {totalStoreCount === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 sm:p-12 text-center max-w-md mx-auto my-6">
              <Store className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3 stroke-[1.6]" />
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                {storeSearch.trim() ? 'No stores match your search' : 'No stores registered yet'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                {storeSearch.trim()
                  ? 'Try searching by a different name or clear the search query.'
                  : 'Verified campus stores will appear here.'}
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

          {/* Bottom CTA Card: Open a free store */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs mt-8">
            <div className="space-y-1">
              <h3 className="font-bold text-base sm:text-lg text-foreground font-sans">
                Selling something on campus?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                Open a free store to list your cadet kits, electronics, hostel rooms, or student services.
              </p>
            </div>
            <Link
              href="/vendor/apply"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
            >
              <span>Open a free store &rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
