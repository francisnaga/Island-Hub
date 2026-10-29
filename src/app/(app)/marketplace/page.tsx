import Link from 'next/link'
import { Suspense } from 'react'
import { Package, ChevronLeft, ChevronRight, Store } from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters'
import { getPublicCategories, getPublicProducts } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 12

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    condition?: string
    availability?: string
    sort?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined

  const [categories, { products, totalCount }] = await Promise.all([
    getPublicCategories(),
    getPublicProducts({
      q: params.q || '',
      category: params.category || 'all',
      minPrice,
      maxPrice,
      condition: params.condition || 'all',
      availability:
        params.availability === 'all' ? 'all' : 'available_only',
      sort: (params.sort as 'newest' | 'price_asc' | 'price_desc' | 'relevance') || 'newest',
      limit: ITEMS_PER_PAGE,
      page,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const activeCategoryObj = categories.find((c) => c.slug === params.category)

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
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {activeCategoryObj ? activeCategoryObj.name : 'Shop'}
            </h1>
          </div>

          <Link
            href="/vendor/apply"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <Store className="h-3.5 w-3.5 text-primary" />
            Sell on Jetty
          </Link>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-20 rounded-xl bg-muted animate-pulse" />}>
          <MarketplaceFilters categories={categories} />
        </Suspense>

        {/* Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{products.length}</strong> of{' '}
            <strong className="text-foreground">{totalCount}</strong> listing
            {totalCount === 1 ? '' : 's'}
            {params.q ? ` for "${params.q}"` : ''}
          </span>
          {params.availability === 'all' && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Including out-of-stock
            </span>
          )}
        </div>

        {/* Product Grid (2 columns on mobile) */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 sm:p-14 text-center max-w-lg mx-auto my-6">
            <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              No matching products found
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-5">
              We couldn&apos;t find any available listings matching your current filters.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors"
            >
              Reset All Filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-4">
            <Link
              href={page > 1 ? buildPageHref(page - 1) : '#'}
              aria-disabled={page <= 1}
              className={cn(
                'inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors',
                page <= 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-muted'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <Link
                key={p}
                href={buildPageHref(p)}
                className={cn(
                  'inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                  p === page
                    ? 'border-[#0F6E6E] bg-[#0F6E6E] text-white'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                )}
              >
                {p}
              </Link>
            ))}

            <Link
              href={page < totalPages ? buildPageHref(page + 1) : '#'}
              aria-disabled={page >= totalPages}
              className={cn(
                'inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors',
                page >= totalPages ? 'opacity-40 pointer-events-none' : 'hover:bg-muted'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
