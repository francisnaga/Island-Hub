import {
  Scissors,
  Wrench,
  Utensils,
  Camera,
  Shirt,
  Droplets,
  BookOpen,
  Printer,
  type LucideIcon,
} from 'lucide-react'

export interface ServiceProvider {
  id: string
  name: string
  initials: string
  campus: 'Okerenkoko' | 'Kurutie'
  landmark: string
  vendorSlug?: string
  whatsapp: string
  verified: boolean
  turnaround: string
  pricingGuide: string
  specialties: string[]
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
  turnaround: string
  popular?: boolean
  providers: ServiceProvider[]
}

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'tailoring',
    slug: 'tailoring',
    title: 'Uniform Tailoring & Alterations',
    shortTitle: 'Tailoring',
    icon: Shirt,
    tagline: 'Cadet action-rig resizing, trouser slimming, badges & cloth nameplates.',
    description:
      'Cadet action-rig resizing, trouser slimming, shoulder board reinforcement, rank badge attachment, and custom cloth nameplates. Inspected and approved for regulation NMU dress codes.',
    startingPrice: 'From ₦1,200',
    turnaround: '24–48 hours',
    popular: true,
    providers: [
      {
        id: 'amaka-tailoring',
        name: 'Amaka Stitches & Cadet Tailoring',
        initials: 'AS',
        campus: 'Okerenkoko',
        landmark: 'Block C Walkway / Hostel Area',
        vendorSlug: 'amaka-fresh-bowls-tailoring',
        whatsapp: '2348060004455',
        verified: true,
        turnaround: '24–48 hours',
        pricingGuide: 'Trouser hemming: ₦1,500 · Action rig slimming: ₦3,500 · Full fitting: ₦5,000',
        specialties: ['Action rig slimming', 'Rank badge attachment', 'Nameplates'],
        bio: 'Specialist in custom cadet fittings, regulation badges, and uniform repairs on Okerenkoko campus.',
      },
      {
        id: 'swift-stitch-kurutie',
        name: 'Swift Stitch Kurutie',
        initials: 'SS',
        campus: 'Kurutie',
        landmark: 'Near Kurutie Take-Off Campus Junction',
        vendorSlug: 'kurutie-okerenkoko-essentials',
        whatsapp: '2349020003344',
        verified: true,
        turnaround: 'Same-day express available',
        pricingGuide: 'Trouser hem: ₦1,200 · Zipper replacement: ₦1,000 · Badges: ₦800',
        specialties: ['Express same-day alterations', 'Pocket repairs', 'Cadet trousers'],
        bio: 'Fast-turnaround uniform alterations and stitching right near Kurutie campus gate.',
      },
      {
        id: 'quartermaster-fitting',
        name: 'NMU Quartermaster In-House Fitting',
        initials: 'QM',
        campus: 'Okerenkoko',
        landmark: 'Near NMU Main Gate / Parade Ground Annex',
        vendorSlug: 'nmu-cadet-quartermaster',
        whatsapp: '2348030001122',
        verified: true,
        turnaround: '24 hours',
        pricingGuide: 'Cap badge mounting: ₦1,000 · Shoulder loops: ₦1,500 · Rig resize: ₦4,000',
        specialties: ['Regulation NMU insignias', 'Epaulette mounting', 'Brass anchor polish'],
        bio: 'Official parade uniform adjustment and regalia mounting for maritime cadets.',
      },
    ],
  },
  {
    id: 'laundry',
    slug: 'laundry',
    title: 'Laundry & Uniform Pressing',
    shortTitle: 'Laundry',
    icon: Droplets,
    tagline: 'Heavy starching, white rig wash & parade inspection steam pressing.',
    description:
      'Heavy-duty washing, starching, and anti-wrinkle pressing for white action rigs and student everyday clothes. Inspection-ready crisp lines that hold through drill inspections.',
    startingPrice: 'From ₦400',
    turnaround: 'Same-day to 24 hrs',
    popular: true,
    providers: [
      {
        id: 'creekside-laundry',
        name: 'CreekSide Laundry & Uniform Care',
        initials: 'CL',
        campus: 'Kurutie',
        landmark: 'Near Kurutie Campus Gate & Hostel Road',
        vendorSlug: 'creekside-laundry-uniform-care',
        whatsapp: '2348080005566',
        verified: true,
        turnaround: '24 hours',
        pricingGuide: 'White rig wash + heavy starch: ₦800 · Normal hostel bag: ₦2,500',
        specialties: ['Cadet white rigs', 'Heavy starching', 'Parade inspection press'],
        bio: 'Cadet laundry specialist known for pristine white action rigs with crisp parade creases.',
      },
      {
        id: 'freshpress-okerenkoko',
        name: 'FreshPress Campus Laundry',
        initials: 'FP',
        campus: 'Okerenkoko',
        landmark: 'Hostel Block B Pickup Annex',
        vendorSlug: 'okerenkoko-creek-tech',
        whatsapp: '2348140002233',
        verified: true,
        turnaround: 'Same-day / 24 hrs',
        pricingGuide: 'Iron-only per rig: ₦400 · Full wash & iron: ₦800 · Bedding: ₦1,200',
        specialties: ['Inspection-ready steam press', 'Drop-off & hostel delivery'],
        bio: 'Rapid steam ironing and full wash bags with convenient hostel drop-off points.',
      },
    ],
  },
  {
    id: 'barbing',
    slug: 'barbing',
    title: 'Barbing & Grooming',
    shortTitle: 'Barbing',
    icon: Scissors,
    tagline: 'Regulation cadet cuts, clean skin fades, line-ups & hygienic clipper care.',
    description:
      'Regulation cadet haircuts, clean fades, beard line-ups, and hygienic clipper treatments near campus hostels. Zero queues on inspection mornings when you book ahead.',
    startingPrice: 'From ₦700',
    turnaround: 'Walk-in (15 mins)',
    popular: true,
    providers: [
      {
        id: 'kurutie-barber',
        name: 'Kurutie Campus Barber Lounge',
        initials: 'KB',
        campus: 'Kurutie',
        landmark: 'Kurutie Student Lodge Area (Near Gate)',
        vendorSlug: 'kurutie-okerenkoko-essentials',
        whatsapp: '2349020003344',
        verified: true,
        turnaround: 'Walk-in (15–20 mins)',
        pricingGuide: 'Cadet low cut: ₦1,000 · Shave & beard line: ₦700 · Head massage: ₦500',
        specialties: ['Regulation cadet haircut', 'Sterilized clippers', 'Beard trim'],
        bio: 'Trusted student barbershop offering clean low cuts and prompt walk-in grooming.',
      },
      {
        id: 'precision-cuts-oke',
        name: 'Precision Cuts Barbershop',
        initials: 'PC',
        campus: 'Okerenkoko',
        landmark: 'Okerenkoko Jetty Road, near Campus Gate',
        vendorSlug: 'nmu-cadet-quartermaster',
        whatsapp: '2348030001122',
        verified: true,
        turnaround: 'Walk-in',
        pricingGuide: 'Parade cut: ₦1,000 · Clean shave: ₦600 · Aftershave treatment: Free',
        specialties: ['Parade morning cuts', 'Quiet student lounge', 'Fast service'],
        bio: 'Sharp clipper cuts and clean shaves for cadets heading out to morning parade.',
      },
    ],
  },
  {
    id: 'cooking',
    slug: 'cooking',
    title: 'Campus Catering & Private Cooks',
    shortTitle: 'Catering & Meals',
    icon: Utensils,
    tagline: 'Hostel soup coolers (2L), chilled fruit salads & warm meal subscriptions.',
    description:
      'Hostel meal plans, 2L soup coolers, made-to-order fruit salad bowls, and warm takeaway delivery directly to your room or hostel block.',
    startingPrice: 'From ₦1,200',
    turnaround: '20 mins – 3 hrs',
    providers: [
      {
        id: 'amaka-fresh-kitchen',
        name: 'Amaka Fresh Bowls & Kitchen',
        initials: 'AF',
        campus: 'Okerenkoko',
        landmark: 'Block C Walkway / Hostels',
        vendorSlug: 'amaka-fresh-bowls-tailoring',
        whatsapp: '2348060004455',
        verified: true,
        turnaround: '20–30 mins lead time',
        pricingGuide: 'Fresh fruit salad 750ml: ₦2,500 · Warm student meals: From ₦1,200',
        specialties: ['Chilled fruit salads', 'Fried rice & chicken', 'Hostel delivery'],
        bio: 'Freshly diced fruit bowls and warm hostel dinners delivered straight to your block.',
      },
      {
        id: 'creek-hostel-chef',
        name: 'Mama Zee Hostel Pots & Soups',
        initials: 'MZ',
        campus: 'Kurutie',
        landmark: 'Kurutie Private Lodge Annex',
        vendorSlug: 'creekside-laundry-uniform-care',
        whatsapp: '2348080005566',
        verified: true,
        turnaround: 'Order 3–4 hrs ahead',
        pricingGuide: '2L Egusi/Ogbono soup cooler: From ₦4,500 · Jollof bowl: ₦1,500',
        specialties: ['Soup coolers for hostels', 'Weekly student meal subscription'],
        bio: 'Delicious 2-litre soup coolers and weekly meal plans so you never cook during exam week.',
      },
    ],
  },
  {
    id: 'tech-repairs',
    slug: 'tech-repairs',
    title: 'Gadget & Tech Repair',
    shortTitle: 'Tech Repair',
    icon: Wrench,
    tagline: 'Power bank cell diagnosis, phone charging ports & calculator diagnostics.',
    description:
      'Power bank cell diagnosis, smartphone charging port replacements, scientific calculator screen fixes, and laptop charging adapter repairs on campus.',
    startingPrice: 'From ₦1,000',
    turnaround: 'Same-day – 24 hrs',
    providers: [
      {
        id: 'okerenkoko-creek-tech-repair',
        name: 'Okerenkoko Creek Tech & Repair',
        initials: 'CT',
        campus: 'Okerenkoko',
        landmark: 'Hostel B Junction, NMU Okerenkoko',
        vendorSlug: 'okerenkoko-creek-tech',
        whatsapp: '2348140002233',
        verified: true,
        turnaround: 'Same-day – 24 hrs',
        pricingGuide: 'Port soldering: from ₦2,000 · Power bank repair: from ₦2,500 · Screen test: ₦1,000',
        specialties: ['Power bank fixing', 'Type-C phone ports', 'Casio calculator fixes'],
        bio: 'Hardware repair specialist solving power bank, phone port, and calculator issues on campus.',
      },
      {
        id: 'kurutie-gadget-doc',
        name: 'Kurutie Gadget Doctor',
        initials: 'GD',
        campus: 'Kurutie',
        landmark: 'Near Main Take-Off Campus Jetty',
        vendorSlug: 'kurutie-okerenkoko-essentials',
        whatsapp: '2349020003344',
        verified: true,
        turnaround: 'Same-day service',
        pricingGuide: 'Charging pin fix: ₦1,500 · Screen replacement: ₦4,000 · Battery swap: ₦2,500',
        specialties: ['Android charging pins', 'Earbud repairs', 'Power bank diagnosis'],
        bio: 'Quick gadget troubleshooting and solder repairs near Kurutie take-off jetty.',
      },
    ],
  },
  {
    id: 'photography',
    slug: 'photography',
    title: 'Photography & ID Cards',
    shortTitle: 'Photography',
    icon: Camera,
    tagline: 'Regulation cadet clearance passport photos & student portrait shoots.',
    description:
      'Official cadet clearance passport photographs (regulation white backdrop, uniform dress code), graduation portraits, and event photo coverage across campus.',
    startingPrice: 'From ₦1,000',
    turnaround: '15 mins instant print',
    providers: [
      {
        id: 'maritime-clicks-photo',
        name: 'Maritime Clicks Studio',
        initials: 'MC',
        campus: 'Okerenkoko',
        landmark: 'Near NMU Main Gate / Okerenkoko',
        vendorSlug: 'nmu-cadet-quartermaster',
        whatsapp: '2348030001122',
        verified: true,
        turnaround: '15 mins instant print',
        pricingGuide: '8 passport copies: ₦1,500 · Digital soft copy: ₦1,000',
        specialties: ['Regulation white background', 'Digital clearance photo', 'Cadet portraits'],
        bio: 'Fast, verified passport photographs formatted to exact faculty clearance specifications.',
      },
      {
        id: 'delta-light-studios',
        name: 'Delta Light Studios',
        initials: 'DL',
        campus: 'Kurutie',
        landmark: 'Kurutie Student Junction',
        vendorSlug: 'creekside-laundry-uniform-care',
        whatsapp: '2348080005566',
        verified: true,
        turnaround: '30 mins print',
        pricingGuide: '8 passport copies: ₦1,500 · Student portraits: ₦3,000',
        specialties: ['Campus event photos', 'ID passport prints', 'Digital retouching'],
        bio: 'High-clarity studio portraits and official matriculation passport photography in Kurutie.',
      },
    ],
  },
  {
    id: 'printing',
    slug: 'printing',
    title: 'Printing & Document Clearance',
    shortTitle: 'Printing',
    icon: Printer,
    tagline: 'Course project binding, technical drawing prints & exam slips.',
    description:
      'Fast black & white and full-color course material printing, A3 technical engineering drawings, course project spiral binding, and passport laminations.',
    startingPrice: 'From ₦50/page',
    turnaround: '5–15 mins',
    providers: [
      {
        id: 'campus-print-hub',
        name: 'NMU Campus Print Hub',
        initials: 'CP',
        campus: 'Okerenkoko',
        landmark: 'Library Complex Walkway',
        vendorSlug: 'amaka-fresh-bowls-tailoring',
        whatsapp: '2348060004455',
        verified: true,
        turnaround: 'Instant (5 mins)',
        pricingGuide: 'B&W print: ₦50/page · Colour print: ₦200/page · Spiral binding: ₦800',
        specialties: ['Project spiral binding', 'A3 engineering drawing prints', 'Course handouts'],
        bio: 'High-speed document printing, lecture note photocopy, and final project binding.',
      },
      {
        id: 'kurutie-quickpress',
        name: 'Kurutie QuickPress',
        initials: 'QP',
        campus: 'Kurutie',
        landmark: 'Near Academic Building, Kurutie',
        vendorSlug: 'kurutie-okerenkoko-essentials',
        whatsapp: '2349020003344',
        verified: true,
        turnaround: 'Instant print',
        pricingGuide: 'Course slide prints: ₦40/page · Hard-cover binding: ₦2,500 · Scanning: ₦100',
        specialties: ['Assignment printouts', 'Document scanning', 'Lamination'],
        bio: 'Fast walk-in document printing and photocopy center right next to lecture halls.',
      },
    ],
  },
  {
    id: 'tutoring',
    slug: 'tutoring',
    title: 'Cadet Academic Tutoring',
    shortTitle: 'Academic Tutoring',
    icon: BookOpen,
    tagline: 'Maritime navigation, calculus & technical drawing peer guidance.',
    description:
      'Peer-led academic support from senior maritime cadets and engineering scholars. One-on-one and small group tutorials for calculus, engineering mechanics, celestial navigation, and technical drawing.',
    startingPrice: 'From ₦1,500/hr',
    turnaround: 'Scheduled sessions',
    providers: [
      {
        id: 'peer-maritime-scholars',
        name: 'Peer Maritime Scholars',
        initials: 'MS',
        campus: 'Okerenkoko',
        landmark: 'Engineering Block Study Rooms',
        vendorSlug: 'nmu-cadet-quartermaster',
        whatsapp: '2348030001122',
        verified: true,
        turnaround: 'Evening & weekend hours',
        pricingGuide: 'Group tutorial: ₦1,000/session · 1-on-1 intensive: ₦2,500/hr',
        specialties: ['MTH 101/102 Calculus', 'ENG Technical Drawing', 'Navigational Astronomy'],
        bio: 'Senior cadets providing clear, structured problem-solving sessions for 100L & 200L units.',
      },
      {
        id: 'kurutie-nautical-study',
        name: 'Kurutie Nautical Study Circle',
        initials: 'NC',
        campus: 'Kurutie',
        landmark: 'Hostels Common Room, Kurutie',
        vendorSlug: 'creekside-laundry-uniform-care',
        whatsapp: '2348080005566',
        verified: true,
        turnaround: 'Daily study circles',
        pricingGuide: 'Weekly revision pass: ₦3,000 · Exam crash course: ₦5,000',
        specialties: ['Marine Engineering basics', 'Physics problem solving', 'Past question drills'],
        bio: 'Collaborative student tutorials focused on past question mastery and exam readiness.',
      },
    ],
  },
]

export function getAllServices(): ServiceItem[] {
  return SERVICES_LIST
}

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  const normalized = slug.toLowerCase().trim()
  return SERVICES_LIST.find(
    (s) => s.slug.toLowerCase() === normalized || s.id.toLowerCase() === normalized
  )
}
