import Link from 'next/link'
import {
  Anchor,
  Search,
  Shirt,
  Laptop,
  BookOpen,
  Home,
  Package,
  ShieldCheck,
  Store,
  ArrowRight,
  MessageCircle,
  MapPin,
  BadgeCheck,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
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
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-slate-900">
      <Navbar
        user={userContext.user}
        profile={userContext.profile}
        vendor={userContext.vendor}
      />

      <main className="flex-1">
        {/* Compact, Discovery-First Hero Section */}
        <section className="border-b border-slate-200/80 bg-white py-10 md:py-14">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-900">
                <Anchor className="h-3.5 w-3.5 text-blue-700" />
                <span>Nigeria Maritime University (NMU) · Okerenkoko, Delta State</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Your campus. Your marketplace.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Discover cadet safety boots, action rigs, electronics, textbooks, and hostel essentials from verified sellers around NMU and Okerenkoko—compare prices and message vendors directly on WhatsApp.
              </p>

              {/* Prominent Search Form */}
              <form action="/marketplace" method="GET" className="pt-2 max-w-2xl">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="search"
                      name="q"
                      placeholder="Search boots, action rigs, electronics, calculators..."
                      className="w-full h-12 sm:h-13 pl-12 pr-4 rounded-xl border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-blue-700 focus:outline-none focus:ring-3 focus:ring-blue-700/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-12 sm:h-13 px-7 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm hover:bg-blue-900 transition-colors shrink-0 cursor-pointer"
                  >
                    Search Products
                  </button>
                </div>

                {/* Quick search tags */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Popular searches:</span>
                  {[
                    { label: 'Safety boots', href: '/marketplace?q=boots' },
                    { label: 'Action rigs', href: '/marketplace?q=action+rig' },
                    { label: 'Beret & badges', href: '/marketplace?q=beret' },
                    { label: 'Power banks', href: '/marketplace?q=power+bank' },
                    { label: 'Calculators', href: '/marketplace?q=calculator' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 transition-colors"
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
        <section className="py-10 border-b border-slate-200/60">
          <div className="container mx-auto max-w-7xl px-4 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Shop by category
                </h2>
                <p className="text-sm text-slate-600">
                  Built around what NMU cadets and Okerenkoko students actually buy
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-sm font-semibold text-blue-800 hover:underline flex items-center gap-1 shrink-0"
              >
                All categories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {categories.map((cat) => {
                const IconComp = categoryIconMap[cat.icon] || Package
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`group flex flex-col justify-between rounded-xl border p-4 transition-all ${
                      cat.is_priority
                        ? 'border-blue-300 bg-blue-50/60 hover:bg-blue-50 hover:border-blue-500'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          cat.is_priority
                            ? 'bg-[#1E3A8A] text-white'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-800'
                        } transition-colors`}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      {cat.is_priority && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
                          Priority
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800">
                        {cat.short_name || cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Popular Around NMU (Priority Cadet Gear & Essentials) */}
        <section className="py-10">
          <div className="container mx-auto max-w-7xl px-4 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">
                  <Anchor className="h-3.5 w-3.5" />
                  Priority Category
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Popular around NMU
                </h2>
              </div>
              <Link
                href="/category/maritime-cadet-gear"
                className="text-sm font-semibold text-blue-800 hover:underline flex items-center gap-1 shrink-0"
              >
                Explore Cadet Gear <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Newly Listed Products */}
        <section className="py-10 border-t border-slate-200/70 bg-white/60">
          <div className="container mx-auto max-w-7xl px-4 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Newly listed products
                </h2>
                <p className="text-sm text-slate-600">
                  Available items from verified vendors across campus and Okerenkoko
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-sm font-semibold text-blue-800 hover:underline flex items-center gap-1 shrink-0"
              >
                Browse all listings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {recentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {recentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-900">No published listings yet</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you selling around NMU? Apply as a vendor to list your products.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Vendor Storefronts */}
        <section className="py-10 border-t border-slate-200/70">
          <div className="container mx-auto max-w-7xl px-4 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Verified vendor storefronts
                </h2>
                <p className="text-sm text-slate-600">
                  Independent student and local community sellers with confirmed contact details
                </p>
              </div>
              <Link
                href="/vendors"
                className="text-sm font-semibold text-blue-800 hover:underline flex items-center gap-1 shrink-0"
              >
                View all vendors <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {vendors.slice(0, 3).map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>
        </section>

        {/* How Buying Works & Safety Guide + Become a Vendor CTA */}
        <section className="py-12 border-t border-slate-200 bg-white">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* How to buy safely (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-[#FAF9F6] p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-900">
                    <ShieldCheck className="h-4 w-4 text-blue-700" />
                    Direct & Transparent Campus Ordering
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    How buying on IslandHub works
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    No registration required to browse. IslandHub connects you directly to verified sellers on campus and around Okerenkoko without middlemen fees.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="rounded-xl bg-white p-4 border border-slate-200/80">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-800 mb-1.5">
                        <BadgeCheck className="h-4 w-4" />
                        1. Discover & Compare
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Browse cadet gear, electronics, or hostel supplies and compare prices across verified sellers.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-slate-200/80">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-800 mb-1.5">
                        <MessageCircle className="h-4 w-4" />
                        2. Message on WhatsApp
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tap the WhatsApp button on any product to send a prefilled inquiry with size and quantity.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-slate-200/80">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-800 mb-1.5">
                        <MapPin className="h-4 w-4" />
                        3. Pickup & Pay Directly
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Use Google Maps directions to the seller&apos;s shop or campus pickup point, inspect your item, and pay the vendor directly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">
                    <strong>Note:</strong> A verified badge confirms we checked the vendor&apos;s identity and contact details. Always confirm availability before travelling.
                  </p>
                  <Link
                    href="/safety"
                    className="text-xs font-bold text-blue-800 hover:underline shrink-0"
                  >
                    Full Safety Guidelines →
                  </Link>
                </div>
              </div>

              {/* Become a Vendor CTA (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl bg-[#0F172A] text-white p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-semibold text-blue-200">
                    <Store className="h-3.5 w-3.5" />
                    For Student Sellers & Local Shops
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Sell on IslandHub Marketplace
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Stop relying on expiring 24-hour WhatsApp statuses. Create your permanent storefront, set your shop or hostel pickup pin, and let NMU students find your products via search.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 pt-1">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Manage your own inventory, sizes, prices, and stock status
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Receive structured orders directly on your WhatsApp number
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Share exact Google Maps shop directions or keep your hostel location private
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/vendor/apply"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    <Store className="h-4 w-4" />
                    Become a Vendor
                  </Link>
                  <Link
                    href="/vendors"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
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
    </div>
  )
}
