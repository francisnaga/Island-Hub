import {
  Scissors,
  Wrench,
  Zap,
  Utensils,
  Shirt,
  Droplets,
  BookOpen,
  Camera,
  Truck,
  Code,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import { BootIcon } from '@/components/brand/BootIcon'
import { HappyManIcon } from '@/components/brand/HappyManIcon'
import { Product } from './types'

export interface ServiceProvider {
  id: string
  name: string
  initials: string
  campus: 'Okerenkoko' | 'Kurutie' | 'Both campuses'
  priceFrom: string
  whatsapp: string
  verified: boolean
  logo_url?: string | null
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

// Production Clean State: Comprehensive campus service taxonomy with 0 mock providers.
// Real providers are dynamically populated from admin-approved service listings in Supabase.
export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'haircuts',
    slug: 'haircuts',
    title: 'Haircuts & Barbing',
    shortTitle: 'Haircuts',
    icon: Scissors,
    tagline: 'Regulation cadet cuts, clean skin fades, line-ups & grooming.',
    description:
      'Regulation cadet haircuts, clean fades, beard line-ups, and grooming near campus hostels. View barbers and message directly on WhatsApp.',
    startingPrice: 'From ₦1,000',
    turnaround: 'Walk-in / 20 mins',
    popular: true,
    providers: [],
  },
  {
    id: 'laundry',
    slug: 'laundry',
    title: 'Laundry & Dry Cleaning',
    shortTitle: 'Laundry',
    icon: Droplets,
    tagline: 'Heavy starching, white rig wash & parade inspection steam pressing.',
    description:
      'Heavy-duty washing, starching, and anti-wrinkle pressing for white action rigs and student everyday clothes.',
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
      'Cadet action-rig resizing, trouser slimming, shoulder board reinforcement, rank badge attachment, and custom cloth nameplates.',
    startingPrice: 'From ₦1,500',
    turnaround: '24–48 hours',
    popular: true,
    providers: [],
  },
  {
    id: 'meals',
    slug: 'meals',
    title: 'Cooked Meals & Catering',
    shortTitle: 'Meals',
    icon: Utensils,
    tagline: 'Home-cooked student meals, soup bowls, pastries & hostel food delivery.',
    description:
      'Home-cooked hostel meal plans, 2L soup coolers, made-to-order fresh fruit bowls, small chops, and warm takeaway delivery.',
    startingPrice: 'From ₦1,500',
    turnaround: '20 mins – 1 hr',
    popular: true,
    providers: [],
  },
  {
    id: 'repairs',
    slug: 'repairs',
    title: 'Phone & Gadget Repairs',
    shortTitle: 'Repairs',
    icon: Wrench,
    tagline: 'Phone screens, charging ports, power bank cells & laptop repairs.',
    description:
      'Power bank cell diagnosis, smartphone screen & charging port replacements, scientific calculator fixes, and laptop repairs on campus.',
    startingPrice: 'From ₦2,000',
    turnaround: 'Same-day – 24 hrs',
    popular: true,
    providers: [],
  },
  {
    id: 'electrical-repairs',
    slug: 'electrical-repairs',
    title: 'Electrical Installation & Repairs',
    shortTitle: 'Electrical & Wiring',
    icon: Zap,
    tagline: 'Hostel room wiring, socket & switch repairs, fan fixing, extension boards & power setups.',
    description:
      'Hostel room electrical wiring, socket and switch replacements, rechargeable fan repairs, extension cords, breaker fixes, and light fittings across Okerenkoko and Kurutie hostels.',
    startingPrice: 'From ₦1,000',
    turnaround: 'Same day / 1–2 hours',
    popular: true,
    providers: [],
  },
  {
    id: 'cobbler-boot-care',
    slug: 'cobbler-boot-care',
    title: 'Boot & Shoe Care',
    shortTitle: 'Boot & Shoe Care',
    icon: BootIcon as unknown as LucideIcon,
    tagline: 'Parade boot mirror-polishing, sole stitching, buckle & leather repair.',
    description:
      'Inspection-grade mirror shining for cadet parade shoes and safety boots, sole gum/stitching, belt punching, and bag zip repairs.',
    startingPrice: 'From ₦500',
    turnaround: 'Same day',
    popular: true,
    providers: [],
  },
  {
    id: 'photography',
    slug: 'photography',
    title: 'Photography & Videography',
    shortTitle: 'Photography',
    icon: Camera,
    tagline: 'Matriculation shoots, birthday portraits, passport photos & events.',
    description:
      'Professional student photographers for matriculation ceremonies, parade shoots, birthday portraits, ID passports, and content creation.',
    startingPrice: 'From ₦3,000',
    turnaround: '24–48 hours',
    providers: [],
  },
  {
    id: 'tutoring',
    slug: 'tutoring',
    title: 'Tutoring',
    shortTitle: 'Tutoring',
    icon: BookOpen,
    tagline: 'Maritime navigation, calculus, physics & engineering drawing tutorials.',
    description:
      'Peer tutoring for engineering, maritime, and science courses. Past question walkthroughs, calculus, navigation, and technical drawing.',
    startingPrice: 'From ₦2,000',
    turnaround: 'Evenings & weekends',
    providers: [],
  },
  {
    id: 'errands-delivery',
    slug: 'errands-delivery',
    title: 'Errands & Delivery',
    shortTitle: 'Errands & Delivery',
    icon: Truck,
    tagline: 'Market shopping runs, waybill pickup & campus parcel delivery.',
    description:
      'Trusted campus runners for market shopping, waybill collection at the jetty, and direct parcel delivery to Okerenkoko and Kurutie hostels.',
    startingPrice: 'From ₦1,500',
    turnaround: 'Scheduled boat runs',
    providers: [],
  },
  {
    id: 'graphic-design',
    slug: 'graphic-design',
    title: 'Graphic Design',
    shortTitle: 'Graphic Design',
    icon: Palette,
    tagline: 'Event flyers, department logos, student CV formatting & banners.',
    description:
      'Professional graphic design for campus events, department associations, brand logos, custom student CVs, and social media flyers.',
    startingPrice: 'From ₦1,500',
    turnaround: 'Same day – 24 hrs',
    popular: true,
    providers: [],
  },
  {
    id: 'web-app-development',
    slug: 'web-app-development',
    title: 'Web & App Development',
    shortTitle: 'Web & App',
    icon: Code,
    tagline: 'Custom websites, student portfolio apps, scripts & project coding.',
    description:
      'Custom websites, web applications, student project programming, portfolio sites, and software development for students and businesses.',
    startingPrice: 'From ₦5,000',
    turnaround: '1–7 days',
    popular: true,
    providers: [],
  },
  {
    id: 'happy-ending',
    slug: 'happy-ending',
    title: 'Happy Ending',
    shortTitle: 'Happy Ending',
    icon: HappyManIcon,
    tagline: 'Relaxation, massage, wellness & personal care sessions near campus.',
    description:
      'Private relaxation, body massage, stress relief, and personal wellness sessions across Okerenkoko and Kurutie. Message directly on WhatsApp to book.',
    startingPrice: 'By arrangement',
    turnaround: 'By appointment',
    popular: true,
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
    normalized === 'electrical' ||
    normalized === 'electrician' ||
    normalized === 'electrical-repairs' ||
    normalized === 'electrical-installation' ||
    normalized === 'wiring'
  ) {
    return 'electrical-repairs'
  }
  if (
    normalized === 'tech-repairs' ||
    normalized === 'repair' ||
    normalized === 'electronics-repairs'
  ) {
    return 'repairs'
  }
  if (
    normalized === 'delivery' ||
    normalized === 'errands' ||
    normalized === 'warri-errands' ||
    normalized === 'warri-errands-jetty-delivery'
  ) {
    return 'errands-delivery'
  }
  if (normalized === 'cobbler' || normalized === 'shoe-repair' || normalized === 'boot-care') {
    return 'cobbler-boot-care'
  }
  if (normalized === 'happy' || normalized === 'massage' || normalized === 'wellness') {
    return 'happy-ending'
  }
  if (
    normalized === 'tech-design' ||
    normalized === 'graphics' ||
    normalized === 'graphic' ||
    normalized === 'design' ||
    normalized === 'graphic-design'
  ) {
    return 'graphic-design'
  }
  if (
    normalized === 'web' ||
    normalized === 'app' ||
    normalized === 'web-dev' ||
    normalized === 'app-dev' ||
    normalized === 'web-development' ||
    normalized === 'coding' ||
    normalized === 'programming' ||
    normalized === 'software' ||
    normalized === 'web-app-development'
  ) {
    return 'web-app-development'
  }
  return normalized
}

export function inferServiceSlugFromProduct(p: Product): string {
  const svcSlug =
    p.service_meta?.service_slug ||
    (p.variants as any)?.service_meta?.service_slug ||
    p.variants?.service_slug
  if (svcSlug) {
    return normalizeServiceSlug(svcSlug)
  }
  const text = `${p.title} ${p.description} ${p.category?.slug || ''}`.toLowerCase()
  if (
    text.includes('electric') ||
    text.includes('wiring') ||
    text.includes('socket') ||
    text.includes('breaker') ||
    text.includes('fan fix') ||
    text.includes('inverter')
  ) {
    return 'electrical-repairs'
  }
  if (text.includes('happy ending') || text.includes('massage') || text.includes('relaxation')) {
    return 'happy-ending'
  }
  if (text.includes('barber') || text.includes('haircut') || text.includes('fade') || text.includes('groom')) {
    return 'haircuts'
  }
  if (text.includes('laundry') || text.includes('wash') || text.includes('starch') || text.includes('iron')) {
    return 'laundry'
  }
  if (text.includes('tailor') || text.includes('stitch') || text.includes('sew') || text.includes('alteration') || text.includes('nameplate')) {
    return 'tailoring'
  }
  if (text.includes('photo') || text.includes('camera') || text.includes('shoot') || text.includes('video')) {
    return 'photography'
  }
  if (text.includes('errand') || text.includes('waybill') || text.includes('runner') || text.includes('jetty delivery') || text.includes('delivery')) {
    return 'errands-delivery'
  }
  if (text.includes('cobbler') || text.includes('polish') || text.includes('shine') || text.includes('sole') || text.includes('boot')) {
    return 'cobbler-boot-care'
  }
  if (
    text.includes('website') ||
    text.includes('web app') ||
    text.includes('web dev') ||
    text.includes('coding') ||
    text.includes('developer') ||
    text.includes('software')
  ) {
    return 'web-app-development'
  }
  if (
    text.includes('graphic') ||
    text.includes('flyer') ||
    text.includes('logo') ||
    text.includes('banner') ||
    text.includes('poster') ||
    text.includes('design')
  ) {
    return 'graphic-design'
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
