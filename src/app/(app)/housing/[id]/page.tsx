import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react'
import { getPublicLodgeById } from '@/lib/queries'
import { formatNaira, getCanonicalUrl } from '@/lib/whatsapp'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { ProductImageGallery } from '@/components/marketplace/ProductImageGallery'

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
  const description = `${lodge.room_type_label} near NMU ${lodge.campus}${lodge.location_label ? ` · ${lodge.location_label}` : ''}`
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
    description: `${lodge.room_type_label} near NMU ${lodge.campus}${lodge.location_label ? ` · ${lodge.location_label}` : ''}`,
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

  const galleryImages =
    lodge.images && lodge.images.length > 0
      ? lodge.images
      : lodge.image
      ? [lodge.image]
      : []

  return (
    <div className="min-w-0 max-w-full pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(housingJsonLd) }}
      />
      <div className="container mx-auto max-w-lg md:max-w-5xl px-0 md:px-6 md:pt-6">
        <div className="md:grid md:grid-cols-12 md:gap-8 md:items-start">
          {/* 1. Image Gallery */}
          <ProductImageGallery
            images={galleryImages}
            title={lodge.title}
            backHref="/housing"
            backLabel="Back to lodges"
            sharePath={`/housing/${lodge.slug || lodge.id}`}
            shareText={`Check out this student room on Jetty: ${lodge.title} (${formatNaira(lodge.price)} / ${lodge.period} at ${lodge.campus}):`}
            fallbackType="housing"
            campus={lodge.campus}
            subtitle={lodge.room_type_label}
          />

          {/* 2. Detail Body */}
          <div className="db px-4 md:px-0 pt-4 md:pt-0 space-y-4 md:col-span-6">
            {/* Price & Period (.dp) */}
            <div className="dp flex items-baseline gap-1.5 text-[28px] sm:text-[32px] font-bold text-foreground tracking-tight font-mono-num">
              <span>{formatNaira(lodge.price)}</span>
              <small className="text-[15px] font-normal text-muted-foreground">
                / {lodge.period}
              </small>
            </div>

            {/* Title (.dt) */}
            <h1 className="dt text-[18px] sm:text-[20px] font-semibold text-foreground leading-snug">
              {lodge.title}
            </h1>

            {/* Metadata Row matching Image 3 */}
            <div className="dmeta flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground pt-0.5">
              {lodge.is_verified && (
                <span className="inline-flex items-center gap-1 text-[#0F6E6E] dark:text-[#22D3EE] font-medium">
                  <span className="font-bold">✓</span>
                  <span>Verified seller</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 stroke-[2] text-muted-foreground" />
                <span>{lodge.campus}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 stroke-[2] text-muted-foreground" />
                <span>Posted {lodge.posted_time || '1 day ago'}</span>
              </span>
            </div>

            {/* Room Facts Table matching Image 2 */}
            <div className="border-t border-b border-border/80 divide-y divide-border/60 my-4">
              <div className="py-3 flex items-center justify-between text-[14px]">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold text-foreground">{lodge.room_type_label}</span>
              </div>
              <div className="py-3 flex items-center justify-between text-[14px]">
                <span className="text-muted-foreground">Bedspaces</span>
                <span className="font-semibold text-foreground">{lodge.bedspaces || '1 to 2'}</span>
              </div>
              <div className="py-3 flex items-center justify-between text-[14px]">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-semibold text-foreground">{lodge.distance_hint || lodge.location_label || 'Near campus'}</span>
              </div>
              <div className="py-3 flex items-center justify-between text-[14px]">
                <span className="text-muted-foreground">Rent covers</span>
                <span className="font-semibold text-foreground">{lodge.rent_covers || `One ${lodge.period || 'session'}`}</span>
              </div>
              <div className="py-3 flex items-center justify-between text-[14px]">
                <span className="text-muted-foreground">Utilities</span>
                <span className="font-semibold text-foreground">{lodge.utilities || 'Water included'}</span>
              </div>
              <div className="py-3 flex items-center justify-between text-[14px]">
                <span className="text-muted-foreground">Other fees</span>
                <span className="font-semibold text-foreground">{lodge.other_fees || 'None'}</span>
              </div>
            </div>

            {/* What is there matching Image 2 */}
            {lodge.features && lodge.features.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <h3 className="text-[16px] font-bold text-foreground">What is there</h3>
                <div className="flex flex-wrap gap-2">
                  {lodge.features.map((feat) => (
                    <span
                      key={feat}
                      className="px-4 py-2 rounded-full bg-[#EAEAEA] dark:bg-muted text-foreground text-sm font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Caretaker Row */}
            <div className="dv" />
            <Link
              href={lodge.vendor_slug ? `/vendors/${lodge.vendor_slug}` : waUrl}
              target={lodge.vendor_slug ? undefined : '_blank'}
              rel={lodge.vendor_slug ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-3 py-1 group cursor-pointer"
              aria-label={`Contact ${lodge.contact_name}`}
            >
              <UserAvatar
                src={lodge.contact_avatar}
                seed={lodge.vendor_slug || lodge.contact_name}
                name={lodge.contact_name}
                size={48}
                className="shrink-0 border border-border/80 shadow-2xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                  <span>{lodge.contact_name}</span>
                  {lodge.is_verified && <VerifiedBadge size={15} />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {lodge.is_verified ? 'Verified Campus Caretaker' : 'Campus Caretaker'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* About this room (Only if description was provided by vendor) */}
            {lodge.description && lodge.description.trim().length > 0 && (
              <>
                <div className="dv" />
                <div className="space-y-1.5">
                  <h3 className="hh text-[16px] font-bold text-foreground">About this room</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {lodge.description}
                  </p>
                </div>
              </>
            )}

            {/* Location (Only if vendor provided location explanation or map pin) */}
            {(hasLocationExplanation || googleMapsUrl) && (
              <>
                <div className="dv" />
                <div className="space-y-2.5">
                  <h3 className="hh text-[16px] font-bold text-foreground">Location</h3>
                  {hasLocationExplanation && (
                    <p className="text-sm text-muted-foreground font-medium">
                      {lodge.location_label}
                    </p>
                  )}
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground font-semibold text-sm transition-colors"
                    >
                      <MapPin className="w-4 h-4 stroke-[2]" />
                      <span>Open pinned location in Google Maps</span>
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Safety Box */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4 flex items-start gap-3 text-xs text-muted-foreground shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                See the room before you pay anything. Never send rent or inspection fees to someone you have not met in person.
              </span>
            </div>

            {/* More from Campus Lodges */}
            {otherLodges.length > 0 && (
              <div className="pt-4 space-y-3">
                <div className="dv" />
                <h3 className="hh text-[17px] font-bold text-foreground">
                  {otherLodges.some((o) => o.vendor_slug && o.vendor_slug === lodge.vendor_slug)
                    ? `More from ${lodge.contact_name}`
                    : 'More rooms near campus'}
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
        className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom,0px)] after:absolute after:top-full after:left-0 after:right-0 after:h-40 after:bg-card"
      >
        <div className="container mx-auto max-w-lg md:max-w-5xl px-4 h-[68px] flex items-center justify-between gap-4">
          <div className="min-w-0 flex flex-col justify-center">
            <b className="block text-[21px] sm:text-[23px] font-bold text-foreground leading-none font-mono-num tracking-tight">
              {formatNaira(lodge.price)}
            </b>
            <span className="text-[11.5px] text-muted-foreground font-medium leading-none mt-1">per {lodge.period}</span>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 max-w-xs flex items-center justify-center gap-2 h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white font-semibold text-[14px] sm:text-[15px] transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="w-4.5 h-4.5 stroke-[2] fill-white/20" />
            <span>Request viewing</span>
          </a>
        </div>
      </div>
    </div>
  )
}
