import Link from 'next/link'
import { cookies } from 'next/headers'
import { WaterlineHero } from '@/components/home/WaterlineHero'
import { WaterlineProductCard } from '@/components/cards/WaterlineProductCard'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ServicesChips } from '@/components/home/ServicesChips'
import { VendorAvatarRail } from '@/components/home/VendorAvatarRail'
import { FresherBanner } from '@/components/home/FresherBanner'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import {
  getCurrentUserContext,
  getPublicLodges,
  getPublicProducts,
  getPublicVendors,
} from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Jetty | Everything NMU, one jetty away (Okerenkoko & Kurutie)',
  description:
    'Rooms, services and gear from verified students across Okerenkoko and Kurutie.',
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
            <div className="md:hidden">
              <VendorAvatarRail vendors={vendors} />
            </div>
          ) : (
            <div className="mx-4 rounded-2xl border border-dashed border-border/70 bg-card/40 py-8 px-4 text-center">
              <p className="text-xs text-muted-foreground">
                No stores registered yet at this campus.
              </p>
            </div>
          )}
          {vendors.length > 0 && (
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
              {vendors.slice(0, 8).map((vendor) => {
                const href = vendor.username
                  ? `/vendors/${vendor.username}`
                  : `/vendors/${vendor.slug || vendor.id}`
                return (
                  <Link
                    key={vendor.id}
                    href={href}
                    className="flex-none rounded-2xl border border-border/80 bg-card p-3.5 flex flex-col justify-between gap-3 hover:border-[#0F6E6E] dark:hover:border-[#E8B84A] hover:shadow-xs transition-all group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] overflow-hidden min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-border/80 shadow-2xs">
                        {vendor.logo_url ? (
                          <OptimizedImage src={vendor.logo_url} alt={vendor.shop_name} width={44} height={44} sizes="44px" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#17908D] to-[#0A4F4F] flex items-center justify-center text-white font-bold text-sm">
                            {vendor.shop_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <h3 className="font-bold text-[13px] text-foreground leading-snug truncate max-w-full">{vendor.shop_name}</h3>
                        {vendor.username ? (
                          <p className="text-[11px] text-muted-foreground/70 font-medium truncate">@{vendor.username}</p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground truncate">{vendor.campus || 'Okerenkoko'}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{vendor.department_or_business_info || vendor.description || 'Verified Campus Merchant'}</p>
                    <div className="pt-2 border-t border-border/60 flex items-center justify-end text-[11px] font-semibold text-[#0F6E6E] dark:text-[#E8B84A] gap-0.5">
                      <span>View store</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* 6. NMU Fresher Kit Banner */}
        <FresherBanner />
      </div>
    </div>
  )
}
