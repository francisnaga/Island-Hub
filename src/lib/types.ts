export type UserRole = 'buyer' | 'vendor' | 'admin'
export type ActiveMode = 'buyer' | 'vendor'

export type VendorVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended'
export type SellerType = 'student' | 'independent' | 'business'
export type CampusArea = 'Okerenkoko' | 'Kurutie' | 'Both'
export type LocationType = 'shop' | 'pickup_point' | 'home_based' | 'delivery_only'
export type LocationVisibility = 'exact' | 'approximate' | 'hidden'

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair'
export type StockStatus = 'available' | 'low_stock' | 'out_of_stock'
export type ListingType = 'product' | 'food' | 'service'
export type ProductApprovalStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'archived'

export const ADMIN_EMAILS = ['efobifrancis53@gmail.com']

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

export interface UserProfile {
  id: string
  full_name: string
  email?: string | null
  avatar_url?: string | null
  role: UserRole
  active_mode: ActiveMode
  is_demo?: boolean
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

export interface CategoryRequest {
  id: string
  vendor_id?: string | null
  vendor_name?: string | null
  vendor_whatsapp?: string | null
  name: string
  description?: string | null
  suggested_icon?: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
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
  seller_type?: SellerType
  business_name?: string | null
  business_verified?: boolean
  campus?: CampusArea
  opening_hours?: string | null
  is_paused?: boolean
  pause_reason?: string | null
  is_featured?: boolean
  is_demo?: boolean
  whatsapp_clicks?: number
  store_views?: number
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
  tags?: string[]
  needs_seller_photo?: boolean
  status: ProductApprovalStatus
  rejection_reason?: string | null
  listing_type?: ListingType
  is_featured?: boolean
  is_demo?: boolean
  whatsapp_clicks?: number
  views_count?: number
  service_turnaround?: string | null
  service_area?: string | null
  food_lead_time?: string | null
  food_allergen_info?: string | null
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
