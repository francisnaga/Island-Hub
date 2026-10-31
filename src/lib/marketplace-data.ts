import { Category, Product, Vendor } from './types'

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: '19754212-f183-4880-9d72-308183295186',
    name: 'Uniforms & Cadet Kits',
    short_name: 'Uniforms & Kits',
    slug: 'maritime-cadet-gear',
    description:
      'Regulation action rigs, ceremonial parade uniforms, steel-toe boots, parade shoes, berets with gold anchor badge, officer belts, socks, and NMU customized tracksuits & PT kits.',
    icon: 'Shield',
    display_order: 1,
    is_priority: true,
    is_active: true,
  },
  {
    id: 'de8e250b-0819-4d5a-825a-6dda6a4cc95b',
    name: 'Electronics & Power',
    short_name: 'Electronics',
    slug: 'electronics-gadgets',
    description:
      'Rechargeable hostel table fans, high-capacity power banks, surge extension sockets, fast chargers, and study lamps.',
    icon: 'Zap',
    display_order: 2,
    is_priority: false,
    is_active: true,
  },
  {
    id: '42017700-fdf1-4b12-b905-7f6ff1235c9f',
    name: 'Study & Engineering Tools',
    short_name: 'Study Tools',
    slug: 'books-stationery',
    description:
      'Casio scientific calculators, A2 drawing boards, T-squares, technical drawing sets, and maritime engineering textbooks.',
    icon: 'BookOpen',
    display_order: 3,
    is_priority: false,
    is_active: true,
  },
  {
    id: '5626a221-d141-43ab-a300-bb82199bf861',
    name: 'Hostel & Room Living',
    short_name: 'Hostel Living',
    slug: 'hostel-daily-essentials',
    description:
      'Hostel bedsheets, heavy-duty security padlocks, plastic storage boxes, mosquito nets, water buckets, and room supplies.',
    icon: 'Home',
    display_order: 4,
    is_priority: false,
    is_active: true,
  },
  {
    id: '4c044a26-5202-4603-ab50-9edaa00250e6',
    name: 'Meals, Drinks & Treats',
    short_name: 'Meals & Treats',
    slug: 'food-beauty-other',
    description:
      'Fresh fruit salad bowls, freshly prepared campus meals, pastries, smoothies, and cold bottled beverages.',
    icon: 'Coffee',
    display_order: 5,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'f29ca736-488c-4220-8724-879763541192',
    name: 'Civilian Wear & Fashion',
    short_name: 'Civilian Wear',
    slug: 'fashion-accessories',
    description:
      'Everyday civilian clothing, footwear, casual tees, bags, and non-uniform accessories.',
    icon: 'Shirt',
    display_order: 6,
    is_priority: false,
    is_active: true,
  },
]

// Coordinates for Nigeria Maritime University (NMU), Okerenkoko, Warri South West LGA, Delta State
export const NMU_DEFAULT_COORDS = {
  latitude: 5.6278,
  longitude: 5.3915,
  label: 'NMU Permanent Site / Okerenkoko, Delta State',
}

// Production Clean State: No mock vendors or mock products. All listings come from approved database entries.
export const INITIAL_VENDORS: Vendor[] = []

export const INITIAL_PRODUCTS: Product[] = []

/**
 * Strips exact latitude/longitude when vendor privacy is not 'exact' or when location_type is 'delivery_only'
 * so private residential/hostel coordinates are never leaked to the public client.
 */
export function sanitizePublicVendor(vendor: Vendor): Vendor {
  const isBoth = vendor.campus === 'Both' || (vendor.campus as string) === 'both'
  const resolvedCampus: Vendor['campus'] = isBoth
    ? 'Both'
    : vendor.campus || 'Okerenkoko'

  return {
    ...vendor,
    campus: resolvedCampus,
    latitude:
      vendor.location_visibility !== 'exact' || vendor.location_type === 'delivery_only'
        ? null
        : vendor.latitude,
    longitude:
      vendor.location_visibility !== 'exact' || vendor.location_type === 'delivery_only'
        ? null
        : vendor.longitude,
  }
}
