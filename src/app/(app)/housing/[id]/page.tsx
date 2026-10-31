import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  MapPin,
  Clock,
  Check,
  ShieldCheck,
  Building2,
  MessageCircle,
} from 'lucide-react'
import { getPublicLodgeById } from '@/lib/queries'
import { formatNaira, getCanonicalUrl } from '@/lib/whatsapp'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { ShareButton } from '@/components/shared/ShareButton'

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

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: lodge.image ? [{ url: lodge.image }] : undefined,
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

  const initials = lodge.contact_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${lodge.location_label || lodge.campus}, Nigeria Maritime University, Delta State`
  )}`

  return (
    <div className="min-w-0 max-w-full pb-28">
      <div className="container mx-auto max-w-lg px-0">
        {/* 1. Image Gallery */}
        <div className="dimg relative aspect-square w-full bg-[#DCEBEB] dark:bg-[#132A2A] overflow-hidden flex items-center justify-center">
          {lodge.image ? (
            <img
              src={lodge.image}
              alt={lodge.title}
              className="w-full h-full object-cover"
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
        <div className="db px-4 pt-4 space-y-4">
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
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Verified seller
            </span>
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
            <div className="w-12 h-12 rounded-full bg-[#0F6E6E] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {initials || 'CL'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 font-semibold text-foreground text-sm">
                <span>{lodge.contact_name}</span>
                <Check className="w-3.5 h-3.5 text-[#0F6E6E] dark:text-[#22D3EE] stroke-[2.5]" />
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

          {/* Location Landmark + Open in Google Maps (shown only if vendor added location) */}
          {lodge.location_label && (
            <>
              <div className="dv" />
              <div className="space-y-2.5">
                <h3 className="hh text-[17px] font-bold text-foreground">Location</h3>
                <p className="text-sm text-foreground font-medium">{lodge.location_label}</p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#0F6E6E]/40 text-[#0F6E6E] dark:text-[#22D3EE] font-semibold text-sm hover:bg-[#E6F2F2]/40 transition-colors"
                >
                  <MapPin className="w-4 h-4 stroke-[2]" />
                  <span>Open in Google Maps</span>
                </a>
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

      {/* 3. Sticky Bottom Action Bar */}
      <div className="bar fixed bottom-0 inset-x-0 z-50 h-[72px] px-4 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-between gap-4 max-w-lg mx-auto">
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
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[#0A4F4F] hover:bg-[#0F6E6E] text-white font-semibold text-[15px] transition-colors shadow-sm"
        >
          <MessageCircle className="w-5 h-5 stroke-[2] fill-white/20" />
          <span>Request viewing</span>
        </a>
      </div>
    </div>
  )
}
