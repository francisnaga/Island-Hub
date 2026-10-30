import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Package, Search } from 'lucide-react'
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
  if (slug === 'campus-services') {
    redirect('/services')
  }
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
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-5 min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <Link href="/" className="hover:text-foreground shrink-0">
            Home
          </Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-foreground shrink-0">
            Marketplace
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground truncate">{activeCategory.name}</span>
        </div>

        {/* Category Header Banner (No Eyebrow Pill Slop) */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {activeCategory.name}
              </h1>
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                ({totalCount})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {activeCategory.description}
            </p>
          </div>

          {/* Search within category */}
          <form
            action={`/category/${activeCategory.slug}`}
            method="GET"
            className="w-full md:w-76 shrink-0"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={sp.q || ''}
                placeholder={`Search in ${activeCategory.short_name || activeCategory.name}...`}
                className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm text-foreground focus:bg-card focus:border-[#0F6E6E] focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Category Switcher Tabs & Sort (Contained Horizontal Scroll) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="w-full sm:flex-1 min-w-0 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-1.5 w-max">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors',
                    cat.slug === activeCategory.slug
                      ? 'bg-[#0F6E6E] text-white border-[#0F6E6E]'
                      : 'bg-card text-foreground border-border hover:border-[#0F6E6E]/40'
                  )}
                >
                  {cat.short_name || cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs shrink-0 overflow-x-auto no-scrollbar">
            <span className="text-muted-foreground font-medium shrink-0">Sort:</span>
            {[
              { key: 'newest', label: 'Newest' },
              { key: 'price_asc', label: 'Low–High' },
              { key: 'price_desc', label: 'High–Low' },
            ].map((s) => (
              <Link
                key={s.key}
                href={`/category/${activeCategory.slug}?sort=${s.key}${
                  sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''
                }`}
                className={cn(
                  'shrink-0 rounded-lg px-2.5 py-1 font-medium border',
                  (sp.sort || 'newest') === s.key
                    ? 'border-[#0F6E6E]/40 bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white font-semibold'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                )}
              >
                {s.label}
              </Link>
            ))}
          </div>
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
              No listings in {activeCategory.name} yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-5">
              Do you sell items in this category around NMU? Apply as a vendor and list your products.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All Listings
              </Link>
              <Link
                href="/vendor/apply"
                className="inline-flex items-center justify-center rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0A4F4F]"
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
