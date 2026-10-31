import Link from 'next/link'
import { cookies } from 'next/headers'
import { Plus, ShoppingBag, Bed, Store, ShieldCheck } from 'lucide-react'
import { WaterlineHero } from '@/components/home/WaterlineHero'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ServicesChips } from '@/components/home/ServicesChips'
import { VendorAvatarRail } from '@/components/home/VendorAvatarRail'
import { FresherBanner } from '@/components/home/FresherBanner'
import { getPublicLodges, getPublicProducts, getPublicVendors } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Jetty | NMU Campus Marketplace (Okerenkoko & Kurutie)',
  description:
    'Rooms, services and cadet gear from verified Nigeria Maritime University students across Okerenkoko and Kurutie.',
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ campus?: string }>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const cookieCampus = cookieStore.get('jetty_campus')?.value
  const selectedCampus =
    sp.campus || (cookieCampus && cookieCampus !== 'all' ? cookieCampus : 'all')

  const [{ products: allProducts }, verifiedVendors, filteredLodges] = await Promise.all([
    getPublicProducts({
      limit: 16,
      sort: 'newest',
      availability: 'available_only',
      campus: selectedCampus,
    }),
    getPublicVendors({
      verifiedOnly: true,
      campus: selectedCampus,
    }),
    getPublicLodges({
      campus: selectedCampus,
    }),
  ])

  return (
    <div className="min-w-0 max-w-full pb-16">
      {/* 1. Deep Teal Hero & Waterline Wave (Scroll-linked) */}
      <WaterlineHero />

      <div className="space-y-6 pt-2">
        {/* 2. Just landed (Horizontal Snap Rail or High-Converting Empty State) */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
              Just landed
            </h2>
            <Link
              href="/marketplace"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#E8B84A] hover:underline"
            >
              See all
            </Link>
          </div>

          {allProducts.length > 0 ? (
            <div className="rail flex gap-3 overflow-x-auto pb-1 px-4 scroll-px-4 scrollbar-none snap-x">
              {allProducts.slice(0, 8).map((product) => (
                <WaterlineProductCard
                  key={product.id}
                  product={product}
                  selectedCampus={selectedCampus}
                />
              ))}
            </div>
          ) : (
            <div className="px-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0A4F4F] dark:text-[#E8B84A] flex items-center justify-center shrink-0 mt-0.5">
                    <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-foreground leading-snug">
                      Sell cadet gear, electronics &amp; hostel items
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Be the first verified student vendor on campus. Students message you directly on WhatsApp.
                    </p>
                  </div>
                </div>
                <Link
                  href="/vendor/apply"
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0A4F4F] hover:bg-[#0F6E6E] text-white text-xs font-semibold transition-colors shrink-0 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>List item</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 3. Rooms near campus (Wide Rail or High-Converting Empty State) */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
              Rooms near campus
            </h2>
            <Link
              href="/housing"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#E8B84A] hover:underline"
            >
              See all
            </Link>
          </div>

          {filteredLodges.length > 0 ? (
            <div className="rail flex gap-3 overflow-x-auto pb-1 px-4 scroll-px-4 scrollbar-none snap-x">
              {filteredLodges.map((lodge) => (
                <WaterlineRoomCard
                  key={lodge.id}
                  lodge={lodge}
                  selectedCampus={selectedCampus}
                />
              ))}
            </div>
          ) : (
            <div className="px-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0A4F4F] dark:text-[#E8B84A] flex items-center justify-center shrink-0 mt-0.5">
                    <Bed className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-foreground leading-snug">
                      Have a student room or self-contain to let?
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      List verified rooms near Okerenkoko &amp; Kurutie. Admin-reviewed for student safety.
                    </p>
                  </div>
                </div>
                <Link
                  href="/vendor/products/new?type=housing"
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Post room</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 4. Services (Wrapping Chips) */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
              Services
            </h2>
            <Link
              href="/services"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#E8B84A] hover:underline"
            >
              See all
            </Link>
          </div>
          <ServicesChips />
        </section>

        {/* 5. Verified vendors (Monogram Avatar Rail or Onboarding Prompt) */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
              Verified vendors
            </h2>
            <Link
              href="/marketplace?tab=stores"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#E8B84A] hover:underline"
            >
              All stores
            </Link>
          </div>

          {verifiedVendors.length > 0 ? (
            <VendorAvatarRail vendors={verifiedVendors} />
          ) : (
            <div className="px-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#E8B84A]/20 text-[#0A4F4F] dark:text-[#E8B84A] flex items-center justify-center shrink-0 mt-0.5">
                    <Store className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[15px] font-semibold text-foreground leading-snug">
                        Get your storefront verified
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Verified &amp; featured vendors rank first across Jetty and get a dedicated campus store link.
                    </p>
                  </div>
                </div>
                <Link
                  href="/vendor/apply"
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#E8B84A] text-[#0E1B1B] text-xs font-bold hover:opacity-90 transition-opacity shrink-0 shadow-2xs"
                >
                  <span>Open store</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 6. NMU Fresher Kit Banner */}
        <FresherBanner />
      </div>
    </div>
  )
}
