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
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">
              NMU & Okerenkoko Catalogue
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {activeCategoryObj ? activeCategoryObj.name : 'Marketplace Listings'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {activeCategoryObj
                ? activeCategoryObj.description
                : 'Browse available products, compare prices across vendors, and order directly on WhatsApp.'}
            </p>
          </div>

          <Link
            href="/vendor/apply"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          >
            <Store className="h-4 w-4 text-blue-700" />
            Sell Your Products
          </Link>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-24 rounded-xl bg-slate-100 animate-pulse" />}>
          <MarketplaceFilters categories={categories} />
        </Suspense>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{products.length}</strong> of{' '}
            <strong className="text-slate-900">{totalCount}</strong> listing
            {totalCount === 1 ? '' : 's'}
            {params.q ? ` matching "${params.q}"` : ''}
          </span>
          {params.availability === 'all' && (
            <span className="text-amber-700 font-medium">
              Including out-of-stock products
            </span>
          )}
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center max-w-lg mx-auto my-8">
            <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-900">
              No matching products found
            </h3>
            <p className="text-sm text-slate-600 mt-1 mb-5">
              We couldn&apos;t find any available listings matching your current filters. Try clearing your search or browsing all categories.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-900 transition-colors"
            >
              Reset All Filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <Link
              href={page > 1 ? buildPageHref(page - 1) : '#'}
              aria-disabled={page <= 1}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors',
                page <= 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-slate-50'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <Link
                key={p}
                href={buildPageHref(p)}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                  p === page
                    ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                {p}
              </Link>
            ))}

            <Link
              href={page < totalPages ? buildPageHref(page + 1) : '#'}
              aria-disabled={page >= totalPages}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors',
                page >= totalPages ? 'opacity-40 pointer-events-none' : 'hover:bg-slate-50'
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
