import { LocationType, LocationVisibility } from './types'

/**
 * Normalizes Nigerian and international phone numbers to digits-only international format
 * e.g., 08031234567 -> 2348031234567, +234 803 123 4567 -> 2348031234567
 */
export function normalizeWhatsAppNumber(rawPhone: string | undefined | null): string | null {
  if (!rawPhone) return null
  const stripped = rawPhone.replace(/[^\d+]/g, '')
  let digits = stripped.replace(/\D/g, '')

  if (digits.startsWith('0') && digits.length === 11) {
    digits = '234' + digits.slice(1)
  } else if (digits.length === 10 && /^[789]/.test(digits)) {
    digits = '234' + digits
  }

  // Valid international WhatsApp number should be between 10 and 15 digits
  if (digits.length < 10 || digits.length > 15) {
    return null
  }
  return digits
}

export function formatNaira(amount: number): string {
  return `₦${Number(amount || 0).toLocaleString('en-NG')}`
}

export interface WhatsAppProductInquiryParams {
  whatsappNumber: string
  productTitle: string
  price: number
  selectedSize?: string
  selectedColor?: string
  quantity?: number
  productUrl?: string
  askingLocation?: boolean
  requestLivePhoto?: boolean
}

export function buildProductWhatsAppUrl(params: WhatsAppProductInquiryParams): {
  valid: boolean
  url: string
  error?: string
} {
  const normalizedPhone = normalizeWhatsAppNumber(params.whatsappNumber)
  if (!normalizedPhone) {
    return {
      valid: false,
      url: '#',
      error: 'This vendor has not supplied a valid WhatsApp contact number yet.',
    }
  }

  const qty = params.quantity || 1
  const total = formatNaira(params.price * qty)

  const variantList: string[] = []
  if (params.selectedSize) variantList.push(`Size: ${params.selectedSize}`)
  if (params.selectedColor) variantList.push(`Colour: ${params.selectedColor}`)
  const variantStr = variantList.length > 0 ? ` (${variantList.join(', ')})` : ''

  const lines: string[] = [
    `Hi! I want to order from your Jetty store:`,
    `• ${params.productTitle}${variantStr}`,
    `• Qty: ${qty} · Total: ${total}`,
  ]

  if (params.productUrl) {
    lines.push(`• Link: ${params.productUrl}`)
  }

  if (params.askingLocation) {
    lines.push('\nIs it available? Please let me know your campus pickup landmark or delivery details.')
  } else if (params.requestLivePhoto) {
    lines.push('\nIs this in stock? Please share a quick photo and confirm pickup/delivery.')
  } else {
    lines.push('\nIs it currently available for pickup or delivery?')
  }

  const message = lines.join('\n')
  return {
    valid: true,
    url: `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`,
  }
}

export function buildVendorStoreWhatsAppUrl(params: {
  whatsappNumber: string
  shopName: string
  storeUrl?: string
}): { valid: boolean; url: string; error?: string } {
  const normalizedPhone = normalizeWhatsAppNumber(params.whatsappNumber)
  if (!normalizedPhone) {
    return {
      valid: false,
      url: '#',
      error: 'Vendor WhatsApp contact number is unavailable.',
    }
  }

  const lines = [
    `Hi ${params.shopName}, I found your storefront on Jetty.`,
    params.storeUrl ? `Store link: ${params.storeUrl}` : '',
    'I would like to make an enquiry about your products.',
  ].filter(Boolean)

  return {
    valid: true,
    url: `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(lines.join('\n'))}`,
  }
}

/**
 * Generates a free standard Google Maps directions URL using saved coordinates.
 * Never exposes coordinates if visibility is not 'exact' or if vendor is 'delivery_only'.
 */
export function buildGoogleMapsDirectionsUrl(params: {
  latitude?: number | null
  longitude?: number | null
  locationVisibility: LocationVisibility
  locationType: LocationType
  travelMode?: 'walking' | 'driving'
}): string | null {
  if (params.locationType === 'delivery_only') return null
  if (params.locationVisibility !== 'exact') return null
  if (
    typeof params.latitude !== 'number' ||
    typeof params.longitude !== 'number' ||
    Number.isNaN(params.latitude) ||
    Number.isNaN(params.longitude)
  ) {
    return null
  }

  const mode = params.travelMode || 'walking'
  return `https://www.google.com/maps/dir/?api=1&destination=${params.latitude},${params.longitude}&travelmode=${mode}`
}

/**
 * Checks whether a vendor pin lies within the greater NMU / Okerenkoko / Warri / Delta State region
 * (Approx bounding box: Lat 4.8° to 6.5° N, Lng 5.0° to 6.8° E)
 */
export function isWithinSupportedServiceArea(lat: number, lng: number): boolean {
  return lat >= 4.8 && lat <= 6.5 && lng >= 5.0 && lng <= 6.8
}

/**
 * Stale listing helper: returns true if a listing has not had availability confirmed within `staleDays` (default 14 days).
 */
export function isListingStale(lastConfirmedAt: string | undefined | null, staleDays = 14): boolean {
  if (!lastConfirmedAt) return false
  const confirmedTime = new Date(lastConfirmedAt).getTime()
  if (Number.isNaN(confirmedTime)) return false
  const diffDays = (Date.now() - confirmedTime) / (1000 * 60 * 60 * 24)
  return diffDays > staleDays
}

export function daysSinceConfirmed(lastConfirmedAt: string | undefined | null): number {
  if (!lastConfirmedAt) return 0
  const confirmedTime = new Date(lastConfirmedAt).getTime()
  if (Number.isNaN(confirmedTime)) return 0
  return Math.max(0, Math.floor((Date.now() - confirmedTime) / (1000 * 60 * 60 * 24)))
}
