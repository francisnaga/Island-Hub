import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Clock,
  BadgeCheck,
  ShieldCheck,
  Store,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { getServiceBySlug, getAllServices, ServiceProvider } from '@/lib/services-data'
import { WavyAvatar } from '@/components/brand/WavyAvatar'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found | Jetty' }

  return {
    title: `${service.title} Providers | Jetty NMU`,
    description: service.description,
  }
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ campus?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const service = getServiceBySlug(slug)

  if (!service) {
    notFound()
  }

  const selectedCampus = (sp.campus || 'all').toLowerCase()
  const Icon = service.icon

  // Filter providers by campus if selected
  const filteredProviders = service.providers.filter((p) => {
    if (selectedCampus === 'all') return true
    return p.campus.toLowerCase() === selectedCampus
  })

  const buildCampusUrl = (campusId: string) => {
    if (campusId === 'all') return `/services/${service.slug}`
    return `/services/${service.slug}?campus=${campusId}`
  }

  return (
    <div className="py-5 sm:py-8 md:py-10 min-w-0">
      <div className="container mx-auto max-w-5xl px-3.5 sm:px-4 space-y-6 sm:space-y-8 min-w-0">
        {/* Breadcrumb / Back Link */}
        <div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to All Services</span>
          </Link>
        </div>

        {/* Service Hero Card */}
        <section className="rounded-2xl border border-border/90 bg-card p-5 sm:p-7 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted border border-border/90 text-foreground shrink-0 shadow-2xs">
                <Icon className="h-6 w-6 text-[#0F6E6E] dark:text-[#E8B84A]" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted border border-border text-[11px] font-semibold text-muted-foreground">
                  <span>Campus Trade</span>
                  <span>·</span>
                  <span>{service.turnaround}</span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
                  {service.title}
                </h1>
              </div>
            </div>

            <div className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
              <span>
                {filteredProviders.length}{' '}
                {filteredProviders.length === 1 ? 'provider' : 'providers'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
            {service.description}
          </p>

          <div className="pt-3 border-t border-border/70 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-semibold text-foreground">Typical rates:</span>
              <span className="font-bold text-foreground">{service.startingPrice}</span>
            </div>
            <span className="text-border hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Turnaround: {service.turnaround}</span>
            </div>
          </div>
        </section>

        {/* Campus Filter for this service */}
        <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Campus:
            </span>
            <div
              role="radiogroup"
              aria-label="Filter providers by campus"
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
            <span>Choose any provider to chat on WhatsApp</span>
          </div>
        </div>

        {/* Empty State if no provider in selected campus */}
        {filteredProviders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-foreground">
              No {service.shortTitle.toLowerCase()} providers listed in {selectedCampus === 'okerenkoko' ? 'Okerenkoko' : 'Kurutie'} yet.
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Switch to all campuses to see available providers who also service or deliver across campuses.
            </p>
            <div className="pt-2">
              <Link
                href={`/services/${service.slug}`}
                className="inline-flex h-9 items-center px-4 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90"
              >
                View All Campus Providers
              </Link>
            </div>
          </div>
        )}

        {/* Providers List (Spacious, clean cards dedicated to this trade) */}
        <div className="space-y-4 sm:space-y-5">
          {filteredProviders.map((provider) => {
            const waMessage = encodeURIComponent(
              `Hi ${provider.name}, I found your ${service.title} on Jetty (${provider.campus}). I would like to get a quote and check availability.`
            )
            const waUrl = `https://wa.me/${provider.whatsapp}?text=${waMessage}`

            return (
              <div
                key={provider.id}
                className="rounded-2xl border border-border/90 bg-card p-5 sm:p-6 space-y-4 hover:border-foreground/30 hover:shadow-xs transition-all"
              >
                {/* Header: Avatar, Name, Campus Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border/80 shadow-2xs">
                      <WavyAvatar
                        name={provider.name}
                        seed={provider.id || provider.name}
                        size={48}
                        className="w-full h-full"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-foreground">
                          {provider.name}
                        </h2>
                        {provider.verified && (
                          <BadgeCheck
                            className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0"
                            aria-label="Verified artisan"
                          />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {provider.campus}
                        </span>
                        <span>·</span>
                        <span className="truncate">{provider.landmark}</span>
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border self-start sm:self-auto shrink-0">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{provider.turnaround}</span>
                  </div>
                </div>

                {/* Bio (if available) */}
                {provider.bio && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {provider.bio}
                  </p>
                )}

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {provider.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/80 border border-border/60"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Pricing Guide Box */}
                <div className="rounded-xl bg-muted/50 border border-border/80 p-3 sm:p-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span className="text-foreground">Pricing Guide</span>
                    <span>Direct quote on WhatsApp</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                    {provider.pricingGuide}
                  </p>
                </div>

                {/* Direct Action Row: WhatsApp & Store Link */}
                <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white text-xs sm:text-sm font-semibold hover:bg-[#20BD5A] transition-colors shadow-2xs px-5"
                  >
                    <WhatsAppIcon className="h-4 w-4 shrink-0 text-white" />
                    <span>Message {provider.name.split(' ')[0]} on WhatsApp</span>
                  </a>

                  {provider.vendorSlug && (
                    <Link
                      href={`/vendors/${provider.vendorSlug}`}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg border border-border/80 hover:bg-muted transition-colors"
                    >
                      <span>View store catalog</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Safety Advisory */}
        <section className="rounded-2xl border border-border/80 bg-muted/30 p-4 sm:p-5 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <ShieldCheck className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
            <span>Inspection &amp; Handover Guidelines</span>
          </div>
          <p className="leading-relaxed">
            All prices listed above are starting guides established with providers. When contacting via WhatsApp, clarify your specific requirements, fabric types, device faults, and exact collection deadline before physical handover.
          </p>
        </section>

        {/* Join as Provider Banner */}
        <section className="rounded-2xl border border-border bg-foreground text-background p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Do you also offer {service.shortTitle.toLowerCase()} near campus?
            </h2>
            <p className="text-xs sm:text-sm text-background/80 leading-relaxed">
              Get listed under {service.title} on Jetty. Reach cadets and staff directly on WhatsApp. Free to apply.
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
