import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChevronLeft, ChevronRight, MapPin, Plus, Clock, Tag } from 'lucide-react'
import { getPublicServiceBySlug } from '@/lib/queries'
import { getServiceBySlug } from '@/lib/services-data'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'
import { getCanonicalUrl } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found | Jetty' }

  const canonicalUrl = getCanonicalUrl(`/services/${slug}`)
  const title = `${service.title} Providers | Jetty NMU`
  const description = service.description || service.tagline

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Jetty NMU',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${service.title} on Jetty`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
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

  const cookieStore = await cookies()
  const cookieCampus = cookieStore.get('jetty_campus')?.value
  const selectedCampus =
    sp.campus || (cookieCampus && cookieCampus !== 'all' ? cookieCampus : 'all')

  const service = await getPublicServiceBySlug(slug, selectedCampus)

  if (!service) {
    notFound()
  }

  const filteredProviders = service.providers
  const Icon = service.icon

  return (
    <div className="min-w-0 max-w-full pb-20">
      <div className="container mx-auto max-w-lg md:max-w-4xl px-4 pt-4 md:pt-8 min-w-0">
        {/* Back Link */}
        <div className="pb-3">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 -ml-1 group-hover:-translate-x-0.5 transition-transform" />
            <span>All Services</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center shrink-0 shadow-2xs">
                <Icon className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-[family-name:var(--font-bricolage)] leading-tight">
                  {service.title}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredProviders.length}{' '}
                  {filteredProviders.length === 1 ? 'verified provider' : 'verified providers'}
                </p>
              </div>
            </div>

            <Link
              href="/vendor/dashboard?tab=new&kind=svc"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offer this service</span>
              <span className="sm:hidden">Offer</span>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {service.description || service.tagline}
          </p>

          {/* Service Highlights */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60 text-xs text-muted-foreground">
            {service.startingPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted font-medium">
                <Tag className="w-3 h-3 text-[#0F6E6E] dark:text-[#22D3EE]" />
                <span>{service.startingPrice}</span>
              </span>
            )}
            {service.turnaround && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted font-medium">
                <Clock className="w-3 h-3 text-[#0F6E6E] dark:text-[#22D3EE]" />
                <span>Turnaround: {service.turnaround}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted font-medium">
              <MapPin className="w-3 h-3 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>Campus Delivery / Walk-in</span>
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="pt-6 pb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-bricolage)] font-semibold text-lg text-foreground">
            Available Providers
          </h2>
          <span className="text-xs text-muted-foreground">
            {selectedCampus === 'all' ? 'All campuses' : selectedCampus}
          </span>
        </div>

        {/* Provider Cards */}
        {filteredProviders.length > 0 ? (
          <div className="space-y-3">
            {filteredProviders.map((provider) => {
              const waMessage = encodeURIComponent(
                `Hi ${provider.name}, I found your ${service.title} service on Jetty (${provider.campus}). I would like to get a quote and check availability.`
              )
              const waHref = `https://wa.me/${provider.whatsapp}?text=${waMessage}`
              const storeHref = provider.vendorSlug ? `/vendors/${provider.vendorSlug}` : null

              return (
                <div
                  key={provider.id}
                  className="p-4 rounded-2xl bg-card border border-border/80 hover:border-[#0F6E6E]/40 hover:bg-muted/20 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <Link
                    href={storeHref || waHref}
                    className="flex items-center gap-3.5 min-w-0 flex-1 group cursor-pointer"
                  >
                    {/* 52px Monogram / Avatar */}
                    <div className="w-13 h-13 rounded-2xl bg-[#0A4F4F] dark:bg-[#172D2D] border border-white/15 text-white flex items-center justify-center font-[family-name:var(--font-bricolage)] font-semibold text-lg shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {provider.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-base text-foreground">
                        <span className="truncate">{provider.name}</span>
                        {provider.verified && <VerifiedBadge size={15} />}
                      </div>

                      <div className="text-xs text-muted-foreground mt-0.5">
                        Starting from <b className="text-foreground">{provider.priceFrom}</b>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3 text-muted-foreground shrink-0 stroke-[1.75]" />
                        <span>{provider.campus}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Direct WhatsApp Chat Action */}
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
                    aria-label={`Chat with ${provider.name} on WhatsApp`}
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>Chat</span>
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty State Card */
          <div className="my-4 p-8 rounded-3xl bg-card border border-border/80 text-center flex flex-col items-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center mb-4 shadow-2xs">
              <Icon className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="font-[family-name:var(--font-bricolage)] font-bold text-lg sm:text-xl text-foreground">
              Be the first to offer {service.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1.5 max-w-sm">
              There are no active providers listed at {selectedCampus === 'all' ? 'NMU campuses' : selectedCampus} yet. Start offering your service to students today.
            </p>
            <Link
              href="/vendor/dashboard?tab=new&kind=svc"
              className="mt-5 w-full sm:w-auto sm:px-8 h-12 rounded-2xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List your {service.shortTitle || service.title} service</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
