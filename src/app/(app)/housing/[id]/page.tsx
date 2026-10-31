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
import { LODGE_LISTINGS } from '@/lib/lodge-data'
import { formatNaira } from '@/lib/whatsapp'
import { WaterlineRoomCard } from '@/components/cards/WaterlineRoomCard'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lodge = LODGE_LISTINGS.find((l) => l.id === id)
  if (!lodge) return { title: 'Room Not Found | Jetty' }

  return {
    title: `${lodge.title} | Jetty Lodges`,
    description: `${lodge.room_type_label} near NMU ${lodge.campus}. ${lodge.distance_hint}`,
  }
}

export default async function HousingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lodge = LODGE_LISTINGS.find((l) => l.id === id)

  if (!lodge) {
    notFound()
  }

  const waText = encodeURIComponent(
    `Hi ${lodge.contact_name}! 👋 I saw your room listing "${lodge.title}" (₦${lodge.price.toLocaleString('en-NG')} / ${lodge.period} at ${lodge.campus}) on Jetty. I would like to schedule an in-person viewing.`
  )
  const waUrl = `https://wa.me/${lodge.whatsapp_number}?text=${waText}`

  const otherLodges = LODGE_LISTINGS.filter((l) => l.id !== lodge.id)

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
        {/* 1. Image Gallery matching Uploaded Images 1 & 5 */}
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
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Check out this student room on Jetty: ${lodge.title} (₦${lodge.price.toLocaleString('en-NG')} / ${lodge.period} at ${lodge.campus}):\nhttps://jetty.ng/housing/${lodge.id}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
            className="ov r"
          >
            <Share2 className="w-4.5 h-4.5 stroke-[2]" />
          </a>

          {/* Carousel Dots matching Image 5 */}
          <div className="dots absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
            <span className="dot on" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>

        {/* 2. Detail Body matching Uploaded Images 3 & 4 */}
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

          {/* Metadata Row matching Image 4 */}
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
              Posted {lodge.posted_time || '1 day ago'}
            </span>
          </div>

          {/* Light Divider */}
          <div className="dv" />

          {/* Facts 2-Column Grid matching Image 4 */}
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
              <dd>{lodge.other_fees || 'Agent fee applies'}</dd>
            </div>
          </dl>

          {/* What is there matching Image 4 */}
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

          {/* Caretaker Row matching Image 3 */}
          <div className="dv" />
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
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
                {lodge.agent_listings_count || 3} listings
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* About this room matching Image 3 */}
          <div className="dv" />
          <div className="space-y-1.5">
            <h3 className="hh text-[17px] font-bold text-foreground">About this room</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lodge.description ||
                `Clean self-contain with its own bathroom and kitchenette. Quiet street, close to lecture halls.`}
            </p>
          </div>

          {/* Location Landmark + Open in Google Maps matching Image 3 */}
          <div className="dv" />
          <div className="space-y-2.5">
            <h3 className="hh text-[17px] font-bold text-foreground">Location</h3>
            <p className="text-sm text-foreground font-medium">
              {lodge.location_label || 'Near the main gate'}
            </p>
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

          {/* Safety Box matching Image 3 */}
          <div className="rounded-2xl border border-[#0F6E6E]/20 bg-[#E6F2F2]/60 dark:bg-[#132A2A]/60 p-4 flex items-start gap-3 text-xs text-foreground shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              See the room before you pay anything. Never send rent to someone you have not met.
            </span>
          </div>

          {/* More from Campus Lodges matching Image 2 */}
          {otherLodges.length > 0 && (
            <div className="pt-4 space-y-3">
              <div className="dv" />
              <h3 className="hh text-[17px] font-bold text-foreground">
                More from Campus Lodges
              </h3>
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {otherLodges.map((other) => (
                  <WaterlineRoomCard key={other.id} lodge={other} variant="grid" />
                ))}
              </div>
            </div>
          )}

          {/* Quiet Report Link matching Image 2 */}
          <div className="pt-4 pb-6 text-center">
            <ReportListingModal
              targetType="product"
              productId={lodge.id}
              targetName={lodge.title}
            />
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar matching Image 2 */}
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
