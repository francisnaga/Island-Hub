export type UserRole = 'buyer' | 'vendor' | 'admin'
export type ActiveMode = 'buyer' | 'vendor'

export type VendorVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended'
export type LocationType = 'shop' | 'pickup_point' | 'home_based' | 'delivery_only'
export type LocationVisibility = 'exact' | 'approximate' | 'hidden'

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair'
export type StockStatus = 'available' | 'low_stock' | 'out_of_stock'
export type ProductApprovalStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended'

export interface UserProfile {
  id: string
  full_name: string
  email?: string | null
  avatar_url?: string | null
  role: UserRole
  active_mode: ActiveMode
  created_at: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  short_name?: string
  description: string
  icon: string
  display_order: number
  is_priority: boolean
  is_active: boolean
}

export interface Vendor {
  id: string
  user_id: string
  shop_name: string
  slug: string
  description: string
  logo_url?: string | null
  whatsapp_number: string
  categories_offered: string[]
  pickup_options: string
  delivery_available: boolean
  delivery_coverage?: string | null
  verification_status: VendorVerificationStatus
  rejection_reason?: string | null
  is_student: boolean
  department_or_business_info?: string | null
  latitude?: number | null
  longitude?: number | null
  location_type: LocationType
  location_visibility: LocationVisibility
  location_label: string
  location_confirmed_at?: string | null
  created_at: string
  updated_at?: string
}

export interface ProductVariants {
  sizes?: string[]
  colors?: string[]
  custom_label?: string
}

export interface Product {
  id: string
  vendor_id: string
  category_id: string
  title: string
  slug: string
  description: string
  price: number
  condition: ProductCondition
  stock_status: StockStatus
  stock_quantity?: number | null
  images: string[]
  variants?: ProductVariants | null
  status: ProductApprovalStatus
  rejection_reason?: string | null
  last_confirmed_at: string
  created_at: string
  updated_at?: string
  // Joined relationships
  vendor?: Vendor
  category?: Category
}

export interface ReportRecord {
  id: string
  reporter_id?: string | null
  reporter_contact?: string | null
  target_type: 'product' | 'vendor'
  product_id?: string | null
  vendor_id?: string | null
  reason: string
  details: string
  status: 'open' | 'resolved' | 'dismissed'
  created_at: string
  resolved_at?: string | null
  resolved_by?: string | null
  product?: Partial<Product>
  vendor?: Partial<Vendor>
}

export interface ModerationLog {
  id: string
  admin_id: string
  action_type: string
  target_type: 'product' | 'vendor' | 'report' | 'category'
  target_id: string
  reason?: string | null
  created_at: string
}
