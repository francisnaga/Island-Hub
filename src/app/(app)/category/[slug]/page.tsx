import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Anchor, ArrowLeft, Package, Search } from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { getPublicCategories, getPublicProducts } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string; sort?: string; condition?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams

  const categories = await getPublicCategories()
  const activeCategory = categories.find(
    (c) => c.slug === slug || c.id === slug
  )

  if (!activeCategory) {
    notFound()
  }

  const { products, totalCount } = await getPublicProducts({
    category: activeCategory.slug,
    q: sp.q || '',
    condition: sp.condition || 'all',
    sort: (sp.sort as 'newest' | 'price_asc' | 'price_desc') || 'newest',
    limit: 24,
  })

  return (
    <div className="py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-slate-900">
            Marketplace
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">{activeCategory.name}</span>
        </div>

        {/* Category Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              {activeCategory.is_priority && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-900">
                  <Anchor className="h-3 w-3 text-blue-700" />
                  Priority NMU Category
                </span>
              )}
              <span className="text-xs font-medium text-slate-500">
                {totalCount} available listing{totalCount === 1 ? '' : 's'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {activeCategory.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {activeCategory.description}
            </p>
          </div>

          {/* Search within category */}
          <form
            action={`/category/${activeCategory.slug}`}
            method="GET"
            className="w-full md:w-80 shrink-0"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={sp.q || ''}
                placeholder={`Search in ${activeCategory.short_name || activeCategory.name}...`}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 bg-slate-50/70 text-sm text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors',
                  cat.slug === activeCategory.slug
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sort:</span>
            {[
              { key: 'newest', label: 'Newest' },
              { key: 'price_asc', label: 'Price: Low–High' },
              { key: 'price_desc', label: 'Price: High–Low' },
            ].map((s) => (
              <Link
                key={s.key}
                href={`/category/${activeCategory.slug}?sort=${s.key}${
                  sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''
                }`}
                className={cn(
                  'rounded-lg px-2.5 py-1 font-medium border',
                  (sp.sort || 'newest') === s.key
                    ? 'border-blue-300 bg-blue-50 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {s.label}
              </Link>
            ))}
          </div>
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
              No listings in {activeCategory.name} yet
            </h3>
            <p className="text-sm text-slate-600 mt-1 mb-5">
              Do you sell items in this category around NMU or Okerenkoko? Apply as a vendor and list your products for students to discover.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All Listings
              </Link>
              <Link
                href="/vendor/apply"
                className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-900"
              >
                Sell in {activeCategory.short_name || activeCategory.name}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
