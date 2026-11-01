import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { INITIAL_CATEGORIES, sanitizePublicVendor } from './marketplace-data'
import { LodgeListing, mapProductToLodgeListing } from './lodge-data'
import {
  SERVICES_LIST,
  ServiceItem,
  ServiceProvider,
  inferServiceSlugFromProduct,
  normalizeServiceSlug,
} from './services-data'
import { Category, CategoryRequest, isAdminEmail, Product, UserProfile, Vendor } from './types'

const SYSTEM_SECTION_SLUGS = new Set(['campus-services', 'student-housing'])

export const getPublicCategories = cache(async function getPublicCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (!error && data && data.length > 0) {
      const dbCats = (data as Category[]).filter(
        (cat) => !SYSTEM_SECTION_SLUGS.has(cat.slug)
      )
      const bySlug = new Map<string, Category>()
      for (const initCat of INITIAL_CATEGORIES) {
        bySlug.set(initCat.slug, initCat)
      }
      for (const cat of dbCats) {
        const seedOverride = INITIAL_CATEGORIES.find((c) => c.slug === cat.slug)
        bySlug.set(cat.slug, {
          ...cat,
          ...(seedOverride
            ? {
                name: seedOverride.name,
                short_name: seedOverride.short_name,
                description: seedOverride.description,
                display_order: seedOverride.display_order,
              }
            : {}),
        })
      }
      return Array.from(bySlug.values()).sort(
        (a, b) => (a.display_order || 99) - (b.display_order || 99)
      )
    }
  } catch {
    // Fallback to initial categories taxonomy if DB is unreachable
  }
  return INITIAL_CATEGORIES
})

export async function getPublicVendors(options?: {
  query?: string
  verifiedOnly?: boolean
  campus?: string
  category?: string
  featuredOnly?: boolean
}): Promise<Vendor[]> {
  const hasSearchQuery = Boolean(options?.query?.trim())
  const verifiedOnly = options?.verifiedOnly === true

  let list: Vendor[] = []

  try {
    const supabase = await createClient()
    let dbQuery = supabase
      .from('vendors')
      .select('*')
      .eq('is_demo', false)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (verifiedOnly) {
      dbQuery = dbQuery.eq('verification_status', 'verified')
    } else {
      // All active stores (both verified and unverified) appear in Stores; only rejected/suspended are excluded
      dbQuery = dbQuery.in('verification_status', ['verified', 'pending'])
    }

    if (options?.featuredOnly) {
      dbQuery = dbQuery.eq('is_featured', true)
    }

    const [{ data, error }, { data: approvedProds }] = await Promise.all([
      dbQuery,
      supabase
        .from('products')
        .select('id, vendor_id')
        .eq('status', 'approved')
        .eq('is_demo', false),
    ])

    if (!error && data) {
      const countMap: Record<string, number> = {}
      if (approvedProds) {
        for (const p of approvedProds as { id: string; vendor_id: string }[]) {
          countMap[p.vendor_id] = (countMap[p.vendor_id] || 0) + 1
        }
      }
      list = (data as Vendor[]).map((v) => ({
        ...v,
        products_count: countMap[v.id] || 0,
      }))
    }
  } catch {
    // Return empty list if offline
  }

  if (hasSearchQuery && options?.query) {
    const q = options.query.trim().toLowerCase()
    const tokens = q.split(/\s+/).filter(Boolean)

    list = list.filter((v) => {
      const searchableText = [
        v.shop_name || '',
        v.business_name || '',
        v.description || '',
        v.location_label || '',
        v.campus || '',
        ...(v.categories_offered || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return tokens.every((tok) => searchableText.includes(tok))
    })
  }

  if (options?.campus && options.campus !== 'all') {
    const targetCampus = options.campus.toLowerCase()
    list = list.filter((v) => {
      const c = (v.campus || 'Okerenkoko').toLowerCase()
      return c === 'both' || c === targetCampus
    })
  }

  if (options?.category && options.category !== 'all') {
    list = list.filter((v) => v.categories_offered?.includes(options.category!))
  }

  if (options?.featuredOnly) {
    list = list.filter((v) => Boolean(v.is_featured) && v.verification_status === 'verified')
  }

  // Guarantee paid featured and verified vendors strictly rank first, followed by unverified stores
  list.sort((a, b) => {
    if (Boolean(b.is_featured) !== Boolean(a.is_featured)) {
      return b.is_featured ? 1 : -1
    }
    if (a.verification_status === 'verified' && b.verification_status !== 'verified') {
      return -1
    }
    if (b.verification_status === 'verified' && a.verification_status !== 'verified') {
      return 1
    }
    return a.shop_name.localeCompare(b.shop_name)
  })

  return list.map(sanitizePublicVendor)
}

function isUuidString(val: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
}

export async function getPublicVendorBySlugOrId(slugOrId: string): Promise<{
  vendor: Vendor | null
  products: Product[]
}> {
  try {
    const supabase = await createClient()
    let vQuery = supabase.from('vendors').select('*').eq('is_demo', false)
    // Strip leading '@' for username lookups (e.g. '@gripstore' → 'gripstore')
    const cleanParam = slugOrId.startsWith('@') ? slugOrId.slice(1) : slugOrId
    if (isUuidString(slugOrId)) {
      vQuery = vQuery.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    } else {
      // Try username first (case-insensitive), then fall back to slug for backward compat
      vQuery = vQuery.or(`username.ilike.${cleanParam},slug.eq.${cleanParam}`)
    }
    const { data: vendorData } = await vQuery.maybeSingle()

    if (vendorData) {
      const v = vendorData as Vendor
      const sanitized = sanitizePublicVendor(v)

      // Only rejected vendors are hidden; unverified ('pending') vendors are live without a tick
      if (v.verification_status === 'rejected') {
        return { vendor: null, products: [] }
      }

      // If vendor is banned/suspended, return the vendor profile (so user sees BANNED notice) but hide all their items
      if (v.verification_status === 'suspended') {
        return { vendor: sanitized, products: [] }
      }

      const { data: prodData } = await supabase
        .from('products')
        .select('*, category:categories(*), vendor:vendors(*)')
        .eq('vendor_id', v.id)
        .eq('status', 'approved')
        .eq('is_demo', false)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      const products = ((prodData as Product[]) || []).map((p) => ({
        ...p,
        campus: getItemCampus(p),
        vendor: sanitized,
      }))
      return {
        vendor: { ...sanitized, products_count: products.length },
        products,
      }
    }
  } catch {
    // Return null if offline
  }

  return { vendor: null, products: [] }
}

export interface ProductQueryFilters {
  q?: string
  category?: string
  campus?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  availability?: 'available_only' | 'all'
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'relevance'
  limit?: number
  page?: number
  includeHousing?: boolean
  includeServices?: boolean
}

function matchesSearchQuery(p: Product, rawQuery: string): boolean {
  const needle = rawQuery.trim().toLowerCase()
  if (!needle) return true

  const expandedTerms = [needle]
  if (needle.includes('coverall') || needle.includes('overall') || needle.includes('rig')) {
    expandedTerms.push('action rig', 'uniform')
  }
  if (needle.includes('shoe') || needle.includes('boot')) {
    expandedTerms.push('safety boots', 'footwear', 'oxford')
  }
  if (needle.includes('power') || needle.includes('charge') || needle.includes('battery')) {
    expandedTerms.push('power bank', 'fast charge', 'mi')
  }
  if (needle.includes('fan')) {
    expandedTerms.push('table fan', 'rechargeable')
  }
  if (needle.includes('calc')) {
    expandedTerms.push('calculator', 'casio', 'fx-991es')
  }
  if (needle.includes('room') || needle.includes('lodge') || needle.includes('hostel') || needle.includes('self')) {
    expandedTerms.push('self-contain', 'bedspace', 'shared room', 'private room')
  }

  const searchableText = [
    p.title,
    p.description,
    p.category?.name,
    p.category?.short_name,
    p.category?.slug,
    p.vendor?.shop_name,
    p.vendor?.location_label,
    p.vendor?.pickup_options,
    ...(p.variants?.sizes || []),
    ...(p.variants?.colors || []),
    p.variants?.custom_label || '',
    p.variants?.room_type_label || '',
    p.variants?.location_label || '',
    p.variants?.distance_hint || '',
    ...(p.variants?.features || []),
    ...(p.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return expandedTerms.some((term) => {
    if (searchableText.includes(term)) return true
    const tokens = term.split(/\s+/).filter(Boolean)
    return tokens.length > 1 && tokens.every((tok) => searchableText.includes(tok))
  })
}

export function getItemCampus(p: Partial<Product>): 'Okerenkoko' | 'Kurutie' | 'Both' {
  const variantCampus = (p.variants as any)?.campus
  const candidate = p.campus || variantCampus || p.vendor?.campus
  if (candidate === 'Kurutie' || candidate === 'Okerenkoko' || candidate === 'Both') {
    return candidate
  }
  if (p.tags && p.tags.some((t) => t.toLowerCase() === 'kurutie')) {
    return 'Kurutie'
  }
  if (p.vendor?.slug && p.vendor.slug.includes('kurutie')) {
    return 'Kurutie'
  }
  return 'Okerenkoko'
}

export async function getPublicProducts(filters: ProductQueryFilters = {}): Promise<{
  products: Product[]
  totalCount: number
}> {
  const {
    q = '',
    category = '',
    campus = '',
    minPrice,
    maxPrice,
    condition = '',
    availability = 'available_only',
    sort = 'newest',
    limit = 24,
    page = 1,
    includeHousing = false,
    includeServices = false,
  } = filters

  let productsList: Product[] = []

  try {
    const supabase = await createClient()
    let query = supabase
      .from('products')
      .select('*, category:categories(*), vendor:vendors(*)', { count: 'exact' })
      .eq('status', 'approved')
      .eq('is_demo', false)

    if (!includeHousing) {
      query = query.neq('listing_type', 'housing')
    }
    if (!includeServices) {
      query = query.neq('listing_type', 'service')
    }

    if (availability === 'available_only') {
      query = query.in('stock_status', ['available', 'low_stock'])
    }

    if (condition && condition !== 'all') {
      query = query.eq('condition', condition)
    }

    if (typeof minPrice === 'number' && !Number.isNaN(minPrice)) {
      query = query.gte('price', minPrice)
    }
    if (typeof maxPrice === 'number' && !Number.isNaN(maxPrice)) {
      query = query.lte('price', maxPrice)
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true })
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false })
    } else {
      query = query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (!error && data) {
      // Serve all admin-approved items from any active (non-rejected, non-suspended) vendor
      productsList = (data as Product[])
        .filter(
          (item) =>
            item.status === 'approved' &&
            !item.is_demo &&
            item.vendor &&
            item.vendor.verification_status !== 'rejected' &&
            item.vendor.verification_status !== 'suspended' &&
            (includeHousing || item.listing_type !== 'housing') &&
            (includeServices || item.listing_type !== 'service')
        )
        .map((item) => ({
          ...item,
          campus: getItemCampus(item),
          vendor: item.vendor ? sanitizePublicVendor(item.vendor) : undefined,
        }))

      if (q.trim()) {
        productsList = productsList.filter((p) => matchesSearchQuery(p, q))
      }
    }
  } catch {
    // Return empty list if offline
  }

  if (category && category !== 'all') {
    productsList = productsList.filter(
      (p) => p.category?.slug === category || p.category_id === category
    )
  }

  if (campus && campus !== 'all') {
    const campusTarget = campus.toLowerCase()
    productsList = productsList.filter((p) => {
      const itemCampus = getItemCampus(p).toLowerCase()
      return itemCampus === 'both' || itemCampus === campusTarget
    })
  }

  if (sort === 'price_asc') {
    productsList.sort((a, b) => a.price - b.price)
  } else if (sort === 'price_desc') {
    productsList.sort((a, b) => b.price - a.price)
  } else {
    productsList.sort((a, b) => {
      const aFeatured = Boolean(a.is_featured || a.vendor?.is_featured)
      const bFeatured = Boolean(b.is_featured || b.vendor?.is_featured)
      if (bFeatured !== aFeatured) {
        return bFeatured ? 1 : -1
      }
      const aVerified = a.vendor?.verification_status === 'verified'
      const bVerified = b.vendor?.verification_status === 'verified'
      if (bVerified !== aVerified) {
        return bVerified ? 1 : -1
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  const totalCount = productsList.length
  const start = (Math.max(1, page) - 1) * limit
  const paginated = productsList.slice(start, start + limit)

  return {
    products: paginated,
    totalCount,
  }
}

export async function getPublicProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  try {
    const adminDb = await createAdminClient()
    let pQuery = adminDb
      .from('products')
      .select('*, category:categories(*), vendor:vendors(*)')
      .eq('is_demo', false)
    if (isUuidString(slugOrId)) {
      pQuery = pQuery.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    } else {
      pQuery = pQuery.eq('slug', slugOrId)
    }
    const { data, error } = await pQuery.maybeSingle()

    if (!error && data) {
      const p = data as Product
      if (!p.vendor) return null

      if (p.status !== 'approved') {
        // Allow admin or the vendor who owns this listing to preview it while pending
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const isOwner = Boolean(user && p.vendor.user_id === user.id)
        const isAdmin = Boolean(user && isAdminEmail(user.email))
        if (!isOwner && !isAdmin) {
          return null
        }
      } else if (
        p.vendor.verification_status === 'rejected' ||
        p.vendor.verification_status === 'suspended'
      ) {
        return null
      }

      return {
        ...p,
        campus: getItemCampus(p),
        vendor: p.vendor ? sanitizePublicVendor(p.vendor) : undefined,
      }
    }
  } catch {
    // Return null if offline
  }

  return null
}

/**
 * Fetches admin-approved Student Rooms / Lodges (`listing_type = 'housing'`) from Supabase
 */
export async function getPublicLodges(options?: {
  campus?: string
  q?: string
}): Promise<LodgeListing[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), vendor:vendors(*)')
      .eq('status', 'approved')
      .eq('listing_type', 'housing')
      .eq('is_demo', false)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      let approvedProducts = (data as Product[]).filter(
        (item) =>
          item.status === 'approved' &&
          !item.is_demo &&
          item.vendor &&
          item.vendor.verification_status !== 'rejected' &&
          item.vendor.verification_status !== 'suspended'
      )

      // Push featured listings & verified/featured vendors to the top
      approvedProducts.sort((a, b) => {
        const aFeat = Boolean(a.is_featured || a.vendor?.is_featured)
        const bFeat = Boolean(b.is_featured || b.vendor?.is_featured)
        if (bFeat !== aFeat) return bFeat ? 1 : -1
        const aVer = a.vendor?.verification_status === 'verified'
        const bVer = b.vendor?.verification_status === 'verified'
        if (bVer !== aVer) return bVer ? 1 : -1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      if (options?.q?.trim()) {
        approvedProducts = approvedProducts.filter((p) => matchesSearchQuery(p, options.q!))
      }

      // Compute agent_listings_count per vendor
      const countsByVendor: Record<string, number> = {}
      approvedProducts.forEach((p) => {
        countsByVendor[p.vendor_id] = (countsByVendor[p.vendor_id] || 0) + 1
      })

      let lodges = approvedProducts.map((p) => {
        const mapped = mapProductToLodgeListing({
          ...p,
          campus: getItemCampus(p),
          vendor: p.vendor ? sanitizePublicVendor(p.vendor) : undefined,
        })
        mapped.agent_listings_count = countsByVendor[p.vendor_id] || 1
        return mapped
      })

      if (options?.campus && options.campus !== 'all') {
        const target = options.campus.toLowerCase()
        lodges = lodges.filter(
          (l) => l.campus === 'Both' || l.campus.toLowerCase() === target
        )
      }

      return lodges
    }
  } catch {
    // Return empty list if offline
  }
  return []
}

export async function getPublicLodgeById(idOrSlug: string): Promise<{
  lodge: LodgeListing | null
  otherLodges: LodgeListing[]
}> {
  const allLodges = await getPublicLodges()
  let found = allLodges.find((l) => l.id === idOrSlug || l.slug === idOrSlug) || null

  // If not found in public approved lodges, check if admin/owner is previewing a pending room
  if (!found) {
    const pendingProduct = await getPublicProductBySlugOrId(idOrSlug)
    if (pendingProduct && pendingProduct.listing_type === 'housing') {
      found = mapProductToLodgeListing(pendingProduct)
    }
  }

  const otherLodges = found ? allLodges.filter((l) => l.id !== found.id).slice(0, 4) : []
  return { lodge: found, otherLodges }
}

/**
 * Populates SERVICES_LIST dynamically from admin-approved service/food listings in Supabase
 */
export async function getPublicServices(campus?: string): Promise<ServiceItem[]> {
  const baseServices: ServiceItem[] = SERVICES_LIST.map((s) => ({
    ...s,
    providers: [],
  }))

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), vendor:vendors(*)')
      .eq('status', 'approved')
      .in('listing_type', ['service', 'food'])
      .eq('is_demo', false)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      const approved = (data as Product[])
        .filter(
          (item) =>
            item.status === 'approved' &&
            !item.is_demo &&
            item.vendor &&
            item.vendor.verification_status !== 'rejected' &&
            item.vendor.verification_status !== 'suspended'
        )
        .sort((a, b) => {
          const aFeat = Boolean(a.is_featured || a.vendor?.is_featured)
          const bFeat = Boolean(b.is_featured || b.vendor?.is_featured)
          if (bFeat !== aFeat) return bFeat ? 1 : -1
          const aVer = a.vendor?.verification_status === 'verified'
          const bVer = b.vendor?.verification_status === 'verified'
          if (bVer !== aVer) return bVer ? 1 : -1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

      for (const item of approved) {
        const serviceSlug = inferServiceSlugFromProduct(item)
        const targetService = baseServices.find((s) => s.slug === serviceSlug)
        if (!targetService || !item.vendor) continue

        const vendor = sanitizePublicVendor(item.vendor)
        const initials = vendor.shop_name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() || '')
          .join('') || 'SV'

        const rawCampus = item.campus || vendor.campus || 'Okerenkoko'
        const providerCampus: 'Okerenkoko' | 'Kurutie' | 'Both campuses' =
          rawCampus === 'Both' ? 'Both campuses' : rawCampus

        // Avoid duplicate provider entry for same vendor within the same service category
        const existingIdx = targetService.providers.findIndex(
          (pr) => pr.vendorSlug === (vendor.slug || vendor.id)
        )
        const providerEntry: ServiceProvider = {
          id: item.id,
          name: vendor.shop_name,
          initials,
          campus: providerCampus,
          priceFrom: `₦${Number(item.price || 0).toLocaleString('en-NG')}`,
          whatsapp: vendor.whatsapp_number,
          verified: vendor.verification_status === 'verified',
          logo_url: vendor.logo_url || null,
          vendorSlug: vendor.slug || vendor.id,
          productSlug: item.slug,
          landmark: item.service_area || vendor.location_label,
          turnaround: item.service_turnaround || item.food_lead_time || undefined,
          bio: item.description,
        }

        if (existingIdx === -1) {
          targetService.providers.push(providerEntry)
        }
      }
    }
  } catch {
    // Return base services with 0 providers if offline
  }

  if (campus && campus !== 'all') {
    const target = campus.toLowerCase()
    return baseServices.map((s) => ({
      ...s,
      providers: s.providers.filter(
        (p) => p.campus === 'Both campuses' || p.campus.toLowerCase() === target
      ),
    }))
  }

  return baseServices
}

export async function getPublicServiceBySlug(
  slug: string,
  campus?: string
): Promise<ServiceItem | undefined> {
  const normalized = normalizeServiceSlug(slug)
  const services = await getPublicServices(campus)
  return services.find(
    (s) => s.slug.toLowerCase() === normalized || s.id.toLowerCase() === normalized
  )
}

export const getCurrentUserContext = cache(async function getCurrentUserContext(): Promise<{
  user: { id: string; email?: string; full_name?: string; avatar_url?: string } | null
  profile: UserProfile | null
  vendor: Vendor | null
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { user: null, profile: null, vendor: null }
    }

    const adminByEmail = isAdminEmail(user.email)
    const googleName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Jetty Seller'
    const googleAvatar =
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null

    const adminDb = await createAdminClient()
    const [{ data: profileData }, { data: vendorRows }] = await Promise.all([
      adminDb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      adminDb
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1),
    ])
    const vendorData = vendorRows?.[0] || null

    // Auto-promote efobifrancis53@gmail.com to admin in DB if not yet set
    if (adminByEmail && (!profileData || profileData.role !== 'admin')) {
      try {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            full_name: profileData?.full_name || googleName,
            email: user.email,
            avatar_url: profileData?.avatar_url || googleAvatar,
            role: 'admin',
            active_mode: 'vendor',
          },
          { onConflict: 'id' }
        )
      } catch {
        // Ignore if RLS or network issue
      }
    }

    const resolvedRole: UserProfile['role'] = adminByEmail
      ? 'admin'
      : profileData?.role === 'admin'
      ? 'admin'
      : 'vendor'

    const profile: UserProfile = profileData
      ? {
          id: profileData.id,
          full_name: profileData.full_name || googleName,
          email: profileData.email || user.email,
          avatar_url: profileData.avatar_url || googleAvatar,
          role: resolvedRole,
          active_mode: 'vendor',
          created_at: profileData.created_at || new Date().toISOString(),
        }
      : {
          id: user.id,
          full_name: googleName,
          email: user.email,
          avatar_url: googleAvatar,
          role: resolvedRole,
          active_mode: 'vendor',
          created_at: new Date().toISOString(),
        }

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: googleName,
        avatar_url: googleAvatar,
      },
      profile,
      vendor: (vendorData as Vendor) || null,
    }
  } catch {
    return { user: null, profile: null, vendor: null }
  }
})

export async function getCategoryRequests(): Promise<CategoryRequest[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('category_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      return data as CategoryRequest[]
    }
  } catch {
    // fallback
  }
  return []
}

export async function submitCategoryRequest(payload: {
  vendor_id?: string | null
  vendor_name?: string | null
  vendor_whatsapp?: string | null
  name: string
  description?: string | null
  suggested_icon?: string | null
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('category_requests')
      .insert({
        ...payload,
        status: 'pending',
      })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to submit' }
  }
}
