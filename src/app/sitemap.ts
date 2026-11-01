import type { MetadataRoute } from 'next'
import {
  getPublicProducts,
  getPublicVendors,
  getPublicLodges,
  getPublicCategories,
} from '@/lib/queries'
import { SERVICES_LIST } from '@/lib/services-data'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jetty.francisnaga.site'
  const now = new Date()

  // 1. Core High-Priority Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/housing`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/vendors`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/fresher-kit`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // 2. Campus Services Taxonomy Routes (/services/[slug])
  const serviceRoutes: MetadataRoute.Sitemap = SERVICES_LIST.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 3. Dynamic Products (/product/[slug])
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const { products } = await getPublicProducts({ limit: 500, availability: 'available_only' })
    productRoutes = products
      .filter((p) => p.slug || p.id)
      .map((p) => ({
        url: `${baseUrl}/product/${p.slug || p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
  } catch {
    // Graceful fallback if DB query fails during build
  }

  // 4. Dynamic Housing Lodges (/housing/[id])
  let housingRoutes: MetadataRoute.Sitemap = []
  try {
    const lodges = await getPublicLodges()
    housingRoutes = lodges.map((l) => ({
      url: `${baseUrl}/housing/${l.slug || l.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    // Graceful fallback
  }

  // 5. Dynamic Vendor Storefronts (/vendors/[slug])
  let vendorRoutes: MetadataRoute.Sitemap = []
  try {
    const vendors = await getPublicVendors({ verifiedOnly: false })
    vendorRoutes = vendors
      .filter((v) => v.username || v.slug || v.id)
      .map((v) => ({
        url: `${baseUrl}/vendors/${v.username ? `@${v.username}` : (v.slug || v.id)}`,
        lastModified: v.updated_at ? new Date(v.updated_at) : now,
        changeFrequency: 'daily',
        priority: 0.75,
      }))
  } catch {
    // Graceful fallback
  }

  // 6. Dynamic Categories (/category/[slug])
  let categoryRoutes: MetadataRoute.Sitemap = []
  try {
    const categories = await getPublicCategories()
    categoryRoutes = categories
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${baseUrl}/category/${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      }))
  } catch {
    // Graceful fallback
  }

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...productRoutes,
    ...housingRoutes,
    ...vendorRoutes,
    ...categoryRoutes,
  ]
}
