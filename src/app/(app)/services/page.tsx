import Link from 'next/link'
import {
  Scissors,
  Wrench,
  Utensils,
  Camera,
  Shirt,
  Droplets,
  BookOpen,
  Briefcase,
  MapPin,
  Clock,
  BadgeCheck,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Store,
} from 'lucide-react'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import { WavyAvatar } from '@/components/brand/WavyAvatar'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Campus Services Directory | Jetty NMU',
  description:
    'Find verified student tailors, laundry services, barbers, cooks, and gadget repair technicians across NMU Okerenkoko & Kurutie campuses. Transparent pricing guides and direct WhatsApp consultations.',
}

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
}

export interface ServiceCategoryGroup {
  id: string
  title: string
  slug: string
  icon: typeof Scissors
  badge: string
  description: string
  providers: ServiceProvider[]
}

const SERVICE_DIRECTORY: ServiceCategoryGroup[] = [
  {
    id: 'tailoring',
    title: 'Uniform Tailoring & Alterations',
    slug: 'tailoring',
    icon: Shirt,
    badge: '3 verified providers',
    description:
      'Cadet action-rig resizing, trouser slimming, shoulder board reinforcement, rank badge attachment, and custom cloth nameplates.',
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
      },
    ],
  },
  {
    id: 'laundry',
    title: 'Laundry & Uniform Pressing',
    slug: 'laundry',
    icon: Droplets,
    badge: '2 verified providers',
    description:
      'Heavy-duty washing, starching, and anti-wrinkle pressing for white action rigs and student everyday clothes.',
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
      },
    ],
  },
  {
    id: 'barbing',
    title: 'Barbing & Grooming',
    slug: 'barbing',
    icon: Scissors,
    badge: '2 verified providers',
    description:
      'Regulation cadet haircuts, clean fades, beard line-ups, and hygienic clipper treatments near campus hostels.',
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
      },
    ],
  },
  {
    id: 'food',
    title: 'Campus Catering & Private Cooks',
    slug: 'cooking',
    icon: Utensils,
    badge: '2 verified providers',
    description:
      'Hostel meal plans, 2L soup coolers, made-to-order fruit salad bowls, and warm takeaway delivery.',
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
      },
    ],
  },
  {
    id: 'repairs',
    title: 'Gadget & Tech Repair',
    slug: 'tech-repairs',
    icon: Wrench,
    badge: '1 verified provider',
    description:
      'Power bank cell diagnosis, smartphone charging port replacements, scientific calculator screen fixes, and laptop charging adapters.',
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
      },
    ],
  },
  {
    id: 'photography',
    title: 'Photography & ID Cards',
    slug: 'photography',
    icon: Camera,
    badge: '1 verified provider',
    description:
      'Official cadet clearance passport photographs (regulation white backdrop, uniform dress code) and event photo coverage.',
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
      },
    ],
  },
]

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ campus?: string; category?: string; q?: string }>
}) {
  const sp = await searchParams
  const selectedCampus = sp.campus || 'all'
  const selectedCategory = sp.category || 'all'
  const query = (sp.q || '').trim().toLowerCase()

  // Filter categories and their providers
  const filteredCategories = SERVICE_DIRECTORY.map((cat) => {
    // If specific category selected, match category
    if (selectedCategory !== 'all' && cat.slug !== selectedCategory && cat.id !== selectedCategory) {
      return null
    }

    // Filter providers by campus and search query
    const filteredProviders = cat.providers.filter((p) => {
      // Campus filter
      if (selectedCampus !== 'all' && p.campus.toLowerCase() !== selectedCampus.toLowerCase()) {
        return false
      }
      // Query filter
      if (query) {
        const text = `${cat.title} ${cat.description} ${p.name} ${p.landmark} ${p.specialties.join(' ')} ${p.pricingGuide}`.toLowerCase()
        if (!text.includes(query)) {
          return false
        }
      }
      return true
    })

    if (filteredProviders.length === 0) {
      return null
    }

    return {
      ...cat,
      providers: filteredProviders,
    }
  }).filter(Boolean) as ServiceCategoryGroup[]

  const totalProvidersCount = filteredCategories.reduce(
    (acc, cat) => acc + cat.providers.length,
    0
  )

  const buildUrl = (overrides: { campus?: string; category?: string; q?: string }) => {
    const nextCampus = overrides.campus !== undefined ? overrides.campus : selectedCampus
    const nextCategory = overrides.category !== undefined ? overrides.category : selectedCategory
    const nextQ = overrides.q !== undefined ? overrides.q : query

    const params = new URLSearchParams()
    if (nextCampus && nextCampus !== 'all') params.set('campus', nextCampus)
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory)
    if (nextQ) params.set('q', nextQ)

    const str = params.toString()
    return `/services${str ? `?${str}` : ''}`
  }

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-6 sm:space-y-8 min-w-0">
        {/* Top Header & Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-semibold">
              <Briefcase className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
              <span>Campus Services Directory</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
              Services &amp; Artisans around NMU
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Tailoring, laundry, barbing, repairs, and catering from verified student and local craftspeople across Okerenkoko &amp; Kurutie campuses.
            </p>
          </div>

          <Link
            href="/vendor/apply"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-foreground text-background px-4 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-2xs self-start md:self-auto"
          >
            <Store className="h-3.5 w-3.5" />
            <span>List a Service</span>
          </Link>
        </div>

        {/* Filter Controls: Campus Selector & Category Rails */}
        <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 space-y-3 shadow-2xs">
          {/* Row 1: Single-Line Campus Filter (Never wraps on iPhone) */}
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Campus:
              </span>
              <div
                role="radiogroup"
                aria-label="Filter services by campus"
                className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs shrink-0 flex-nowrap"
              >
                {[
                  { id: 'all', label: 'All' },
                  { id: 'Okerenkoko', label: 'Okerenkoko' },
                  { id: 'Kurutie', label: 'Kurutie' },
                ].map((c) => {
                  const active = selectedCampus.toLowerCase() === c.id.toLowerCase()
                  return (
                    <Link
                      key={c.id}
                      href={buildUrl({ campus: c.id })}
                      role="radio"
                      aria-checked={active}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap',
                        active
                          ? 'bg-card text-foreground shadow-2xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {c.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Quick Count */}
            <div className="text-xs text-muted-foreground shrink-0">
              <span className="font-semibold text-foreground">
                {totalProvidersCount} {totalProvidersCount === 1 ? 'provider' : 'providers'}
              </span>
              <span> · Direct WhatsApp quotes</span>
            </div>
          </div>

          {/* Row 2: Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Link
              href={buildUrl({ category: 'all' })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                selectedCategory === 'all'
                  ? 'border-foreground bg-foreground text-background font-semibold'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              All Trades
            </Link>
            {SERVICE_DIRECTORY.map((cat) => {
              const active = selectedCategory === cat.slug || selectedCategory === cat.id
              return (
                <Link
                  key={cat.id}
                  href={buildUrl({ category: cat.slug })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                    active
                      ? 'border-foreground bg-foreground text-background font-semibold'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {cat.title}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-foreground">
              No services match your current filter.
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Try switching your campus filter to &quot;All Campuses&quot; or clearing your category selection.
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex h-9 items-center px-4 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90"
              >
                Reset Filters
              </Link>
            </div>
          </div>
        )}

        {/* Directory Categorized Groups */}
        <div className="space-y-8 sm:space-y-10">
          {filteredCategories.map((group) => {
            const Icon = group.icon
            return (
              <section
                key={group.id}
                id={group.slug}
                className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xs"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0A4F4F] dark:text-[#E8B84A] shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-foreground">
                        {group.title}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-center text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/60">
                    {group.providers.length} {group.providers.length === 1 ? 'provider' : 'providers'}
                  </span>
                </div>

                {/* Multiple Providers Offering This Service */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                  {group.providers.map((provider) => {
                    const waMessage = encodeURIComponent(
                      `Hi ${provider.name}, I found your ${group.title} service on Jetty (${provider.campus}). I would like to get a quote and check availability.`
                    )
                    const waUrl = `https://wa.me/${provider.whatsapp}?text=${waMessage}`

                    return (
                      <div
                        key={provider.id}
                        className="rounded-xl border border-border/90 bg-card p-4 flex flex-col justify-between gap-4 hover:border-foreground/40 hover:shadow-xs transition-all"
                      >
                        {/* Provider Bio & Campus */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Generative Maritime Avatar */}
                              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border/80 shadow-2xs">
                                <WavyAvatar
                                  name={provider.name}
                                  seed={provider.id || provider.name}
                                  size={40}
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h3 className="text-sm font-bold text-foreground truncate">
                                    {provider.name}
                                  </h3>
                                  {provider.verified && (
                                    <BadgeCheck
                                      className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0"
                                      aria-label="Identity verified by Jetty"
                                    />
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="font-semibold text-foreground/90">
                                    {provider.campus}
                                  </span>
                                  <span>·</span>
                                  <span className="truncate">{provider.landmark}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Specialties Pills */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {provider.specialties.map((spec) => (
                              <span
                                key={spec}
                                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>

                          {/* Transparent Pricing Breakdown */}
                          <div className="rounded-lg bg-muted/50 border border-border/70 p-2.5 space-y-1 text-xs">
                            <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
                              <span className="font-semibold text-foreground">Pricing Guide</span>
                              <span className="flex items-center gap-1 text-[10px]">
                                <Clock className="h-3 w-3" />
                                {provider.turnaround}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                              {provider.pricingGuide}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2 border-t border-border/70">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20BD5A] transition-colors shadow-2xs"
                          >
                            <WhatsAppIcon className="h-4 w-4 shrink-0 text-white" />
                            <span>Inquire on WhatsApp</span>
                          </a>

                          {provider.vendorSlug && (
                            <Link
                              href={`/vendors/${provider.vendorSlug}`}
                              className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground py-1 transition-colors"
                            >
                              <span>View vendor store profile</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {/* Transparent Guarantee & Safety Note */}
        <section className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-6 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <ShieldCheck className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
            <span>How Service Pricing Works on Jetty</span>
          </div>
          <p className="leading-relaxed">
            Because tailoring measurements, laundry fabric quantities, and tech repairs vary per student, prices listed above are realistic starting guidelines. Always specify your exact requirements with the provider directly on WhatsApp to confirm the final fee and turnaround time before handing over uniforms or gadgets.
          </p>
        </section>

        {/* Onboarding Banner: Offer Your Service */}
        <section className="rounded-2xl border border-border bg-foreground text-background p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Are you a tailor, barber, cook, or laundry operator on campus?
            </h2>
            <p className="text-xs sm:text-sm text-background/80 leading-relaxed">
              List your campus trade on Jetty for free. Get verified by Naga so NMU students in Okerenkoko and Kurutie can reach you directly on WhatsApp.
            </p>
          </div>
          <Link
            href="/vendor/apply"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-background text-foreground px-5 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
          >
            <Store className="h-4 w-4" />
            Apply to List Your Service
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
