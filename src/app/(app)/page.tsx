import Link from 'next/link'
import { cookies } from 'next/headers'
import { WaterlineHero } from '@/components/home/WaterlineHero'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ServicesChips } from '@/components/home/ServicesChips'
import { VendorAvatarRail } from '@/components/home/VendorAvatarRail'
import { FresherBanner } from '@/components/home/FresherBanner'
import {
  getCurrentUserContext,
  getPublicLodges,
  getPublicProducts,
  getPublicVendors,
} from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Jetty | NMU Campus Marketplace (Okerenkoko & Kurutie)',
  description:
    'Rooms, services and cadet gear from Nigeria Maritime University students across Okerenkoko and Kurutie.',
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

  return (
    <div className="min-w-0 max-w-full pb-16">
      {/* 1. Deep Teal Hero & Waterline Wave */}
      <WaterlineHero hasStore={hasStore} />

      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 pt-2 md:pt-4">
        {/* 2. Just landed */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
              Just landed
            </h2>
            <Link
              href="/marketplace"
              className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
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
            <p className="px-4 py-4 text-sm text-muted-foreground">
              Nothing listed here yet.{' '}
              <Link
                href="/vendor/dashboard?tab=new&kind=item"
                className="font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
              >
                Add the first item →
              </Link>
            </p>
          )}
        </section>

        {/* 3. Rooms near campus */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
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
            <p className="px-4 py-4 text-sm text-muted-foreground">
              No rooms listed yet.{' '}
              <Link
                href="/vendor/dashboard?tab=new&kind=room"
                className="font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
              >
                List a room →
              </Link>
            </p>
          )}
        </section>

        {/* 4. Services */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
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

        {/* 5. Vendors */}
        <section className="sec">
          <div className="flex items-baseline justify-between px-4 pb-3">
            <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
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
            <p className="px-4 py-4 text-sm text-muted-foreground">
              No stores yet.{' '}
              <Link
                href="/vendor/apply"
                className="font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
              >
                Start selling →
              </Link>
            </p>
          )}
        </section>

        {/* 6. NMU Fresher Kit Banner */}
        <FresherBanner />
      </div>
    </div>
  )
}
