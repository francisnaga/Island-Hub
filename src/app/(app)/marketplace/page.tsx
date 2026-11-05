import { Suspense } from 'react'
import { cookies } from 'next/headers'
import {
  getPublicCategories,
  getPublicLodges,
  getPublicProducts,
  getPublicVendors,
} from '@/lib/queries'
import { MarketplaceClient } from '@/components/marketplace/MarketplaceClient'
import { hashString } from '@/lib/feed-algorithm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'NMU Campus Marketplace | Cadet Gear, Books & Electronics',
  description:
    'Search and browse products, action rigs, safety boots, electronics, and verified campus stores across Nigeria Maritime University (Okerenkoko & Kurutie campuses).',
  keywords: [
    'NMU marketplace',
    'Nigeria Maritime University products',
    'NMU cadet gear',
    'NMU safety boots',
    'campus merchants Okerenkoko',
    'Kurutie campus stores',
    'buy and sell NMU',
  ],
  alternates: {
    canonical: 'https://jetty.francisnaga.site/marketplace',
  },
}

const ITEMS_PER_PAGE = 12

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    q?: string
    category?: string
    campus?: string
    minPrice?: string
    maxPrice?: string
    condition?: string
    availability?: string
    sort?: string
    page?: string
    filter?: string
  }>
}) {
  const params = await searchParams
  const cookieStore = await cookies()
  const cookieCampus = cookieStore.get('jetty_campus')?.value
  // Per-visitor feed seed — set by the client on first load, gives each browser
  // a slightly different ordering without needing a login
  const rawFeedSeed = cookieStore.get('jetty_feed_seed')?.value
  const userSeed = rawFeedSeed ? hashString(rawFeedSeed) : undefined
  const activeCampus =
    params.campus || (cookieCampus && cookieCampus !== 'all' ? cookieCampus : 'all')

  const initialTab = params.tab === 'stores' ? 'stores' : 'items'
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const rawQuery = (params.q || '').trim()

  const hasItemFilters = Boolean(
    rawQuery ||
      (params.category && params.category !== 'all') ||
      minPrice ||
      maxPrice ||
      (params.condition && params.condition !== 'all')
  )

  // Always fetch both Items and Stores in parallel so switching tabs is 0ms instant!
  const [categories, productsData, vendorsData, matchingLodges] = await Promise.all([
    getPublicCategories(),
    getPublicProducts({
      q: rawQuery,
      category: params.category || 'all',
      campus: activeCampus,
      minPrice,
      maxPrice,
      condition: params.condition || 'all',
      availability: params.availability === 'all' ? 'all' : 'available_only',
      sort: (params.sort as 'newest' | 'price_asc' | 'price_desc' | 'relevance') || 'newest',
      limit: ITEMS_PER_PAGE,
      page,
      userSeed,
    }),
    getPublicVendors({
      verifiedOnly: false,
      campus: activeCampus,
    }),
    rawQuery
      ? getPublicLodges({ q: rawQuery, campus: activeCampus })
      : Promise.resolve([]),
  ])

  const { products, totalCount } = productsData
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 min-w-0">
        <Suspense fallback={null}>
          <MarketplaceClient
            initialTab={initialTab}
            categories={categories}
            products={products}
            totalCount={totalCount}
            vendors={vendorsData}
            matchingLodges={matchingLodges}
            rawQuery={rawQuery}
            hasItemFilters={hasItemFilters}
            page={page}
            totalPages={totalPages}
            initialStoreFilter={params.filter === 'verified' ? 'verified' : 'all'}
            searchParamsRecord={params}
          />
        </Suspense>
      </div>
    </div>
  )
}
