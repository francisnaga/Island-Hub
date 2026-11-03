import Link from 'next/link'
import { cookies } from 'next/headers'
import { HomeFloatingSell } from '@/components/home/HomeFloatingSell'
import { WaterlineHero } from '@/components/home/WaterlineHero'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ServicesChips } from '@/components/home/ServicesChips'
import { VendorAvatarRail } from '@/components/home/VendorAvatarRail'
import { FresherBanner } from '@/components/home/FresherBanner'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { cleanVendorDescription } from '@/components/cards/VendorCard'
import {
  getCurrentUserContext,
  getPublicLodges,
  getPublicProducts,
  getPublicVendors,
} from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Find What You Need Around NMU (Okerenkoko & Kurutie)',
  description:
    'Rooms, services and items from students and businesses across Okerenkoko and Kurutie. Compare cadet uniforms, lodges, haircuts, and campus trades freely on Jetty.',
  keywords: [
    'Nigeria Maritime University marketplace',
    'NMU campus market',
    'NMU cadet gear',
    'NMU lodges Okerenkoko',
    'Kurutie student hostels',
    'NMU campus services',
    'buy and sell NMU',
  ],
  alternates: {
    canonical: 'https://jetty.francisnaga.site',
  },
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

  const [{ products: allProducts }, vendors, filteredLodges, { user, vendor }] =
    await Promise.all([
      getPublicProducts({
        limit: 16,
        sort: 'newest',
        availability: 'available_only',
        campus: selectedCampus,
      }),
      getPublicVendors({
        verifiedOnly: false,
        campus: selectedCampus,
      }),
      getPublicLodges({
        campus: selectedCampus,
      }),
      getCurrentUserContext(),
    ])

  const hasStore = Boolean(user && vendor && vendor.shop_name)

  // In "Just landed", display physical marketplace items only (housing has its dedicated section below; services belong to /services)
  const justLandedItems = allProducts.filter(
    (p) => p.listing_type !== 'housing' && p.listing_type !== 'service'
  )

  return (
    <div className="min-w-0 max-w-full pb-16">
      {/* 1. Deep Teal Hero & Waterline Wave */}
      <WaterlineHero hasStore={hasStore} />

      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 pt-2 md:pt-4">
        {/* 2. Just landed */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-semibold text-[20px] sm:text-[22px] tracking-[-0.025em] text-foreground font-sans">
              Just landed
            </h2>
            <Link
              href="/marketplace"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
            >
              See all
            </Link>
          </div>

          {justLandedItems.length > 0 ? (
            <>
              <div className="md:hidden rail flex gap-3 overflow-x-auto pb-1 px-4 scroll-px-4 scrollbar-none snap-x">
                {justLandedItems.slice(0, 8).map((product, idx) => (
                  <WaterlineProductCard
                    key={product.id}
                    product={product}
                    selectedCampus={selectedCampus}
                    priority={idx < 2}
                  />
                ))}
              </div>
              <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
                {justLandedItems.slice(0, 10).map((product, idx) => (
                  <WaterlineProductCard
                    key={product.id}
                    product={product}
                    selectedCampus={selectedCampus}
                    variant="grid"
                    priority={idx < 4}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mx-4 rounded-2xl border border-dashed border-border/70 bg-card/40 py-8 px-4 text-center">
              <p className="text-xs text-muted-foreground">
                No items listed yet at this campus. Check back soon.
              </p>
            </div>
          )}
        </section>

        {/* 3. Rooms near campus */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-semibold text-[20px] sm:text-[22px] tracking-[-0.025em] text-foreground font-sans">
              Rooms near campus
            </h2>
            <Link
              href="/housing"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
            >
              See all
            </Link>
          </div>

          {filteredLodges.length > 0 ? (
            <>
              <div className="md:hidden rail flex gap-3 overflow-x-auto pb-1 px-4 scroll-px-4 scrollbar-none snap-x">
                {filteredLodges.map((lodge) => (
                  <WaterlineRoomCard
                    key={lodge.id}
                    lodge={lodge}
                    selectedCampus={selectedCampus}
                  />
                ))}
              </div>
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                {filteredLodges.map((lodge) => (
                  <WaterlineRoomCard
                    key={lodge.id}
                    lodge={lodge}
                    selectedCampus={selectedCampus}
                    variant="grid"
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mx-4 rounded-2xl border border-dashed border-border/70 bg-card/40 py-8 px-4 text-center">
              <p className="text-xs text-muted-foreground">
                No rooms listed yet at this campus. Check back soon.
              </p>
            </div>
          )}
        </section>

        {/* 4. Services */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-semibold text-[20px] sm:text-[22px] tracking-[-0.025em] text-foreground font-sans">
              Services
            </h2>
            <Link
              href="/services"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
            >
              See all
            </Link>
          </div>
          <ServicesChips />
        </section>

        {/* 5. Vendors (Matching screenshot - clean circular avatars) */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-semibold text-[20px] sm:text-[22px] tracking-[-0.025em] text-foreground font-sans">
              Verified vendors
            </h2>
            <Link
              href="/marketplace?tab=stores"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
            >
              All vendors
            </Link>
          </div>

          {vendors.length > 0 ? (
            <VendorAvatarRail vendors={vendors} />
          ) : (
            <div className="mx-4 rounded-2xl border border-dashed border-border/70 bg-card/40 py-8 px-4 text-center">
              <p className="text-xs text-muted-foreground">
                No stores registered yet at this campus.
              </p>
            </div>
          )}
        </section>

        {/* 6. NMU Fresher Kit Banner */}
        <FresherBanner />
      </div>

      {/* Floating Sell Action Button & Listing Sheet (Mobile Only) */}
      <HomeFloatingSell isLoggedIn={Boolean(user)} hasStore={hasStore} />
    </div>
  )
}
