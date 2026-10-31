import {
  Scissors,
  Wrench,
  Utensils,
  Shirt,
  Droplets,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'
import { Product } from './types'

export interface ServiceProvider {
  id: string
  name: string
  initials: string
  campus: 'Okerenkoko' | 'Kurutie' | 'Both campuses'
  priceFrom: string
  whatsapp: string
  verified: boolean
  vendorSlug?: string
  productSlug?: string
  landmark?: string
  turnaround?: string
  pricingGuide?: string
  specialties?: string[]
  bio?: string
}

export interface ServiceItem {
  id: string
  slug: string
  title: string
  shortTitle: string
  icon: LucideIcon
  tagline: string
  description: string
  startingPrice: string
  turnaround?: string
  popular?: boolean
  providers: ServiceProvider[]
}

// Production Clean State: Service taxonomy definitions with 0 mock providers.
// Real providers are dynamically populated from admin-approved service listings in Supabase.
export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'haircuts',
    slug: 'haircuts',
    title: 'Haircuts',
    shortTitle: 'Haircuts',
    icon: Scissors,
    tagline: 'Regulation cadet cuts, clean skin fades, line-ups & grooming.',
    description:
      'Regulation cadet haircuts, clean fades, beard line-ups, and grooming near campus hostels. View verified barbers and message directly on WhatsApp.',
    startingPrice: 'From ₦1,000',
    turnaround: 'Walk-in / 15 mins',
    popular: true,
    providers: [],
  },
  {
    id: 'laundry',
    slug: 'laundry',
    title: 'Laundry',
    shortTitle: 'Laundry',
    icon: Droplets,
    tagline: 'Heavy starching, white rig wash & parade inspection steam pressing.',
    description:
      'Heavy-duty washing, starching, and anti-wrinkle pressing for white action rigs and student everyday clothes. Inspection-ready crisp lines that hold through drill inspections.',
    startingPrice: 'From ₦1,200',
    turnaround: 'Same-day to 24 hrs',
    popular: true,
    providers: [],
  },
  {
    id: 'tailoring',
    slug: 'tailoring',
    title: 'Tailoring',
    shortTitle: 'Tailoring',
    icon: Shirt,
    tagline: 'Cadet action-rig resizing, trouser slimming, badges & cloth nameplates.',
    description:
      'Cadet action-rig resizing, trouser slimming, shoulder board reinforcement, rank badge attachment, and custom cloth nameplates. Inspected and approved for regulation NMU dress codes.',
    startingPrice: 'From ₦2,500',
    turnaround: '24–48 hours',
    popular: true,
    providers: [],
  },
  {
    id: 'meals',
    slug: 'meals',
    title: 'Meals',
    shortTitle: 'Meals',
    icon: Utensils,
    tagline: 'Home-cooked student meals, 2L soup coolers & fresh fruit salad bowls.',
    description:
      'Home-cooked hostel meal plans, 2L soup coolers, made-to-order fresh fruit bowls, and warm takeaway delivery directly to your room or hostel block.',
    startingPrice: 'From ₦1,800',
    turnaround: '20 mins – 1 hr',
    popular: true,
    providers: [],
  },
  {
    id: 'repairs',
    slug: 'repairs',
    title: 'Repairs',
    shortTitle: 'Repairs',
    icon: Wrench,
    tagline: 'Power bank cells, phone charging ports & scientific calculator diagnosis.',
    description:
      'Power bank cell diagnosis, smartphone charging port replacements, scientific calculator screen fixes, and laptop charger repairs on campus.',
    startingPrice: 'From ₦2,000',
    turnaround: 'Same-day – 24 hrs',
    providers: [],
  },
  {
    id: 'tutoring',
    slug: 'tutoring',
    title: 'Tutoring',
    shortTitle: 'Tutoring',
    icon: BookOpen,
    tagline: 'Maritime navigation, calculus & technical drawing peer guidance.',
    description:
      'Peer tutoring for first and second year engineering and maritime courses. Past questions, calculus, navigation, and technical drawing practice.',
    startingPrice: 'From ₦3,000',
    turnaround: 'Evenings & weekends',
    providers: [],
  },
]

export function getAllServices(): ServiceItem[] {
  return SERVICES_LIST
}

export function normalizeServiceSlug(slug: string): string {
  const normalized = slug.toLowerCase().trim()
  if (normalized === 'barbing' || normalized === 'haircut' || normalized === 'barber') {
    return 'haircuts'
  }
  if (normalized === 'cooking' || normalized === 'food' || normalized === 'catering') {
    return 'meals'
  }
  if (
    normalized === 'tech-repairs' ||
    normalized === 'repair' ||
    normalized === 'electronics-repairs'
  ) {
    return 'repairs'
  }
  return normalized
}

export function inferServiceSlugFromProduct(p: Product): string {
  if (p.variants?.service_slug) {
    return normalizeServiceSlug(p.variants.service_slug)
  }
  const text = `${p.title} ${p.description} ${p.category?.slug || ''}`.toLowerCase()
  if (text.includes('barber') || text.includes('haircut') || text.includes('fade') || text.includes('groom')) {
    return 'haircuts'
  }
  if (text.includes('laundry') || text.includes('wash') || text.includes('starch') || text.includes('iron')) {
    return 'laundry'
  }
  if (text.includes('tailor') || text.includes('stitch') || text.includes('sew') || text.includes('alteration') || text.includes('nameplate')) {
    return 'tailoring'
  }
  if (p.listing_type === 'food' || text.includes('meal') || text.includes('food') || text.includes('soup') || text.includes('bowl') || text.includes('cook')) {
    return 'meals'
  }
  if (text.includes('tutor') || text.includes('lesson') || text.includes('calculus') || text.includes('study')) {
    return 'tutoring'
  }
  return 'repairs'
}

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  const target = normalizeServiceSlug(slug)
  return SERVICES_LIST.find(
    (s) => s.slug.toLowerCase() === target || s.id.toLowerCase() === target
  )
}
