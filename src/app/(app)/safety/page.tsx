import Link from 'next/link'
import {
  ShieldCheck,
  BadgeCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
  Lock,
  FileText,
  Store,
  ChevronRight,
  ExternalLink,
  Users,
} from 'lucide-react'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'
import { SafetyNavTabs } from '@/components/safety/SafetyNavTabs'

export const metadata = {
  title: 'Trust, Safety & Guidelines | Jetty NMU',
  description:
    'Comprehensive safety rules, verified seller standards, campus meeting landmarks, privacy architecture, and terms of service for Nigeria Maritime University (NMU).',
}

export default function SafetyAndHelpPage() {
  return (
    <div className="py-6 sm:py-10 md:py-12 min-w-0">
      <div className="container mx-auto max-w-4xl px-3.5 sm:px-4 space-y-8 min-w-0">
        {/* Header Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Trust, Integrity &amp; Safety Architecture</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Trust, Safety &amp; Community Standards
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Jetty connects cadets, students, and campus vendors across Nigeria Maritime University (Okerenkoko &amp; Kurutie). Review our verified seller criteria, safe transaction practices, and privacy standards below.
          </p>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {[
              {
                title: 'Direct Inspection',
                desc: 'Inspect in person before paying',
                icon: Eye,
              },
              {
                title: 'No Escrow Fees',
                desc: 'Zero platform markups or cuts',
                icon: ShieldCheck,
              },
              {
                title: 'Verified Merchants',
                desc: 'Identity-checked by admin',
                icon: BadgeCheck,
              },
              {
                title: 'Safe Landmarks',
                desc: 'Public daytime campus spots',
                icon: MapPin,
              },
            ].map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="rounded-xl border border-border/80 bg-card p-3 space-y-1 shadow-2xs"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold text-foreground">{pillar.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {pillar.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sticky Subnav Bar */}
        <SafetyNavTabs />

        {/* Section 1: Overview */}
        <section id="overview" className="scroll-mt-28 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Core Principles &amp; Direct Commerce Model
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Why Jetty protects buyers by avoiding online middlemen and advance fees
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Jetty operates as a <strong className="text-foreground">sovereign campus marketplace directory</strong>. Unlike centralized retail sites that hold buyer money in custodial escrow accounts or charge transaction fees, Jetty enables direct peer-to-peer and merchant discovery.
            </p>
            <p>
              By keeping the checkout conversation on WhatsApp and the transaction at verified campus landmarks, students eliminate the risk of online chargeback scams, delayed refunds, or unfulfilled bank transfers. You only pay when you have physically examined the safety boots, cadet uniform, calculator, or room in front of you.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Rule #1: Never Send Advance Bank Transfers</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Never transfer funds for an item or housing inspection before meeting the seller in person. Any seller demanding “commitment fees” or “delivery fares” prior to meeting should be immediately reported to platform moderation.
            </p>
          </div>
        </section>

        {/* Section 2: How Ordering Works */}
        <section id="ordering-flow" className="scroll-mt-28 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              How Ordering Works: The 3-Step Safe Trade Loop
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simple, deterministic steps for cadets and freshers buying on campus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[
              {
                num: '01',
                title: 'Browse & Compare',
                body: 'Search for cadet action rigs, boots, stationery, or electronics. Filter by your campus (Okerenkoko or Kurutie) and check whether the vendor has a verified badge.',
              },
              {
                num: '02',
                title: 'Chat & Confirm on WhatsApp',
                body: 'Tap the WhatsApp button. Confirm available sizes, live photos, and whether pickup is at their shop, hostel annex, or campus gate.',
              },
              {
                num: '03',
                title: 'Inspect & Pay Directly',
                body: 'Meet at a public campus landmark during daylight. Inspect the material, fit, or working condition thoroughly, then pay the seller directly in person.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs"
              >
                <span className="font-mono text-xs font-bold text-primary">
                  {step.num}
                </span>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Safe Campus Meeting Points */}
        <section id="meeting-points" className="scroll-mt-28 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              NMU Campus Safe Meeting Zones
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Recommended public landmarks for handoffs across Okerenkoko and Kurutie
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                name: 'Okerenkoko Main Campus Gate',
                campus: 'Okerenkoko',
                note: 'Active security personnel, clear visibility, ideal for daytime collections and general parcels.',
              },
              {
                name: 'Parade Ground Annex & Block C Walkway',
                campus: 'Okerenkoko',
                note: 'High-traffic pedestrian thoroughfare; convenient for cadet gear and quick study tool exchanges.',
              },
              {
                name: 'Kurutie Take-Off Campus Main Gate',
                campus: 'Kurutie',
                note: 'Designated meeting landmark for all Kurutie students and nearby hostel deliveries.',
              },
              {
                name: 'Escravos River Jetty Terminal',
                campus: 'Transit Point',
                note: 'Safe and supervised public location for items arriving via speedboat or ferry routes.',
              },
            ].map((zone) => (
              <div
                key={zone.name}
                className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{zone.name}</span>
                  </h3>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {zone.campus}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {zone.note}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 border border-border">
            <strong className="text-foreground">Cadet Safety Note:</strong> For non-shop student sellers operating from hostels, never enter an unfamiliar private room or unlit corridor for initial handoffs. Always request the seller to meet you outside at the hostel security desk or gate.
          </p>
        </section>

        {/* Section 4: Seller & Photo Standards */}
        <section id="seller-standards" className="scroll-mt-28 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Seller Integrity &amp; Product Photo Standards
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Strict rules to prevent fake listings, deceptive pricing, and photo misrepresentation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* The DOs */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Mandatory Seller Standards</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Real Photos Only:</strong> Photograph the physical item on a clean desk or tabletop in natural daylight.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Truthful Pricing:</strong> Always quote your genuine Naira asking price. Hidden charges are not permitted.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Accurate Stock:</strong> Mark items as <em>Out of Stock</em> as soon as inventory is depleted.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Clear Location:</strong> Specify your exact pickup point or campus zone before publishing.</span>
                </li>
              </ul>
            </div>

            {/* The DON'Ts */}
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                <XCircle className="h-4 w-4" />
                <span>Strictly Prohibited Practices</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold shrink-0">✕</span>
                  <span><strong>No Stock Photos:</strong> Do not use corporate marketing or fashion model photos for cadet gear or boots.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold shrink-0">✕</span>
                  <span><strong>No Inspection Fees:</strong> Demanding money from students to inspect a room or gadget leads to permanent bans.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold shrink-0">✕</span>
                  <span><strong>No Bait-and-Switch:</strong> Advertising a lower price online and charging more on WhatsApp is forbidden.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold shrink-0">✕</span>
                  <span><strong>No Misleading Condition:</strong> Labeling refurbished or second-hand items as &quot;Brand New&quot; is penalized.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: Privacy Policy */}
        <section id="privacy-policy" className="scroll-mt-28 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Privacy Architecture &amp; Data Security
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              How student identities and hostel locations are protected on Jetty
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Zero Tracking for Shoppers &amp; Cadets</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Students do not need an account to browse, search, or check prices on Jetty. We do not track your search history across campus or sell analytical profiles. Tapping a WhatsApp button opens a direct chat using your own device.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Server-Side Stripping of Residential Coordinates</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To safeguard student sellers residing in campus hostels, exact GPS coordinates (<code className="font-mono text-foreground text-[11px]">latitude</code> &amp; <code className="font-mono text-foreground text-[11px]">longitude</code>) are automatically stripped on the server unless the vendor explicitly designates a public commercial shopfront. Private hostel pins are never transmitted to public web clients.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Vendor Identity &amp; Verification Storage</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vendor authentication is handled securely via Google OAuth 2.0 with Supabase row-level security. Verification materials (matriculation status, department info) are audited directly by administrators and never stored on public-facing cloud buckets.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Terms of Use */}
        <section id="terms-of-use" className="scroll-mt-28 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Terms of Service &amp; Community Rules
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Legal boundaries governing peer-to-peer campus commerce
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Jetty is an independent software directory built specifically for the Nigeria Maritime University (NMU) student and vendor community. Jetty is neither a retail reseller nor an auctioneer, and is not a legal party to any sale, condition warranty, delivery timeline, or payment executed between buyers and sellers.
            </p>
            <p>
              <strong className="text-foreground">Prohibited Items &amp; Conduct:</strong> Any listing involving counterfeit identification badges, examination malpractice materials, weapons, unapproved pharmaceutical drugs, illegal substances, or fraudulent housing agent fees will result in immediate suspension and referral to university security authorities.
            </p>
            <p>
              <strong className="text-foreground">Account Suspension &amp; Appeal:</strong> Storefronts with unresolved buyer complaints or substantiated misrepresentation reports are immediately frozen. Vendors may appeal a suspension by submitting proof of resolution to platform administration.
            </p>
          </div>
        </section>

        {/* Section 7: Reporting Desk & Escalation */}
        <section id="reporting-desk" className="scroll-mt-28 space-y-4">
          <div className="rounded-2xl border border-primary/25 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Report a Problem or Suspicious Seller</span>
                </h2>
                <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                  Notice an outdated listing, an unresponsive WhatsApp number, or an unverified seller asking for advance money? File a confidential moderation report.
                </p>
              </div>

              <div className="shrink-0">
                <ReportListingModal
                  targetType="vendor"
                  targetName="General Jetty Safety Desk"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Are you a student or local business offering goods/services?</span>
              <Link
                href="/vendor/apply"
                className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
              >
                <Store className="h-3.5 w-3.5" />
                <span>Apply for Verified Vendor Status →</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
