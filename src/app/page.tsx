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
  MessageCircle,
  MapPin,
  BadgeCheck,
  Wrench,
  CheckSquare,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductCard } from '@/components/cards/ProductCard'
import { VendorCard } from '@/components/cards/VendorCard'
import {
  getCurrentUserContext,
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
}

export default async function HomePage() {
  const [userContext, categories, { products: allProducts }, vendors] = await Promise.all([
    getCurrentUserContext(),
    getPublicCategories(),
    getPublicProducts({ limit: 24, sort: 'newest', availability: 'available_only' }),
    getPublicVendors({ verifiedOnly: true }),
  ])

  // Count approved, in-stock listings per category slug
  const categoryCounts = new Map<string, number>()
  for (const product of allProducts) {
    const slug = product.category?.slug
    if (slug) {
      categoryCounts.set(slug, (categoryCounts.get(slug) || 0) + 1)
    }
  }

  // Only show categories on the homepage that have real, approved inventory
  const activeCategoriesWithStock = categories.filter(
    (cat) => (categoryCounts.get(cat.slug) || 0) > 0
  )

  // 1. Featured Cadet Gear (curated flagship category)
  const featuredCadetProducts = allProducts
    .filter(
      (p) =>
        p.category?.slug === 'maritime-cadet-gear' ||
        p.category_id === 'cat-maritime-cadet-gear'
    )
    .slice(0, 4)

  const featuredIds = new Set(featuredCadetProducts.map((p) => p.id))

  // 2. Newly Listed Products — ordered by real created_at timestamp, strictly excluding products shown above
  const newlyListedProducts = allProducts
    .filter((p) => !featuredIds.has(p.id))
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8)

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-clip flex-col bg-background text-foreground pb-15 md:pb-0">
      <Navbar
        user={userContext.user}
        profile={userContext.profile}
        vendor={userContext.vendor}
      />

      <main className="flex-1 min-w-0 w-full">
        {/* Hero & Main Search */}
        <section className="border-b border-border bg-card py-6 sm:py-10 md:py-12">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Your campus. Your marketplace.
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Find cadet boots, action rigs, electronics, books, and hostel essentials across NMU Okerenkoko &amp; Kurutie—compare sellers and message verified vendors on WhatsApp.
              </p>

              {/* Early Value Proposition Line */}
              <p className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A]">
                Browse freely · Compare sellers · Order directly on WhatsApp
              </p>

              {/* Search Form */}
              <form action="/marketplace" method="GET" role="search" className="pt-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <label htmlFor="hero-search-input" className="sr-only">
                      Search listings by product name, size, category, or campus location
                    </label>
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="hero-search-input"
                      type="search"
                      name="q"
                      placeholder="Search boots, action rigs, calculators, size 43..."
                      className="w-full h-11 sm:h-12 pl-10 sm:pl-11 pr-3 rounded-xl border border-input bg-background text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:border-[#0F6E6E] focus:outline-none focus:ring-2 focus:ring-[#0F6E6E]/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-[#0F6E6E] text-white font-semibold text-xs sm:text-sm hover:bg-[#0A4F4F] transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]"
                  >
                    Search listings
                  </button>
                </div>

                {/* Quick-Explore Shortcuts (Tappable touch targets, no deferred housing) */}
                <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
                  {[
                    { label: 'Safety boots', href: '/marketplace?q=safety+boots' },
                    { label: 'Action rigs', href: '/marketplace?q=action+rig' },
                    { label: 'Calculators', href: '/marketplace?q=calculator' },
                    { label: 'Fresher Kit', href: '/fresher-kit' },
                    { label: 'Campus Services', href: '/services' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="inline-flex min-h-9 items-center shrink-0 rounded-lg border border-border bg-muted/70 px-3 py-1.5 font-medium text-foreground hover:border-[#0F6E6E] hover:bg-[#E6F2F2] hover:text-[#0A4F4F] dark:hover:bg-[#132A2A] dark:hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Shop by Category (Only categories with real approved inventory) */}
        <section className="py-7 sm:py-10 border-b border-border/70">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  Shop by category
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Categories with approved, in-stock listings from verified campus vendors
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline flex items-center gap-1 shrink-0"
              >
                All listings ({allProducts.length}) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {activeCategoriesWithStock.map((cat) => {
                const IconComp = categoryIconMap[cat.icon] || Package
                const count = categoryCounts.get(cat.slug) || 0
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`group flex min-w-0 flex-col justify-between rounded-xl border p-3.5 sm:p-4 transition-all ${
                      cat.is_priority
                        ? 'border-[#0F6E6E]/40 bg-[#E6F2F2]/70 dark:bg-[#132A2A] hover:bg-[#E6F2F2] hover:border-[#0F6E6E]'
                        : 'border-border bg-card hover:border-[#0F6E6E]/50 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${
                          cat.is_priority
                            ? 'bg-[#0F6E6E] text-white'
                            : 'bg-muted text-foreground group-hover:bg-[#E6F2F2] group-hover:text-[#0A4F4F]'
                        } transition-colors`}
                      >
                        <IconComp className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                      </div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                          cat.is_priority
                            ? 'bg-[#E8B84A]/30 border border-[#E8B84A]/60 text-[#0E1B1B] dark:text-[#E8B84A]'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {count} {count === 1 ? 'listing' : 'listings'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] truncate">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* 2 Campus Resource Shortcuts (Fresher Kit & Campus Services — Housing removed) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-1">
              <Link
                href="/fresher-kit"
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-3.5 sm:p-4 hover:border-[#0F6E6E] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6F2F2] text-[#0F6E6E] dark:bg-[#132A2A] dark:text-[#E8B84A]">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#0F6E6E] truncate">
                      NMU Fresher Kit Checklist
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      Week-1 cadet uniform, study &amp; hostel checklist with direct search links
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-[#0F6E6E]" />
              </Link>

              <Link
                href="/services"
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-3.5 sm:p-4 hover:border-[#0F6E6E] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6F2F2] text-[#0F6E6E] dark:bg-[#132A2A] dark:text-[#E8B84A]">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#0F6E6E] truncate">
                      Campus Services &amp; Repairs
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      Uniform tailoring, printing, laundry &amp; verified campus service providers
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-[#0F6E6E]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Cadet Gear (Curated flagship section, no fake popularity claims) */}
        {featuredCadetProducts.length > 0 && (
          <section className="py-7 sm:py-10">
            <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                    Featured cadet gear
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Regulation uniforms, steel-toe safety boots, and parade essentials for NMU cadets
                  </p>
                </div>
                <Link
                  href="/category/maritime-cadet-gear"
                  className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline flex items-center gap-1 shrink-0"
                >
                  All Cadet Gear <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {featuredCadetProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newly Listed Products (Strictly deduplicated & sorted by created_at) */}
        <section className="py-7 sm:py-10 border-t border-border/70 bg-card/60">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  Newly listed products
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Latest approved in-stock listings across electronics, study supplies, and hostel essentials
                </p>
              </div>
              <Link
                href="/marketplace?sort=newest"
                className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline flex items-center gap-1 shrink-0"
              >
                Browse all ({allProducts.length}) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {newlyListedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {newlyListedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-base font-bold text-foreground">No additional listings yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Are you selling around NMU? Become a vendor to list your products on Jetty.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Verified Vendor Storefronts */}
        <section className="py-7 sm:py-10 border-t border-border/70">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  Verified vendor storefronts
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Approved student sellers and Okerenkoko shops whose identity and WhatsApp contact details have been checked
                </p>
              </div>
              <Link
                href="/vendors"
                className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline flex items-center gap-1 shrink-0"
              >
                All vendors ({vendors.length}) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
              {vendors.slice(0, 3).map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>
        </section>

        {/* How Buying Works & Become a Vendor CTA */}
        <section className="py-8 sm:py-12 border-t border-border bg-card">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-stretch">
              {/* How to buy safely (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-border bg-background p-5 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    How buying on Jetty works
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    No buyer registration required. Only approved vendors whose identity and WhatsApp number have been checked can publish listings on Jetty.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
                    <div className="rounded-xl bg-card p-3.5 sm:p-4 border border-border">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A] mb-1">
                        <BadgeCheck className="h-4 w-4 shrink-0" />
                        1. Discover &amp; Compare
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Browse cadet gear, electronics, or hostel supplies. Check whether the seller is a physical shop, student seller, or campus pickup point.
                      </p>
                    </div>

                    <div className="rounded-xl bg-card p-3.5 sm:p-4 border border-border">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A] mb-1">
                        <MessageCircle className="h-4 w-4 shrink-0" />
                        2. Message on WhatsApp
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Confirm the item&apos;s exact size, condition, price, live photo, and current availability on WhatsApp before travelling.
                      </p>
                    </div>

                    <div className="rounded-xl bg-card p-3.5 sm:p-4 border border-border">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A] mb-1">
                        <MapPin className="h-4 w-4 shrink-0" />
                        3. Pick Up &amp; Pay Directly
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Meet at the seller&apos;s shop or campus landmark, inspect the product in person, and pay the vendor directly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Always confirm size, condition, price, and availability before travelling or paying.
                  </p>
                  <Link
                    href="/safety"
                    className="text-xs font-bold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline shrink-0"
                  >
                    Safety &amp; Verification Policy →
                  </Link>
                </div>
              </div>

              {/* Sell on Jetty CTA (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl bg-[#0A4F4F] text-white p-5 sm:p-8 flex flex-col justify-between">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Sell on Jetty
                  </h2>
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                    Stop relying on expiring 24-hour WhatsApp statuses. Create your verified storefront, set your shop or campus pickup landmark, and let NMU students find your products via search.
                  </p>
                  <ul className="space-y-2 text-xs text-white/85 pt-1">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E8B84A] shrink-0" />
                      Manage your own listings, prices, sizes, and stock status anytime
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E8B84A] shrink-0" />
                      Receive structured buyer inquiries directly on your WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E8B84A] shrink-0" />
                      Pin your shop on the map or keep your student hostel location private
                    </li>
                  </ul>
                </div>

                <div className="pt-5 mt-5 border-t border-white/15 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                  <Link
                    href="/vendor/apply"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0F6E6E] border border-white/20 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0E1B1B] transition-colors"
                  >
                    <Store className="h-4 w-4 text-[#E8B84A]" />
                    Become a Vendor
                  </Link>
                  <Link
                    href="/vendors"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    View Verified Stores
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}
