import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Briefcase,
  MapPin,
  ArrowRight,
  Store,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { SERVICES_LIST } from '@/lib/services-data'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Campus Services & Artisans | Jetty NMU',
  description:
    'Directory of verified student and local service providers across NMU Okerenkoko and Kurutie campuses. Select any service to view providers, transparent pricing guides, and WhatsApp contact details.',
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ campus?: string; category?: string }>
}) {
  const sp = await searchParams

  // Backward compatibility: If an old link points to /services?category=tailoring, redirect directly to /services/tailoring
  if (sp.category && sp.category !== 'all') {
    const targetCampus = sp.campus && sp.campus !== 'all' ? `?campus=${sp.campus}` : ''
    redirect(`/services/${encodeURIComponent(sp.category)}${targetCampus}`)
  }

  const selectedCampus = (sp.campus || 'all').toLowerCase()

  // Calculate providers count per service based on campus selection
  const servicesWithCounts = SERVICES_LIST.map((service) => {
    const matchingProviders = service.providers.filter((p) => {
      if (selectedCampus === 'all') return true
      return p.campus.toLowerCase() === selectedCampus
    })

    return {
      ...service,
      matchingCount: matchingProviders.length,
      totalCount: service.providers.length,
    }
  })

  const totalActiveProviders = servicesWithCounts.reduce(
    (acc, s) => acc + s.matchingCount,
    0
  )

  const buildCampusUrl = (campusId: string) => {
    if (campusId === 'all') return '/services'
    return `/services?campus=${campusId}`
  }

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-6 sm:space-y-8 min-w-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/70 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-semibold">
              <Briefcase className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
              <span>Campus Services Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
              Services &amp; Trades around NMU
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Select a service below to see verified campus providers, compare turnaround times &amp; pricing guides, and message anyone directly on WhatsApp.
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

        {/* Minimal Campus Filter Bar (Strict single-line on mobile) */}
        <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap w-full sm:w-auto">
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
                { id: 'okerenkoko', label: 'Okerenkoko' },
                { id: 'kurutie', label: 'Kurutie' },
              ].map((c) => {
                const active = selectedCampus === c.id
                return (
                  <Link
                    key={c.id}
                    href={buildCampusUrl(c.id)}
                    role="radio"
                    aria-checked={active}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap',
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

          <div className="text-xs text-muted-foreground shrink-0">
            <span className="font-semibold text-foreground">{servicesWithCounts.length} trades</span>
            <span className="mx-1">·</span>
            <span>
              {totalActiveProviders} {totalActiveProviders === 1 ? 'provider' : 'providers'} available
            </span>
          </div>
        </div>

        {/* Services Grid (Spacious, clean cards showing only services and provider counts) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {servicesWithCounts.map((service) => {
            const Icon = service.icon
            const detailHref = `/services/${service.slug}${
              selectedCampus !== 'all' ? `?campus=${selectedCampus}` : ''
            }`

            return (
              <Link
                key={service.id}
                href={detailHref}
                className="group relative rounded-2xl border border-border/90 bg-card p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-foreground/30 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Top Row: Icon & Provider Count Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted border border-border/80 text-foreground group-hover:border-foreground/40 transition-colors shrink-0">
                      <Icon className="h-5 w-5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border/70 text-xs font-semibold text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                      <span>
                        {service.matchingCount}{' '}
                        {service.matchingCount === 1 ? 'provider' : 'providers'}
                      </span>
                    </div>
                  </div>

                  {/* Service Title & Tagline */}
                  <div className="space-y-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors leading-snug">
                      {service.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {service.tagline}
                    </p>
                  </div>
                </div>

                {/* Bottom Meta & Clean Click Target */}
                <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <span className="font-semibold text-foreground">{service.startingPrice}</span>
                    <span>·</span>
                    <span>{service.turnaround}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-xs text-foreground group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] group-hover:translate-x-0.5 transition-all">
                    <span>View providers</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Safety Note */}
        <section className="rounded-2xl border border-border/80 bg-muted/30 p-4 sm:p-5 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <ShieldCheck className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
            <span>How Campus Services Work on Jetty</span>
          </div>
          <p className="leading-relaxed">
            All listed providers are verified student or community craftspeople in Okerenkoko and Kurutie. Click into any service to see specific providers, view their past work and landmarks, and discuss measurements or custom orders directly via WhatsApp before payment.
          </p>
        </section>

        {/* Offer Your Service Banner */}
        <section className="rounded-2xl border border-border bg-foreground text-background p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Offer tailoring, laundry, barbing, or repairs on campus?
            </h2>
            <p className="text-xs sm:text-sm text-background/80 leading-relaxed">
              List your campus trade on Jetty for free. Get verified by Naga so NMU students in Okerenkoko and Kurutie can find you and message you directly on WhatsApp.
            </p>
          </div>
          <Link
            href="/vendor/apply"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-background text-foreground px-5 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
          >
            <Store className="h-4 w-4" />
            <span>Apply to List Your Service</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
