import Link from 'next/link'
import {
  Home,
  AlertTriangle,
  BadgeCheck,
  MapPin,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const housingListings = [
  {
    id: '1',
    title: 'Single Bedspace — Kurutie Campus Hostel Vicinity',
    type: 'bedspace',
    campus: 'Kurutie',
    price: 25000,
    period: 'per session',
    description: 'Single bedspace in a shared room, 3 mins walk from the Kurutie take-off campus gate. Well-ventilated, security light available. Serious inquiries only.',
    contact: '2348011223344',
    verified: true,
    posted: '2 days ago',
  },
  {
    id: '2',
    title: 'Self-Contain Room — Okerenkoko Permanent Campus Area',
    type: 'self-contain',
    campus: 'Okerenkoko',
    price: 80000,
    period: 'per session',
    description: 'Mini self-contain: room + private bath. Short walking distance from permanent campus. Rent payable in advance. Inspect before committing.',
    contact: '2348022334455',
    verified: true,
    posted: '5 days ago',
  },
  {
    id: '3',
    title: 'Shared Apartment — 3 Students, Warri-Side',
    type: 'shared-apartment',
    campus: 'Warri',
    price: 15000,
    period: 'per student/month',
    description: 'Looking for 2 more female students to share a 3-bedroom flat in Warri. Shared kitchen and bathroom. Ferry-accessible from Warri jetty to campus.',
    contact: '2348033445566',
    verified: false,
    posted: '1 week ago',
  },
]

const NAIRA = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })

export default async function HousingPage() {
  return (
    <div className="min-w-0">
      {/* Safety Banner — always visible */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-3.5 sm:px-4 py-2.5">
        <div className="container mx-auto max-w-7xl flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Scam Warning:</strong> Never pay inspection fees, agent fees, or any advance payment to view a property. Always inspect in person before paying rent. Jetty does not handle any housing payments.
          </p>
        </div>
      </div>

      {/* Header */}
      <section className="border-b border-border bg-card py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="max-w-2xl space-y-2.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Housing &amp; Bedspaces near NMU
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Find bedspaces, self-contain rooms, and shared apartments near Okerenkoko permanent campus, Kurutie take-off campus, and the Warri-side ferry route.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Rules */}
      <section className="py-6 sm:py-8 border-b border-border">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: Eye,
                title: 'Inspect First',
                body: 'Always visit the property in person and confirm it matches the listing before paying anything.',
              },
              {
                icon: ShieldCheck,
                title: 'No Advance Fees',
                body: 'Legitimate landlords do not charge inspection fees or agent registration fees before showing a room.',
              },
              {
                icon: BadgeCheck,
                title: 'Verified Posters',
                body: 'Listings with a Verified badge are from posters who have completed Jetty identity verification.',
              },
            ].map((rule) => {
              const Icon = rule.icon
              return (
                <div key={rule.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 sm:p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0F6E6E] dark:text-[#E8B84A] shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-foreground">{rule.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rule.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4 sm:space-y-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Available Listings</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{housingListings.length} near NMU</p>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {housingListings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:border-[#0F6E6E]/40 transition-all min-w-0"
              >
                <div className="flex-1 space-y-2.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="rounded-md bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                      {listing.type.replace(/-/g, ' ')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {listing.campus}
                    </span>
                    {listing.verified && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/20 px-2 py-0.5 text-[10px] font-bold text-[#0F6E6E] dark:text-[#E8B84A] uppercase tracking-wider">
                        <BadgeCheck className="h-3 w-3" />
                        Verified poster
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground sm:ml-auto">Posted {listing.posted}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-foreground">{listing.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{listing.description}</p>

                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-extrabold text-foreground">{NAIRA.format(listing.price)}</span>
                    <span className="text-xs text-muted-foreground">/ {listing.period}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:w-44 shrink-0 justify-end sm:justify-start sm:items-end">
                  <a
                    href={`https://wa.me/${listing.contact}?text=${encodeURIComponent(`Hi! I saw your housing listing on Jetty: "${listing.title}". I'd like to enquire about viewing the property.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 transition-colors w-full"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <p className="text-[10px] text-center text-muted-foreground">Always inspect before paying</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Post a listing CTA */}
      <section className="py-8 sm:py-10 border-t border-border bg-card">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Have a room or bedspace to let?</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                Verified posters can list student rooms and bedspaces for free after identity confirmation.
              </p>
            </div>
            <Link
              href="/vendor/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0A4F4F] transition-colors shrink-0"
            >
              <Home className="h-4 w-4" />
              Post a Listing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
