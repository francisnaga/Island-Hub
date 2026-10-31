import {
  Scissors,
  Wrench,
  Utensils,
  Shirt,
  Droplets,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'

export interface ServiceProvider {
  id: string
  name: string
  initials: string
  campus: 'Okerenkoko' | 'Kurutie' | 'Both campuses'
  priceFrom: string
  whatsapp: string
  verified: boolean
  vendorSlug?: string
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
    providers: [
      {
        id: 'barber-hub',
        name: 'Barber Hub',
        initials: 'BH',
        campus: 'Kurutie',
        priceFrom: '₦1,500',
        whatsapp: '2349020003344',
        verified: false,
        landmark: 'Kurutie Student Lodge Area',
        vendorSlug: 'kurutie-okerenkoko-essentials',
      },
      {
        id: 'fade-lab',
        name: 'Fade Lab',
        initials: 'FL',
        campus: 'Okerenkoko',
        priceFrom: '₦2,000',
        whatsapp: '2348030001122',
        verified: true,
        landmark: 'Near NMU Main Gate / Okerenkoko',
        vendorSlug: 'nmu-cadet-quartermaster',
      },
      {
        id: 'creek-cuts',
        name: 'Creek Cuts',
        initials: 'CC',
        campus: 'Both campuses',
        priceFrom: '₦1,000',
        whatsapp: '2348140002233',
        verified: false,
        landmark: 'Hostel B / Student Area',
        vendorSlug: 'okerenkoko-creek-tech',
      },
    ],
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
    providers: [
      {
        id: 'suds-and-co',
        name: 'Suds & Co Laundry',
        initials: 'SC',
        campus: 'Kurutie',
        priceFrom: '₦1,500',
        whatsapp: '2348080005566',
        verified: true,
        landmark: 'Near Kurutie Campus Gate & Hostel Road',
        vendorSlug: 'kurutie-okerenkoko-essentials',
      },
      {
        id: 'freshfold-laundry',
        name: 'FreshFold',
        initials: 'FF',
        campus: 'Okerenkoko',
        priceFrom: '₦1,200',
        whatsapp: '2348140002233',
        verified: true,
        landmark: 'Hostel Block B Pickup Annex, Okerenkoko',
        vendorSlug: 'okerenkoko-creek-tech',
      },
    ],
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
    providers: [
      {
        id: 'stitch-point',
        name: 'Stitch Point',
        initials: 'SP',
        campus: 'Kurutie',
        priceFrom: '₦2,500',
        whatsapp: '2349020003344',
        verified: true,
        landmark: 'Near Kurutie Campus Junction',
        vendorSlug: 'kurutie-okerenkoko-essentials',
      },
      {
        id: 'amaka-tailoring',
        name: 'Amaka Cadet Tailoring',
        initials: 'AF',
        campus: 'Okerenkoko',
        priceFrom: '₦3,000',
        whatsapp: '2348060004455',
        verified: true,
        landmark: 'Block C Walkway / Hostels Area',
        vendorSlug: 'amaka-fresh-bowls-tailoring',
      },
    ],
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
    providers: [
      {
        id: 'mama-put-kitchen',
        name: 'Mama Put Kitchen',
        initials: 'MP',
        campus: 'Both campuses',
        priceFrom: '₦1,800',
        whatsapp: '2348080005566',
        verified: true,
        landmark: 'Hostel Central Kitchen Pickup',
        vendorSlug: 'okerenkoko-creek-tech',
      },
      {
        id: 'amaka-fresh-bowls',
        name: 'Amaka Fresh Bowls',
        initials: 'AF',
        campus: 'Okerenkoko',
        priceFrom: '₦2,500',
        whatsapp: '2348060004455',
        verified: true,
        landmark: 'Block C Walkway / Hostels',
        vendorSlug: 'amaka-fresh-bowls-tailoring',
      },
    ],
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
    providers: [
      {
        id: 'creek-tech-repair',
        name: 'Okerenkoko Creek Tech',
        initials: 'OC',
        campus: 'Both campuses',
        priceFrom: '₦2,000',
        whatsapp: '2348140002233',
        verified: true,
        landmark: 'Hostel B Junction, NMU Okerenkoko',
        vendorSlug: 'okerenkoko-creek-tech',
      },
    ],
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
    providers: [
      {
        id: 'tutor-tide',
        name: 'Tutor Tide',
        initials: 'TT',
        campus: 'Both campuses',
        priceFrom: '₦3,000',
        whatsapp: '2348030001122',
        verified: false,
        landmark: 'Engineering Block Study Rooms',
        vendorSlug: 'nmu-cadet-quartermaster',
      },
    ],
  },
]

export function getAllServices(): ServiceItem[] {
  return SERVICES_LIST
}

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  const normalized = slug.toLowerCase().trim()

  // Handle aliases
  if (normalized === 'barbing' || normalized === 'haircut' || normalized === 'barber') {
    return SERVICES_LIST.find((s) => s.slug === 'haircuts')
  }
  if (normalized === 'cooking' || normalized === 'food' || normalized === 'catering') {
    return SERVICES_LIST.find((s) => s.slug === 'meals')
  }
  if (normalized === 'tech-repairs' || normalized === 'repair' || normalized === 'electronics-repairs') {
    return SERVICES_LIST.find((s) => s.slug === 'repairs')
  }

  return SERVICES_LIST.find(
    (s) => s.slug.toLowerCase() === normalized || s.id.toLowerCase() === normalized
  )
}
