import { createClient } from '@/lib/supabase/server'
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

const CATEGORY_METADATA_OVERRIDES: Record<string, Partial<Category>> = {
  'maritime-cadet-gear': {
    name: 'Uniforms & Cadet Kits',
    short_name: 'Uniforms & Kits',
    description:
      'Regulation action rigs, ceremonial parade uniforms, steel-toe boots, parade shoes, berets with gold anchor badge, officer belts, socks, and NMU customized tracksuits & PT kits.',
    icon: 'Shield',
  },
  'electronics-gadgets': {
    name: 'Electronics & Power',
    short_name: 'Electronics',
    description:
      'Rechargeable hostel table fans, high-capacity power banks, surge extension sockets, fast chargers, and study lamps.',
    icon: 'Zap',
  },
  'books-stationery': {
    name: 'Study & Engineering Tools',
    short_name: 'Study Tools',
    description:
      'Casio scientific calculators, A2 drawing boards, T-squares, technical drawing sets, and maritime engineering textbooks.',
    icon: 'BookOpen',
  },
  'hostel-daily-essentials': {
    name: 'Hostel & Room Living',
    short_name: 'Hostel Living',
    description:
      'Hostel bedsheets, heavy-duty security padlocks, plastic storage boxes, mosquito nets, water buckets, and room supplies.',
    icon: 'Home',
  },
  'food-beauty-other': {
    name: 'Meals, Drinks & Treats',
    short_name: 'Meals & Treats',
    description:
      'Fresh fruit salad bowls, freshly prepared campus meals, pastries, smoothies, and cold bottled beverages.',
    icon: 'Coffee',
  },
  'fashion-accessories': {
    name: 'Civilian Wear & Fashion',
    short_name: 'Civilian Wear',
    description:
      'Everyday civilian clothing, footwear, casual tees, bags, and non-uniform accessories.',
    icon: 'Shirt',
  },
}

export async function getPublicCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (!error && data && data.length > 0) {
      return (data as Category[]).map((cat) => ({
        ...cat,
        ...(CATEGORY_METADATA_OVERRIDES[cat.slug] || {}),
      }))
    }
  } catch {
    // Fallback to initial categories taxonomy if DB is unreachable
  }
  return INITIAL_CATEGORIES
}

export async function getPublicVendors(options?: {
  query?: string
  verifiedOnly?: boolean
  campus?: string
  category?: string
  featuredOnly?: boolean
}): Promise<Vendor[]> {
  const hasSearchQuery = Boolean(options?.query?.trim())
  const verifiedOnly = options?.verifiedOnly !== false

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
      if (hasSearchQuery) {
        dbQuery = dbQuery.in('verification_status', ['verified', 'suspended'])
      } else {
        dbQuery = dbQuery.eq('verification_status', 'verified')
      }
    } else {
      // Never show unapproved/pending or rejected vendors publicly unless verified
      dbQuery = dbQuery.eq('verification_status', 'verified')
    }

    if (options?.featuredOnly) {
      dbQuery = dbQuery.eq('is_featured', true)
    }

    const { data, error } = await dbQuery
    if (!error && data) {
      list = data as Vendor[]
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
      return c === targetCampus
    })
  }

  if (options?.category && options.category !== 'all') {
    list = list.filter((v) => v.categories_offered?.includes(options.category!))
  }

  if (options?.featuredOnly) {
    list = list.filter((v) => Boolean(v.is_featured) && v.verification_status === 'verified')
  }

  // Guarantee paid featured and verified vendors strictly rank first
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
    if (isUuidString(slugOrId)) {
      vQuery = vQuery.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    } else {
      vQuery = vQuery.eq('slug', slugOrId)
    }
    const { data: vendorData } = await vQuery.maybeSingle()

    if (vendorData) {
      const v = vendorData as Vendor
      const sanitized = sanitizePublicVendor(v)

      // Unverified or rejected vendors do not appear publicly until admin approves them
      if (v.verification_status === 'pending' || v.verification_status === 'rejected') {
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

      const products = ((prodData as Product[]) || [])
        .filter((p) => p.images && p.images.length > 0 && !p.needs_seller_photo)
        .map((p) => ({
          ...p,
          vendor: sanitized,
        }))
      return { vendor: sanitized, products }
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

export function getItemCampus(p: Partial<Product>): 'Okerenkoko' | 'Kurutie' {
  if (p.campus === 'Kurutie' || p.campus === 'Okerenkoko') {
    return p.campus
  }
  if (p.tags && p.tags.some((t) => t.toLowerCase() === 'kurutie')) {
    return 'Kurutie'
  }
  if (p.vendor?.campus === 'Kurutie' || (p.vendor?.slug && p.vendor.slug.includes('kurutie'))) {
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
      // Strictly only serve approved items from verified, non-paused vendors
      productsList = (data as Product[])
        .filter(
          (item) =>
            item.status === 'approved' &&
            !item.is_demo &&
            item.images &&
            item.images.length > 0 &&
            !item.needs_seller_photo &&
            item.vendor &&
            item.vendor.verification_status === 'verified' &&
            !item.vendor.is_paused
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
      const itemCampus = (
        p.campus || (p.vendor?.campus === 'Kurutie' ? 'Kurutie' : 'Okerenkoko')
      ).toLowerCase()
      return itemCampus === campusTarget
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
    const supabase = await createClient()
    let pQuery = supabase
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
      // Strictly require admin approval on both listing and vendor before going live
      if (
        p.status !== 'approved' ||
        !p.vendor ||
        p.vendor.verification_status !== 'verified' ||
        p.vendor.is_paused
      ) {
        return null
      }
      return {
        ...p,
        campus: getItemCampus(p),
        category: p.category
          ? {
              ...p.category,
              ...(CATEGORY_METADATA_OVERRIDES[p.category.slug] || {}),
            }
          : undefined,
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
          item.images &&
          item.images.length > 0 &&
          item.vendor &&
          item.vendor.verification_status === 'verified' &&
          !item.vendor.is_paused
      )

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
  const found = allLodges.find((l) => l.id === idOrSlug || l.slug === idOrSlug) || null
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
      const approved = (data as Product[]).filter(
        (item) =>
          item.status === 'approved' &&
          !item.is_demo &&
          item.vendor &&
          item.vendor.verification_status === 'verified' &&
          !item.vendor.is_paused
      )

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

        const providerCampus = item.campus || vendor.campus || 'Okerenkoko'

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

export async function getCurrentUserContext(): Promise<{
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

    const [{ data: profileData }, { data: vendorData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('vendors').select('*').eq('user_id', user.id).maybeSingle(),
    ])

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
}

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
