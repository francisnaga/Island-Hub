import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
} from 'lucide-react'
import { LODGE_LISTINGS } from '@/lib/lodge-data'
import { formatNaira } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'

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
    `Hi ${lodge.contact_name}, I saw your student lodge listing on Jetty: "${lodge.title}" (₦${lodge.price.toLocaleString('en-NG')} / ${lodge.period} at ${lodge.campus}). I would like to schedule an in-person viewing.`
  )
  const waUrl = `https://wa.me/${lodge.whatsapp_number}?text=${waText}`

  const hasLocation = Boolean(lodge.location_label && lodge.location_label.trim().length > 0)

  const facts: Array<[string, string]> = [
    ['Room Type', lodge.room_type_label],
    ['Campus Area', `${lodge.campus} Campus Zone`],
    ['Rent Period', lodge.period],
    ['Caretaker', lodge.contact_name],
  ]

  // Find initials for caretaker
  const initials = lodge.contact_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div className="min-w-0 max-w-full pb-28">
      <div className="container mx-auto max-w-lg px-0">
        {/* 1. Image Gallery (.dimg) */}
        <div className="dimg">
          <div className="slides">
            <div className="slide room">
              {lodge.image ? (
                <img
                  src={lodge.image}
                  alt={lodge.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-16 h-16 opacity-40 text-teal-700" />
              )}
            </div>
          </div>

          {/* Floating Back Button (.ov.l) */}
          <Link href="/housing" className="ov l" aria-label="Back to lodges">
            <ChevronLeft className="w-5 h-5 -ml-0.5 stroke-[2.2]" />
          </Link>

          {/* Floating Share Button (.ov.r) */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Check out this student room on Jetty: ${lodge.title} (₦${lodge.price.toLocaleString('en-NG')} / ${lodge.period} at ${lodge.campus}):\nhttps://jetty.ng/housing/${lodge.id}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
            className="ov r"
          >
            <Share2 className="w-4.5 h-4.5" />
          </a>
        </div>

        {/* 2. Detail Body (.db) */}
        <div className="db">
          {/* Price & Period (.dp) */}
          <div className="dp">
            <span>{formatNaira(lodge.price)}</span>{' '}
            <small>/ {lodge.period}</small>
          </div>

          {/* Title (.dt) */}
          <h1 className="dt">{lodge.title}</h1>

          {/* Metadata (.dmeta) */}
          <div className="dmeta">
            {lodge.is_verified && (
              <span className="ver">
                <svg
                  className="w-3.5 h-3.5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Verified room</span>
              </span>
            )}
            <span>
              <MapPin className="w-3.5 h-3.5 stroke-[2]" />
              <span>{lodge.campus}</span>
            </span>
            <span>
              <Clock className="w-3.5 h-3.5 stroke-[2]" />
              <span>{lodge.distance_hint}</span>
            </span>
          </div>

          {/* Divider (.dv) */}
          <div className="dv" />

          {/* Facts (.facts) */}
          <dl className="facts">
            {facts.map(([label, val]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{val}</dd>
              </div>
            ))}
          </dl>

          {/* Location Landmark: ONLY SHOWN IF ADDED */}
          {hasLocation && (
            <div className="mt-4 p-3.5 rounded-[12px] bg-card border border-border/80 text-xs flex items-start gap-2.5 text-muted-foreground shadow-2xs">
              <MapPin className="w-4 h-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
              <div>
                <b className="text-foreground">Lodge Landmark: </b>
                <span>{lodge.location_label}</span>
              </div>
            </div>
          )}

          {/* Amenities / "What is there" (.hh & .am) */}
          {lodge.features && lodge.features.length > 0 && (
            <>
              <div className="dv" />
              <h3 className="hh">What is there</h3>
              <div className="am">
                {lodge.features.map((feat) => (
                  <span key={feat}>{feat}</span>
                ))}
              </div>
            </>
          )}

          {/* Caretaker Row (.sr) */}
          <div className="dv" />
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sr group"
            aria-label={`Contact ${lodge.contact_name}`}
          >
            <div className="av">
              <span>{initials || 'LK'}</span>
            </div>
            <div className="bd">
              <b>
                <span>{lodge.contact_name}</span>
                {lodge.is_verified && (
                  <svg
                    className="w-4 h-4 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </b>
              <small>Lodge Caretaker · Message on WhatsApp</small>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* About this room (.hh & .dd) */}
          <div className="dv" />
          <h3 className="hh">About this room</h3>
          <p className="dd">
            Inspected student accommodation in the NMU {lodge.campus} campus vicinity. Clean environment with {lodge.features.join(', ').toLowerCase()}. Contact caretaker directly to arrange inspection.
          </p>

          {/* Safety Tip (.tip) */}
          <div className="dv" />
          <div className="tip">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              See the room in person before paying anything. Never pay inspection fees or advance rent to someone you have not met on campus.
            </span>
          </div>

          <div className="h-8" />
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar (.bar) */}
      <div className="bar">
        <div className="pp min-w-0">
          <b>{formatNaira(lodge.price)}</b>
          <small>per {lodge.period}</small>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="go"
        >
          <WhatsAppIcon className="w-4.5 h-4.5 text-white" />
          <span>Request viewing</span>
        </a>
      </div>
    </div>
  )
}
