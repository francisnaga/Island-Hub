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
    getPublicProducts({ limit: 12, sort: 'newest', availability: 'available_only' }),
    getPublicVendors({ verifiedOnly: true }),
  ])

  const cadetProducts = allProducts.filter(
    (p) => p.category?.slug === 'maritime-cadet-gear' || p.category_id === 'cat-maritime-cadet-gear'
  )
  const popularProducts = cadetProducts.length >= 2 ? cadetProducts.slice(0, 4) : allProducts.slice(0, 4)
  const recentProducts = allProducts.slice(0, 8)

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-clip flex-col bg-background text-foreground pb-15 md:pb-0">
      <Navbar
        user={userContext.user}
        profile={userContext.profile}
        vendor={userContext.vendor}
      />

      <main className="flex-1 min-w-0 w-full">
        {/* Compact, Mobile-First Discovery Hero (No Eyebrow Pill Slop) */}
        <section className="border-b border-border bg-card py-6 sm:py-10 md:py-12">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Your campus. Your marketplace.
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Find cadet boots, action rigs, electronics, services, and housing across NMU Okerenkoko &amp; Kurutie—compare prices and message verified sellers on WhatsApp.
              </p>

              {/* Inline Search Form (Single row on mobile & desktop) */}
              <form action="/marketplace" method="GET" className="pt-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <input
                      type="search"
                      name="q"
                      placeholder="Search boots, action rigs, electronics..."
                      className="w-full h-11 sm:h-12 pl-10 sm:pl-11 pr-3 rounded-xl border border-input bg-background text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:border-[#0F6E6E] focus:outline-none focus:ring-2 focus:ring-[#0F6E6E]/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-[#0F6E6E] text-white font-semibold text-xs sm:text-sm hover:bg-[#0A4F4F] transition-colors shrink-0 cursor-pointer"
                  >
                    Search
                  </button>
                </div>

                {/* Horizontal Quick Links */}
                <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
                  {[
                    { label: 'Safety boots', href: '/marketplace?q=boots' },
                    { label: 'Action rigs', href: '/marketplace?q=action+rig' },
                    { label: 'Fresher Kit', href: '/fresher-kit' },
                    { label: 'Services', href: '/services' },
                    { label: 'Housing', href: '/housing' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="shrink-0 rounded-lg border border-border bg-muted/70 px-2.5 py-1 text-foreground hover:border-[#0F6E6E] hover:bg-[#E6F2F2] hover:text-[#0A4F4F] dark:hover:bg-[#132A2A] dark:hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Shop by Category */}
        <section className="py-7 sm:py-10 border-b border-border/70">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                Shop by category
              </h2>
              <Link
                href="/marketplace"
                className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline flex items-center gap-1 shrink-0"
              >
                All listings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
              {categories.map((cat) => {
                const IconComp = categoryIconMap[cat.icon] || Package
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`group flex min-w-0 flex-col justify-between rounded-xl border p-3 sm:p-4 transition-all ${
                      cat.is_priority
                        ? 'border-[#0F6E6E]/40 bg-[#E6F2F2]/70 dark:bg-[#132A2A] hover:bg-[#E6F2F2] hover:border-[#0F6E6E]'
                        : 'border-border bg-card hover:border-[#0F6E6E]/50 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${
                          cat.is_priority
                            ? 'bg-[#0F6E6E] text-white'
                            : 'bg-muted text-foreground group-hover:bg-[#E6F2F2] group-hover:text-[#0A4F4F]'
                        } transition-colors`}
                      >
                        <IconComp className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                      </div>
                      {cat.is_priority && (
                        <span className="rounded-md bg-[#E8B84A]/25 border border-[#E8B84A]/50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0E1B1B] dark:text-[#E8B84A]">
                          Cadet
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] truncate">
                        {cat.short_name || cat.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 mt-0.5 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Campus Directory Links: Fresher Kit, Services, Housing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
              <Link
                href="/fresher-kit"
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-3.5 sm:p-4 hover:border-[#0F6E6E] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6F2F2] text-[#0F6E6E] dark:bg-[#132A2A] dark:text-[#E8B84A]">
                    <CheckSquare className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#0F6E6E] truncate">
                      NMU Fresher Kit Checklist
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      Find cadet essentials in one place
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
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6F2F2] text-[#0F6E6E] dark:bg-[#132A2A] dark:text-[#E8B84A]">
                    <Wrench className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#0F6E6E] truncate">
                      Campus Services
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      Tailoring, laundry, barbing &amp; printing
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-[#0F6E6E]" />
              </Link>

              <Link
                href="/housing"
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-3.5 sm:p-4 hover:border-[#0F6E6E] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6F2F2] text-[#0F6E6E] dark:bg-[#132A2A] dark:text-[#E8B84A]">
                    <Home className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#0F6E6E] truncate">
                      Housing &amp; Bedspaces
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      Okerenkoko &amp; Kurutie student rooms
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-[#0F6E6E]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Around NMU (2-column grid on mobile) */}
        <section className="py-7 sm:py-10">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                Popular around NMU
              </h2>
              <Link
                href="/category/maritime-cadet-gear"
                className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline flex items-center gap-1 shrink-0"
              >
                Cadet Gear <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Newly Listed Products (2-column grid on mobile) */}
        <section className="py-7 sm:py-10 border-t border-border/70 bg-card/60">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  Newly listed products
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Available items from verified vendors across Okerenkoko and Kurutie
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline flex items-center gap-1 shrink-0"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {recentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-base font-bold text-foreground">No published listings yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Are you selling around NMU? Apply as a vendor to list your products on Jetty.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Vendor Storefronts */}
        <section className="py-7 sm:py-10 border-t border-border/70">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                Verified vendor storefronts
              </h2>
              <Link
                href="/vendors"
                className="text-xs sm:text-sm font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline flex items-center gap-1 shrink-0"
              >
                All vendors <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
              {vendors.slice(0, 3).map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>
        </section>

        {/* How Buying Works & Become a Vendor CTA (Clean, No Eyebrow Pills) */}
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
                    No registration required to browse. Jetty connects you directly to verified sellers across Okerenkoko and Kurutie without middlemen fees.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
                    <div className="rounded-xl bg-card p-3.5 sm:p-4 border border-border">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A] mb-1">
                        <BadgeCheck className="h-4 w-4" />
                        1. Compare
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Browse cadet gear, electronics, or hostel supplies and compare prices across verified sellers.
                      </p>
                    </div>

                    <div className="rounded-xl bg-card p-3.5 sm:p-4 border border-border">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A] mb-1">
                        <MessageCircle className="h-4 w-4" />
                        2. WhatsApp
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Tap the WhatsApp button on any product to send a prefilled inquiry with size and quantity.
                      </p>
                    </div>

                    <div className="rounded-xl bg-card p-3.5 sm:p-4 border border-border">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A] mb-1">
                        <MapPin className="h-4 w-4" />
                        3. Pickup &amp; Pay
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Meet at the seller&apos;s campus landmark or shop, inspect your item, and pay directly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Always confirm stock availability on WhatsApp before travelling.
                  </p>
                  <Link
                    href="/safety"
                    className="text-xs font-bold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline shrink-0"
                  >
                    Safety Guidelines →
                  </Link>
                </div>
              </div>

              {/* Become a Vendor CTA (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl bg-[#0A4F4F] text-white p-5 sm:p-8 flex flex-col justify-between">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Sell on Jetty
                  </h2>
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                    Stop relying on expiring 24-hour WhatsApp statuses. Create your permanent storefront, set your shop or hostel pickup landmark, and let NMU students find your products via search.
                  </p>
                  <ul className="space-y-2 text-xs text-white/85 pt-1">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E8B84A] shrink-0" />
                      Manage your own inventory, sizes, prices, and stock status
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E8B84A] shrink-0" />
                      Receive structured orders directly on your WhatsApp number
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E8B84A] shrink-0" />
                      Share exact Google Maps shop directions or keep your hostel location private
                    </li>
                  </ul>
                </div>

                <div className="pt-5 mt-5 border-t border-white/15 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                  <Link
                    href="/vendor/apply"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F6E6E] border border-white/20 px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#0E1B1B] transition-colors"
                  >
                    <Store className="h-4 w-4 text-[#E8B84A]" />
                    Become a Vendor
                  </Link>
                  <Link
                    href="/vendors"
                    className="inline-flex items-center justify-center rounded-xl border border-white/25 px-4 py-3 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    View Existing Stores
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
