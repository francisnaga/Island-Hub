import { Category, Product, Vendor } from './types'

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: '19754212-f183-4880-9d72-308183295186',
    name: 'Cadet Gear & Uniforms',
    short_name: 'Cadet Gear',
    slug: 'maritime-cadet-gear',
    description:
      'Action rigs, safety boots, ceremonial uniforms, epaulettes, berets, parade shoes, belts, badges & PT kits.',
    icon: 'Shield',
    display_order: 1,
    is_priority: true,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d01',
    name: 'Phones, Earpieces & Chargers',
    short_name: 'Phones & Chargers',
    slug: 'phones-accessories',
    description:
      'Smartphones, iPhones, Androids, fast chargers, cables, AirPods, earpieces, cases & screen guards.',
    icon: 'Smartphone',
    display_order: 2,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'de8e250b-0819-4d5a-825a-6dda6a4cc95b',
    name: 'Laptops, Fans & Power Banks',
    short_name: 'Electronics',
    slug: 'electronics-gadgets',
    description:
      'Laptops, high-capacity power banks, rechargeable hostel fans, study lamps, extension sockets & speakers.',
    icon: 'Zap',
    display_order: 3,
    is_priority: false,
    is_active: true,
  },
  {
    id: '42017700-fdf1-4b12-b905-7f6ff1235c9f',
    name: 'Books, Calculators & Study Tools',
    short_name: 'Books & Study',
    slug: 'books-stationery',
    description:
      'Textbooks, handouts, past questions, Casio scientific calculators, A2 drawing boards, T-squares & stationery.',
    icon: 'BookOpen',
    display_order: 4,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d02',
    name: 'Shoes, Boots & Slides',
    short_name: 'Footwear',
    slug: 'footwear-slides',
    description:
      'Sneakers, slides, palms, sandals, crocs, corporate shoes, heels, canvas & socks.',
    icon: 'Footprints',
    display_order: 5,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'f29ca736-488c-4220-8724-879763541192',
    name: 'Clothing & Civilian Wear',
    short_name: 'Clothing',
    slug: 'fashion-accessories',
    description:
      'Everyday shirts, polos, jeans, trousers, hoodies, dresses, skirts, native wear, caps & jerseys.',
    icon: 'Shirt',
    display_order: 6,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d03',
    name: 'Bags, Watches & Eyewear',
    short_name: 'Bags & Watches',
    slug: 'bags-watches-jewellery',
    description:
      'Backpacks, laptop bags, tote bags, travel boxes, wristwatches, sunglasses, chains & jewellery.',
    icon: 'Briefcase',
    display_order: 7,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d04',
    name: 'Provisions, Snacks & Groceries',
    short_name: 'Provisions',
    slug: 'food-snacks-groceries',
    description:
      'Noodles, garri, oats, milk, cereal, biscuits, chin-chin, groundnuts, cooking oil & hostel provisions.',
    icon: 'ShoppingBag',
    display_order: 8,
    is_priority: false,
    is_active: true,
  },
  {
    id: '4c044a26-5202-4603-ab50-9edaa00250e6',
    name: 'Cooked Meals, Drinks & Pastries',
    short_name: 'Meals & Drinks',
    slug: 'food-beauty-other',
    description:
      'Fresh fruit bowls, cooked rice & swallow, shawarma, meat pies, small chops, smoothies & cold drinks.',
    icon: 'Coffee',
    display_order: 9,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d05',
    name: 'Skincare, Hair & Perfumes',
    short_name: 'Beauty & Hair',
    slug: 'beauty-personal-care',
    description:
      'Perfumes, body sprays, roll-ons, lotions, face care, wigs, hair attachments, clippers & grooming kits.',
    icon: 'Sparkles',
    display_order: 10,
    is_priority: false,
    is_active: true,
  },
  {
    id: '5626a221-d141-43ab-a300-bb82199bf861',
    name: 'Bedding, Buckets & Hostel Living',
    short_name: 'Hostel Essentials',
    slug: 'hostel-daily-essentials',
    description:
      'Mattresses, pillows, bedsheets, mosquito nets, buckets, storage boxes, padlocks, curtains & toiletries.',
    icon: 'Home',
    display_order: 11,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d06',
    name: 'Gas Cylinders, Hotplates & Pots',
    short_name: 'Kitchen & Cooking',
    slug: 'kitchen-appliances',
    description:
      'Camp gas cylinders, burners, electric kettles, hotplates, pots, frying pans, flasks, plates & cutlery.',
    icon: 'Utensils',
    display_order: 12,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d07',
    name: 'Jerseys, Gym & Games',
    short_name: 'Sports & Games',
    slug: 'sports-fitness-games',
    description:
      'Football boots, club jerseys, gym gear, dumbbells, skipping ropes, board games, consoles & instruments.',
    icon: 'Trophy',
    display_order: 13,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d08',
    name: 'First Aid, Glasses & Wellness',
    short_name: 'Health & Care',
    slug: 'health-medical',
    description:
      'First aid kits, blue-light glasses, mosquito repellents, hygiene supplies & personal wellness items.',
    icon: 'Heart',
    display_order: 14,
    is_priority: false,
    is_active: true,
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d09',
    name: 'Other Campus Items',
    short_name: 'Other',
    slug: 'other-campus-items',
    description:
      'General student items, event tickets, and anything else that does not fit another category.',
    icon: 'Package',
    display_order: 15,
    is_priority: false,
    is_active: true,
  },
]

export const SYSTEM_SERVICE_CATEGORY_ID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
export const SYSTEM_HOUSING_CATEGORY_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d10'

// Coordinates for Nigeria Maritime University (NMU), Okerenkoko, Warri South West LGA, Delta State
export const NMU_DEFAULT_COORDS = {
  latitude: 5.6278,
  longitude: 5.3915,
  label: 'NMU Permanent Site / Okerenkoko, Delta State',
}

// Production Clean State: No mock vendors or mock products. All listings come from approved database entries.
export const INITIAL_VENDORS: Vendor[] = []

export const INITIAL_PRODUCTS: Product[] = []

const LEGACY_DEFAULT_LOCATIONS = new Set([
  'NMU Okerenkoko Campus Area',
  'Near NMU Main Campus Gate, Okerenkoko',
])

const LEGACY_DEFAULT_COORDS = new Set([
  '5.580668,5.34693',
  '5.6278,5.3915',
])

/**
 * Preserves typed-out `location_label` for explanation purposes, and only exposes
 * `latitude` / `longitude` when the vendor explicitly pinned a GPS map location.
 */
export function sanitizePublicVendor(vendor: Vendor): Vendor {
  const isBoth = vendor.campus === 'Both' || (vendor.campus as string) === 'both'
  const resolvedCampus: Vendor['campus'] = isBoth
    ? 'Both'
    : vendor.campus || 'Okerenkoko'

  const rawLoc = (vendor.location_label || '').trim()
  const cleanLocationLabel = LEGACY_DEFAULT_LOCATIONS.has(rawLoc) ? '' : rawLoc

  const coordKey =
    vendor.latitude != null && vendor.longitude != null
      ? `${vendor.latitude},${vendor.longitude}`
      : ''
  const hasRealPinnedCoords =
    typeof vendor.latitude === 'number' &&
    typeof vendor.longitude === 'number' &&
    !LEGACY_DEFAULT_COORDS.has(coordKey) &&
    vendor.location_type !== 'delivery_only'

  return {
    ...vendor,
    campus: resolvedCampus,
    location_label: cleanLocationLabel,
    latitude: hasRealPinnedCoords ? vendor.latitude : null,
    longitude: hasRealPinnedCoords ? vendor.longitude : null,
  }
}
