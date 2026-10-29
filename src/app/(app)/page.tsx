import Link from 'next/link'
import { WaterlineHero } from '@/components/home/WaterlineHero'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ServicesChips } from '@/components/home/ServicesChips'
import { VendorAvatarRail } from '@/components/home/VendorAvatarRail'
import { FresherBanner } from '@/components/home/FresherBanner'
import { LODGE_LISTINGS } from '@/lib/lodge-data'
import { getPublicProducts, getPublicVendors } from '@/lib/queries'

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
  const selectedCampus = sp.campus || 'all'

  const [{ products: allProducts }, verifiedVendors] = await Promise.all([
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
  ])

  // Filter lodge rooms by campus
  const filteredLodges = LODGE_LISTINGS.filter((l) => {
    if (selectedCampus === 'all' || !selectedCampus) return true
    return l.campus.toLowerCase() === selectedCampus.toLowerCase()
  })

  return (
    <div className="min-w-0 max-w-full pb-16">
      {/* 1. Deep Teal Hero & Waterline Wave (Scroll-linked) */}
      <WaterlineHero />

      <div className="space-y-6 pt-2">
        {/* 2. Just landed (Horizontal Snap Rail) */}
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
          <div className="rail flex gap-3 overflow-x-auto pb-1 px-4 scrollbar-none snap-x">
            {allProducts.slice(0, 8).map((product) => (
              <WaterlineProductCard
                key={product.id}
                product={product}
                selectedCampus={selectedCampus}
              />
            ))}
          </div>
        </section>

        {/* 3. Rooms near campus (Wide Rail) */}
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
          <div className="rail flex gap-3 overflow-x-auto pb-1 px-4 scrollbar-none snap-x">
            {filteredLodges.map((lodge) => (
              <WaterlineRoomCard
                key={lodge.id}
                lodge={lodge}
                selectedCampus={selectedCampus}
              />
            ))}
          </div>
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

        {/* 5. Verified vendors (Monogram Avatar Rail) */}
        {verifiedVendors.length > 0 && (
          <section className="sec">
            <div className="flex items-baseline justify-between px-4 pb-3">
              <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] tracking-[-0.005em] text-foreground">
                Verified vendors
              </h2>
              <Link
                href="/vendors"
                className="text-[14px] font-medium text-[#0F6E6E] dark:text-[#E8B84A] hover:underline"
              >
                All stores
              </Link>
            </div>
            <VendorAvatarRail vendors={verifiedVendors} />
          </section>
        )}

        {/* 6. NMU Fresher Kit Banner */}
        <FresherBanner />
      </div>
    </div>
  )
}
