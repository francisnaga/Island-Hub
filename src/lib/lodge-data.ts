import { Product } from './types'

export interface LodgeListing {
  id: string
  slug?: string
  title: string
  room_type: 'self_contain' | 'single_room' | 'bedspace'
  room_type_label: string
  campus: 'Okerenkoko' | 'Kurutie' | 'Both'
  price: number
  period: string
  location_label: string
  distance_hint: string
  image: string
  images?: string[]
  features: string[]
  whatsapp_number: string
  contact_name: string
  vendor_slug?: string
  is_verified: boolean
  bedspaces?: string
  rent_covers?: string
  utilities?: string
  other_fees?: string
  posted_time?: string
  description?: string
  agent_listings_count?: number
}

// Production Clean State: No mock lodges. All lodge listings are fetched from admin-approved database submissions.
export const LODGE_LISTINGS: LodgeListing[] = []

function formatRelativePostedTime(isoDate?: string): string {
  if (!isoDate) return 'Recently posted'
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)))
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return 'Recently posted'
}

export function mapProductToLodgeListing(p: Product): LodgeListing {
  const v = p.variants || {}
  const roomType = v.room_type || 'self_contain'
  const roomTypeLabel =
    v.room_type_label ||
    (roomType === 'self_contain'
      ? 'Self-contain'
      : roomType === 'bedspace'
      ? 'Bedspace'
      : 'Shared room')

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    room_type: roomType,
    room_type_label: roomTypeLabel,
    campus: p.campus || p.vendor?.campus || 'Okerenkoko',
    price: p.price,
    period: v.period || 'session',
    location_label: v.location_label || p.vendor?.location_label || `Near ${p.campus || 'NMU'} campus`,
    distance_hint: v.distance_hint || 'Walking distance to campus',
    image: p.images?.[0] || '',
    images: p.images || [],
    features:
      v.features && v.features.length > 0
        ? v.features
        : ['Water', 'Fenced compound', 'Tiled floor'],
    whatsapp_number: p.vendor?.whatsapp_number || '',
    contact_name: p.vendor?.shop_name || 'Verified Campus Caretaker',
    vendor_slug: p.vendor?.slug || p.vendor?.id,
    is_verified: p.vendor?.verification_status === 'verified',
    bedspaces: v.bedspaces || '1 to 2',
    rent_covers: v.rent_covers || `One ${v.period || 'session'}`,
    utilities: v.utilities || 'Water included',
    other_fees: v.other_fees || 'None',
    posted_time: formatRelativePostedTime(p.created_at),
    description: p.description,
    agent_listings_count: 1,
  }
}
