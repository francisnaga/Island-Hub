import Link from 'next/link'
import {
  Anchor,
  Search,
  Shirt,
  Laptop,
  BookOpen,
  Home,
  Package,
  Store,
  ArrowRight,
  Wrench,
  CheckSquare,
  Utensils,
} from 'lucide-react'
import { ProductCard } from '@/components/cards/ProductCard'
import { VendorCard } from '@/components/cards/VendorCard'
import {
  getPublicCategories,
  getPublicProducts,
  getPublicVendors,
} from '@/lib/queries'

export const dynamic = 'force-dynamic'

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Anchor,
  Shirt,
  Laptop,
  BookOpen,
  Home,
  Package,
  Utensils,
  Wrench,
}

export default async function HomePage() {
  const [categories, { products: allProducts }, vendors] = await Promise.all([
    getPublicCategories(),
    getPublicProducts({ limit: 24, sort: 'newest', availability: 'available_only' }),
    getPublicVendors({ verifiedOnly: true }),
  ])

  const categoryCounts = new Map<string, number>()
  for (const product of allProducts) {
    const slug = product.category?.slug
    if (slug) {
      categoryCounts.set(slug, (categoryCounts.get(slug) || 0) + 1)
    }
  }

  const activeCategoriesWithStock = categories.filter(
    (cat) => (categoryCounts.get(cat.slug) || 0) > 0
  )

  const featuredCadetProducts = allProducts
    .filter(
      (p) =>
        p.category?.slug === 'maritime-cadet-gear' ||
        p.category_id === 'cat-maritime-cadet-gear'
    )
    .slice(0, 4)

  const featuredIds = new Set(featuredCadetProducts.map((p) => p.id))

  const newlyListedProducts = allProducts
    .filter((p) => !featuredIds.has(p.id))
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8)

  return (
    <div className="space-y-6 sm:space-y-9 py-4 sm:py-7">
      {/* 1. Compact Visual Search Hero */}
      <section className="container mx-auto max-w-7xl px-3.5 sm:px-4">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Shop around NMU.
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Okerenkoko &amp; Kurutie · Direct WhatsApp orders
              </p>
            </div>
          </div>

          <form action="/marketplace" method="GET" role="search">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <label htmlFor="hero-search-input" className="sr-only">
                  Search listings
                </label>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="hero-search-input"
                  type="search"
                  name="q"
                  placeholder="Search boots, action rigs, calculators, fruit bowls..."
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-xl bg-foreground text-background font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Quick Tap Pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
              {[
                { label: 'Safety boots', href: '/marketplace?q=safety+boots' },
                { label: 'Action rigs', href: '/marketplace?q=action+rig' },
                { label: 'Lodge & Rooms', href: '/housing' },
                { label: 'Calculators', href: '/marketplace?q=calculator' },
                { label: 'Meals & Treats', href: '/marketplace?category=food-beauty-other' },
                { label: 'Fresher Kit', href: '/fresher-kit' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex h-8 items-center shrink-0 rounded-lg border border-border bg-muted/60 px-3 font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* 2. Compact Visual Category Grid */}
      <section className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Categories
          </h2>
          <Link
            href="/marketplace"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            All ({allProducts.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {activeCategoriesWithStock.map((cat) => {
            const IconComp = categoryIconMap[cat.icon] || Package
            const count = categoryCounts.get(cat.slug) || 0
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center justify-center text-center rounded-2xl border border-border bg-card p-3 sm:p-4 hover:border-primary/60 transition-all gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary group-hover:scale-105 transition-transform">
                  <IconComp className="h-5 w-5" />
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-xs font-bold text-foreground truncate group-hover:text-primary">
                    {cat.short_name || cat.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {count} {count === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 3. Featured Cadet Gear */}
      {featuredCadetProducts.length > 0 && (
        <section className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Cadet Gear
            </h2>
            <Link
              href="/category/maritime-cadet-gear"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredCadetProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. New Arrivals */}
      {newlyListedProducts.length > 0 && (
        <section className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              New Arrivals
            </h2>
            <Link
              href="/marketplace?sort=newest"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Browse all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {newlyListedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Verified Vendors */}
      <section className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Verified Vendors
          </h2>
          <Link
            href="/vendors"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            All stores ({vendors.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {vendors.slice(0, 4).map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      {/* 6. Compact Shortcuts + Sell CTA */}
      <section className="container mx-auto max-w-7xl px-3.5 sm:px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/fresher-kit"
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 hover:border-primary/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary truncate">
                  NMU Fresher Kit
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Week-1 cadet &amp; hostel checklist
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          </Link>

          <Link
            href="/housing"
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 hover:border-primary/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary truncate">
                  Campus Lodges &amp; Bedspaces
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Hostels &amp; self-contain rooms near NMU
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          </Link>

          <Link
            href="/vendor/apply"
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 hover:border-primary/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary truncate">
                  Sell on Jetty
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Open your free campus storefront
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}
