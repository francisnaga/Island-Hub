import { createClient } from '@/lib/supabase/server'
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_VENDORS,
  sanitizePublicVendor,
} from './marketplace-data'
import { Category, Product, UserProfile, Vendor } from './types'

export async function getPublicCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (!error && data && data.length > 0) {
      return data as Category[]
    }
  } catch {
    // Fallback to initial categories if DB is unreachable or not yet migrated
  }
  return INITIAL_CATEGORIES
}

export async function getPublicVendors(options?: {
  query?: string
  verifiedOnly?: boolean
}): Promise<Vendor[]> {
  let list: Vendor[] = INITIAL_VENDORS
  try {
    const supabase = await createClient()
    let dbQuery = supabase
      .from('vendors')
      .select('*')
      .in('verification_status', ['verified', 'pending'])
      .order('created_at', { ascending: false })

    if (options?.verifiedOnly) {
      dbQuery = dbQuery.eq('verification_status', 'verified')
    }
    if (options?.query) {
      dbQuery = dbQuery.ilike('shop_name', `%${options.query}%`)
    }

    const { data, error } = await dbQuery
    if (!error && data && data.length > 0) {
      list = data as Vendor[]
    } else if (options?.query) {
      const q = options.query.toLowerCase()
      list = INITIAL_VENDORS.filter(
        (v) =>
          v.shop_name.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.location_label.toLowerCase().includes(q)
      )
    }
  } catch {
    if (options?.query) {
      const q = options.query.toLowerCase()
      list = INITIAL_VENDORS.filter(
        (v) =>
          v.shop_name.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.location_label.toLowerCase().includes(q)
      )
    }
  }

  return list.map(sanitizePublicVendor)
}

export async function getPublicVendorBySlugOrId(slugOrId: string): Promise<{
  vendor: Vendor | null
  products: Product[]
}> {
  try {
    const supabase = await createClient()
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('*')
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .neq('verification_status', 'suspended')
      .maybeSingle()

    if (vendorData) {
      const { data: prodData } = await supabase
        .from('products')
        .select('*, category:categories(*), vendor:vendors(*)')
        .eq('vendor_id', vendorData.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      const sanitized = sanitizePublicVendor(vendorData as Vendor)
      const products = ((prodData as Product[]) || []).map((p) => ({
        ...p,
        vendor: sanitized,
      }))
      return { vendor: sanitized, products }
    }
  } catch {
    // Fallback to initial vendors
  }

  const fallbackVendor = INITIAL_VENDORS.find(
    (v) => v.slug === slugOrId || v.id === slugOrId
  )
  if (!fallbackVendor) {
    return { vendor: null, products: [] }
  }
  const sanitized = sanitizePublicVendor(fallbackVendor)
  const products = INITIAL_PRODUCTS.filter((p) => p.vendor_id === fallbackVendor.id).map(
    (p) => ({
      ...p,
      vendor: sanitized,
    })
  )
  return { vendor: sanitized, products }
}

export interface ProductQueryFilters {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  availability?: 'available_only' | 'all'
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'relevance'
  limit?: number
  page?: number
}

export async function getPublicProducts(filters: ProductQueryFilters = {}): Promise<{
  products: Product[]
  totalCount: number
}> {
  const {
    q = '',
    category = '',
    minPrice,
    maxPrice,
    condition = '',
    availability = 'available_only',
    sort = 'newest',
    limit = 24,
    page = 1,
  } = filters

  let productsList: Product[] = []
  let usedDatabase = false

  try {
    const supabase = await createClient()
    let query = supabase
      .from('products')
      .select('*, category:categories(*), vendor:vendors(*)', { count: 'exact' })
      .eq('status', 'approved')

    if (availability === 'available_only') {
      query = query.in('stock_status', ['available', 'low_stock'])
    }

    if (q.trim()) {
      query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`)
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
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (!error && data && data.length > 0) {
      usedDatabase = true
      productsList = (data as Product[]).map((item) => ({
        ...item,
        vendor: item.vendor ? sanitizePublicVendor(item.vendor) : undefined,
      }))
    }
  } catch {
    // Fallback to initial catalog
  }

  if (!usedDatabase) {
    productsList = INITIAL_PRODUCTS.map((item) => ({
      ...item,
      vendor: item.vendor ? sanitizePublicVendor(item.vendor) : undefined,
    }))

    // Apply in-memory filters for initial catalog
    if (availability === 'available_only') {
      productsList = productsList.filter((p) => p.stock_status !== 'out_of_stock')
    }

    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      productsList = productsList.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle) ||
          p.category?.name.toLowerCase().includes(needle) ||
          p.vendor?.shop_name.toLowerCase().includes(needle)
      )
    }

    if (condition && condition !== 'all') {
      productsList = productsList.filter((p) => p.condition === condition)
    }

    if (typeof minPrice === 'number' && !Number.isNaN(minPrice)) {
      productsList = productsList.filter((p) => p.price >= minPrice)
    }
    if (typeof maxPrice === 'number' && !Number.isNaN(maxPrice)) {
      productsList = productsList.filter((p) => p.price <= maxPrice)
    }
  }

  // Filter by category slug or id if provided
  if (category && category !== 'all') {
    productsList = productsList.filter(
      (p) => p.category?.slug === category || p.category_id === category
    )
  }

  // Sort if needed
  if (sort === 'price_asc') {
    productsList.sort((a, b) => a.price - b.price)
  } else if (sort === 'price_desc') {
    productsList.sort((a, b) => b.price - a.price)
  } else {
    productsList.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
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
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), vendor:vendors(*)')
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .maybeSingle()

    if (!error && data) {
      const p = data as Product
      return {
        ...p,
        vendor: p.vendor ? sanitizePublicVendor(p.vendor) : undefined,
      }
    }
  } catch {
    // Fallback to initial catalog
  }

  const found = INITIAL_PRODUCTS.find((p) => p.slug === slugOrId || p.id === slugOrId)
  if (!found) return null
  return {
    ...found,
    vendor: found.vendor ? sanitizePublicVendor(found.vendor) : undefined,
  }
}

export async function getCurrentUserContext(): Promise<{
  user: { id: string; email?: string } | null
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

    const [{ data: profileData }, { data: vendorData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('vendors').select('*').eq('user_id', user.id).maybeSingle(),
    ])

    const profile: UserProfile = profileData
      ? {
          id: profileData.id,
          full_name:
            profileData.full_name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'NMU Member',
          email: profileData.email || user.email,
          avatar_url: profileData.avatar_url || user.user_metadata?.avatar_url,
          role:
            profileData.role === 'student'
              ? 'buyer'
              : (profileData.role as UserProfile['role']) || 'buyer',
          active_mode:
            (profileData.active_mode as UserProfile['active_mode']) ||
            (profileData.role === 'vendor' ? 'vendor' : 'buyer'),
          created_at: profileData.created_at || new Date().toISOString(),
        }
      : {
          id: user.id,
          full_name:
            user.user_metadata?.full_name || user.email?.split('@')[0] || 'NMU Member',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url,
          role: 'buyer',
          active_mode: 'buyer',
          created_at: new Date().toISOString(),
        }

    return {
      user: { id: user.id, email: user.email },
      profile,
      vendor: (vendorData as Vendor) || null,
    }
  } catch {
    return { user: null, profile: null, vendor: null }
  }
}
