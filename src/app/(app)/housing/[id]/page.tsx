import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  MessageCircle,
} from 'lucide-react'
import { getPublicLodgeById } from '@/lib/queries'
import { formatNaira, getCanonicalUrl } from '@/lib/whatsapp'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { ShareButton } from '@/components/shared/ShareButton'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { lodge } = await getPublicLodgeById(id)
  if (!lodge) return { title: 'Room Not Found | Jetty' }

  const canonicalPath = `/housing/${lodge.slug || lodge.id}`
  const canonicalUrl = getCanonicalUrl(canonicalPath)
  const title = `${lodge.title} — ${formatNaira(lodge.price)}/${lodge.period} | Jetty Lodges`
  const description = `${lodge.room_type_label} near NMU ${lodge.campus}. ${lodge.distance_hint}`
  const previewImg = lodge.image && !lodge.image.startsWith('data:') ? lodge.image : '/og-image.png'

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
          url: previewImg,
          width: 1200,
          height: 630,
          alt: lodge.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImg],
    },
  }
}

export default async function HousingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { lodge, otherLodges } = await getPublicLodgeById(id)

  if (!lodge) {
    notFound()
  }

  const waText = encodeURIComponent(
    `Hi ${lodge.contact_name}! 👋 I saw your room listing "${lodge.title}" (₦${lodge.price.toLocaleString('en-NG')} / ${lodge.period} at ${lodge.campus}) on Jetty. I would like to schedule an in-person viewing.`
  )
  const waUrl = `https://wa.me/${lodge.whatsapp_number}?text=${waText}`


  const hasLocationExplanation = Boolean(
    lodge.location_label && lodge.location_label.trim().length > 0
  )
  const hasPinnedGps =
    lodge.latitude != null &&
    lodge.longitude != null &&
    Number.isFinite(Number(lodge.latitude)) &&
    Number.isFinite(Number(lodge.longitude))

  const googleMapsUrl = hasPinnedGps
    ? `https://www.google.com/maps/search/?api=1&query=${lodge.latitude},${lodge.longitude}`
    : null

  const housingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: lodge.title,
    description: `${lodge.room_type_label} near NMU ${lodge.campus}. ${lodge.distance_hint}`,
    image: lodge.image
      ? lodge.image.startsWith('http')
        ? lodge.image
        : `https://jetty.francisnaga.site${lodge.image}`
      : 'https://jetty.francisnaga.site/og-image.png',
    address: {
      '@type': 'PostalAddress',
      addressLocality: lodge.campus,
      addressRegion: 'Delta State',
      addressCountry: 'NG',
    },
    offers: {
      '@type': 'Offer',
      price: lodge.price,
      priceCurrency: 'NGN',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: lodge.price,
        priceCurrency: 'NGN',
        unitText: lodge.period,
      },
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <div className="min-w-0 max-w-full pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(housingJsonLd) }}
      />
      <div className="container mx-auto max-w-lg md:max-w-5xl px-0 md:px-6 md:pt-6">
        <div className="md:grid md:grid-cols-12 md:gap-8 md:items-start">
          {/* 1. Image Gallery */}
          <div className="dimg relative aspect-square w-auto mx-4 mt-2 md:mx-0 md:mt-0 rounded-3xl border border-border/80 shadow-xs bg-[#DCEBEB] dark:bg-[#132A2A] overflow-hidden flex items-center justify-center md:col-span-6 md:sticky md:top-20">
            {lodge.image ? (
              <OptimizedImage
                src={lodge.image}
                alt={lodge.title}
                priority
                sizes="(max-width: 640px) 100vw, 550px"
                className="w-full h-full object-cover"
                fallback={<Building2 className="w-16 h-16 opacity-35 text-[#0F6E6E]" />}
              />
            ) : (
              <Building2 className="w-16 h-16 opacity-35 text-[#0F6E6E]" />
            )}

            {/* Floating Circular Back Button (.ov.l) */}
            <Link href="/housing" className="ov l" aria-label="Back to lodges">
              <ChevronLeft className="w-5 h-5 -ml-0.5 stroke-[2.2]" />
            </Link>

            {/* Floating Circular Share Button (.ov.r) */}
            <ShareButton
              path={`/housing/${lodge.slug || lodge.id}`}
              title={lodge.title}
              shareText={`Check out this student room on Jetty: ${lodge.title} (${formatNaira(lodge.price)} / ${lodge.period} at ${lodge.campus}):`}
              className="ov r cursor-pointer"
              iconClassName="w-4.5 h-4.5 stroke-[2]"
            />

            {/* Carousel Dots */}
            <div className="dots absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
              <span className="dot on" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>

          {/* 2. Detail Body */}
          <div className="db px-4 md:px-0 pt-4 md:pt-0 space-y-4 md:col-span-6">
            {/* Price & Period (.dp) */}
            <div className="dp flex items-baseline gap-1 text-[28px] sm:text-[32px] font-bold text-foreground tracking-tight font-[family-name:var(--font-bricolage)]">
              <span>{formatNaira(lodge.price)}</span>
              <small className="text-[15px] font-normal text-muted-foreground">
                / {lodge.period}
              </small>
            </div>

            {/* Title (.dt) */}
            <h1 className="dt text-[20px] sm:text-[22px] font-semibold text-foreground leading-snug">
              {lodge.title}
            </h1>

            {/* Metadata Row */}
            <div className="dmeta flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
              {lodge.is_verified && (
                <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                  <VerifiedBadge size={14} />
                  <span>Verified seller</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 stroke-[2]" />
                {lodge.campus}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 stroke-[2]" />
                Posted {lodge.posted_time || 'Recently'}
              </span>
            </div>

            {/* Light Divider */}
            <div className="dv" />

            {/* Facts 2-Column Grid */}
            <dl className="facts">
              <div>
                <dt>Type</dt>
                <dd>{lodge.room_type_label}</dd>
              </div>
              <div>
                <dt>Bedspaces</dt>
                <dd>{lodge.bedspaces || '1 to 2'}</dd>
              </div>
              <div>
                <dt>Distance</dt>
                <dd>{lodge.distance_hint}</dd>
              </div>
              <div>
                <dt>Rent covers</dt>
                <dd>{lodge.rent_covers || 'One session'}</dd>
              </div>
              <div>
                <dt>Utilities</dt>
                <dd>{lodge.utilities || 'Water included'}</dd>
              </div>
              <div>
                <dt>Other fees</dt>
                <dd>{lodge.other_fees || 'None'}</dd>
              </div>
            </dl>

            {/* What is there */}
            {lodge.features && lodge.features.length > 0 && (
              <>
                <div className="dv" />
                <div className="space-y-2.5">
                  <h3 className="hh text-[17px] font-bold text-foreground">What is there</h3>
                  <div className="flex flex-wrap gap-2">
                    {lodge.features.map((feat) => (
                      <span
                        key={feat}
                        className="px-3.5 py-1.5 rounded-full bg-[#E6F2F2] dark:bg-[#132A2A] text-foreground text-xs font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Caretaker Row */}
            <div className="dv" />
            <Link
              href={lodge.vendor_slug ? `/vendors/${lodge.vendor_slug}` : waUrl}
              target={lodge.vendor_slug ? undefined : '_blank'}
              rel={lodge.vendor_slug ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-3 py-2 group cursor-pointer"
              aria-label={`Contact ${lodge.contact_name}`}
            >
              <UserAvatar
                src={lodge.contact_avatar}
                seed={lodge.vendor_slug || lodge.contact_name}
                name={lodge.contact_name}
                size={48}
                className="shrink-0 border border-border/60"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                  <span>{lodge.contact_name}</span>
                  {lodge.is_verified && <VerifiedBadge size={15} />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {lodge.agent_listings_count || 1}{' '}
                  {lodge.agent_listings_count === 1 ? 'listing' : 'listings'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* About this room */}
            <div className="dv" />
            <div className="space-y-1.5">
              <h3 className="hh text-[17px] font-bold text-foreground">About this room</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lodge.description ||
                  `Clean student room near ${lodge.campus} campus. Contact on WhatsApp to arrange an in-person viewing.`}
              </p>
            </div>

            {/* Location: Typed Location Explanation vs Optional Pinned GPS Google Maps Button */}
            {(hasLocationExplanation || googleMapsUrl) && (
              <>
                <div className="dv" />
                <div className="space-y-2.5">
                  <h3 className="hh text-[17px] font-bold text-foreground">Location</h3>
                  {hasLocationExplanation && (
                    <p className="text-sm text-foreground font-medium">
                      {lodge.location_label}
                    </p>
                  )}
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#0F6E6E]/40 text-[#0F6E6E] dark:text-[#22D3EE] font-semibold text-sm hover:bg-[#E6F2F2]/40 transition-colors"
                    >
                      <MapPin className="w-4 h-4 stroke-[2]" />
                      <span>Open pinned location in Google Maps</span>
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Safety Box */}
            <div className="rounded-2xl border border-[#0F6E6E]/20 bg-[#E6F2F2]/60 dark:bg-[#132A2A]/60 p-4 flex items-start gap-3 text-xs text-foreground shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                See the room before you pay anything. Never send rent to someone you have not met.
              </span>
            </div>

            {/* More from Campus Lodges */}
            {otherLodges.length > 0 && (
              <div className="pt-4 space-y-3">
                <div className="dv" />
                <h3 className="hh text-[17px] font-bold text-foreground">
                  More rooms near campus
                </h3>
                <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                  {otherLodges.map((other) => (
                    <WaterlineRoomCard key={other.id} lodge={other} variant="grid" />
                  ))}
                </div>
              </div>
            )}

            {/* Quiet Report Link */}
            <div className="pt-4 pb-6 text-center">
              <ReportListingModal
                targetType="product"
                productId={lodge.id}
                targetName={lodge.title}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="container mx-auto max-w-lg md:max-w-5xl px-4 h-[72px] flex items-center justify-between gap-4">
          <div className="pp min-w-0">
            <b className="block text-[20px] font-bold text-foreground leading-none font-[family-name:var(--font-bricolage)]">
              {formatNaira(lodge.price)}
            </b>
            <small className="text-xs text-muted-foreground">per {lodge.period}</small>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white font-semibold text-sm sm:text-base transition-colors shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 stroke-[2] fill-white/20" />
            <span>Request viewing</span>
          </a>
        </div>
      </div>
    </div>
  )
}
