import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChevronLeft, ChevronRight, MapPin, Plus } from 'lucide-react'
import { getPublicServiceBySlug } from '@/lib/queries'
import { getServiceBySlug } from '@/lib/services-data'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { getCanonicalUrl, buildServiceInquiryWhatsAppUrl } from '@/lib/whatsapp'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { UserAvatar } from '@/components/brand/UserAvatar'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found | Jetty' }

  const displayName = service.shortTitle || service.title
  const canonicalUrl = getCanonicalUrl(`/services/${slug}`)
  const title = `${displayName} Providers | Jetty NMU`
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
          alt: `${displayName} on Jetty`,
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
  const displayName = service.shortTitle || service.title
  const Icon = service.icon

  const providersCountText =
    filteredProviders.length === 1
      ? '1 provider'
      : `${filteredProviders.length} providers`

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    serviceType: service.shortTitle || service.title,
    description: service.description || service.tagline,
    provider: {
      '@type': 'Organization',
      name: 'Jetty NMU Campus Marketplace',
      url: 'https://jetty.francisnaga.site',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Nigeria Maritime University (Okerenkoko & Kurutie)',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'NGN',
      lowPrice: service.startingPrice
        ? parseInt(service.startingPrice.replace(/\D/g, ''), 10) || 0
        : 0,
    },
  }

  return (
    <div className="min-w-0 max-w-full pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <div className="mx-auto max-w-2xl min-w-0">
        {/* Top Back Link matching prototype: < Services */}
        <div className="pt-4 pb-2 px-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-[15px] font-medium text-[#0F6E6E] dark:text-[#22D3EE] hover:underline"
          >
            <ChevronLeft className="w-5 h-5 -ml-1 stroke-[2.5]" />
            <span>Services</span>
          </Link>
        </div>

        {/* Large Heading & Provider Count matching prototype */}
        <div className="px-4 pb-4">
          <h1 className="text-[32px] sm:text-4xl font-bold tracking-tight text-foreground font-sans leading-tight">
            {displayName}
          </h1>
          <p className="text-sm sm:text-[15px] text-muted-foreground mt-1">
            {providersCountText}
          </p>
        </div>

        {/* Crisp Horizontal Divider matching prototype */}
        <div className="border-b border-border/80" />

        {/* Provider List matching prototype */}
        {filteredProviders.length > 0 ? (
          <div className="divide-y divide-border/80 border-b border-border/80">
            {filteredProviders.map((provider) => {
              const priceLabel = provider.priceFrom.startsWith('From')
                ? provider.priceFrom
                : `From ${provider.priceFrom}`
              const serviceWa = buildServiceInquiryWhatsAppUrl({
                whatsappNumber: provider.whatsapp,
                serviceTitle: displayName,
                providerName: provider.name,
                startingPrice: provider.priceFrom,
                serviceUrl: getCanonicalUrl(`/services/${slug}`),
              })
              const targetHref = provider.vendorSlug
                ? `/vendors/${provider.vendorSlug}`
                : serviceWa.valid
                ? serviceWa.url
                : '#'

              return (
                <Link
                  key={provider.id}
                  href={targetHref}
                  className="flex items-center justify-between gap-3.5 px-4 py-3.5 sm:py-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* 56px Provider Avatar */}
                    <UserAvatar
                      src={provider.logo_url}
                      seed={provider.id || provider.vendorSlug || provider.name}
                      name={provider.name}
                      size={56}
                      className="w-14 h-14 shrink-0 shadow-2xs border border-border/60 group-hover:scale-105 transition-transform"
                    />

                    {/* Provider Info */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-[16px] text-foreground leading-snug">
                        <span className="truncate">{provider.name}</span>
                        {provider.verified && <VerifiedBadge size={16} />}
                      </div>

                      <div className="text-[14px] text-muted-foreground font-normal">
                        {priceLabel}
                      </div>

                      <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0 stroke-[1.75]" />
                        <span>{provider.campus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Chevron > */}
                  <ChevronRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 stroke-[2]" />
                </Link>
              )
            })}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] dark:text-[#22D3EE] mx-auto flex items-center justify-center shadow-2xs">
              <Icon className="w-7 h-7 stroke-[1.8]" />
            </div>
            <p className="text-base font-semibold text-foreground">
              No providers listed yet
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              There are no active {displayName.toLowerCase()} providers at{' '}
              {selectedCampus === 'all' ? 'NMU campuses' : selectedCampus} yet.
            </p>
            <Link
              href="/vendor/dashboard?tab=new&kind=svc"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Offer this service</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
