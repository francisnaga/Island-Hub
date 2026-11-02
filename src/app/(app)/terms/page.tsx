import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { JETTY_TEAM_PHONE_DISPLAY, buildJettyTeamWhatsAppUrl } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Terms of Service | Jetty NMU',
  description:
    'Terms of Service and Community Rules for Jetty, the Nigeria Maritime University student and campus marketplace.',
  alternates: {
    canonical: 'https://jetty.francisnaga.site/terms',
  },
}

export default function TermsPage() {
  const lastUpdated = 'November 1, 2026'

  return (
    <article className="min-h-screen py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl sm:max-w-3xl mx-auto space-y-12">
        {/* Navigation */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Marketplace</span>
          </Link>
        </div>

        {/* Document Header */}
        <header className="space-y-3 pb-8 border-b border-border/60">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Legal · Updated {lastUpdated}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            User agreement, peer trading standards, and platform rules for the Nigeria Maritime University community.
          </p>
        </header>

        {/* Document Content */}
        <div className="space-y-10 text-[15px] sm:text-base leading-[1.75] text-muted-foreground">
          {/* Section 1: Acceptance */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              1. Acceptance &amp; Community Scope
            </h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern access to and use of Jetty (&quot;we,&quot; &quot;our,&quot; or &quot;the platform&quot;) at{' '}
              <a
                href="https://jetty.francisnaga.site"
                className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors font-medium"
              >
                jetty.francisnaga.site
              </a>
              . Jetty serves students, cadets, faculty, and local vendors connected with Nigeria Maritime University (NMU) across the Okerenkoko permanent campus and Kurutie take-off campus in Delta State, Nigeria.
            </p>
            <p>
              By accessing, browsing, registering a storefront, or listing items or services, you agree to these Terms and our{' '}
              <Link
                href="/privacy"
                className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors font-medium"
              >
                Privacy Policy
              </Link>
              . If you do not agree, you must discontinue using Jetty immediately.
            </p>
          </section>

          {/* Section 2: Platform Nature */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              2. Platform Nature (Directory Only)
            </h2>
            <p>
              Jetty operates exclusively as an online campus directory and discovery platform. We are not an escrow service, payment processor, bank, retailer, or transport broker.
            </p>
            <ul className="space-y-2 pl-5 list-disc text-sm leading-relaxed">
              <li>
                <strong className="text-foreground">Direct Peer Communication:</strong> Buyers contact vendors directly on WhatsApp or by phone. No messages or transactions pass through intermediary escrow accounts.
              </li>
              <li>
                <strong className="text-foreground">Physical In-Person Handover:</strong> All payments, inspections, and item handovers occur in person on campus between the buyer and seller.
              </li>
              <li>
                <strong className="text-foreground">No Custody of Funds:</strong> Jetty never holds, collects, or handles transaction monies. We cannot issue refunds or guarantee the condition of second-hand goods.
              </li>
            </ul>
          </section>

          {/* Section 3: Accounts */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              3. Vendor Accounts &amp; Identification
            </h2>
            <p>
              Browsing items, rooms, and services requires no account. Vendors who list products or services must sign in using Google OAuth:
            </p>
            <ul className="space-y-1.5 pl-5 list-disc text-sm leading-relaxed">
              <li>
                <strong className="text-foreground">Accurate Details:</strong> You must supply truthful information, including your active Nigerian WhatsApp phone number and primary campus zone.
              </li>
              <li>
                <strong className="text-foreground">Store Handles:</strong> Vendors select an identification handle (<code className="font-mono text-xs text-foreground">@username</code>) that must not impersonate other entities, brands, or university authorities.
              </li>
              <li>
                <strong className="text-foreground">Account Responsibility:</strong> You are responsible for all activity conducted through your store profile.
              </li>
            </ul>
          </section>

          {/* Section 4: Prohibited Items */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              4. Prohibited Items &amp; Marketplace Standards
            </h2>
            <p>
              To maintain campus trust and student safety, the following items and practices are strictly forbidden:
            </p>
            <ul className="space-y-2 pl-5 list-disc text-sm leading-relaxed">
              <li>
                <strong className="text-foreground">Advance Payment Demands:</strong> Requesting &quot;inspection fees,&quot; &quot;booking deposits,&quot; or &quot;delivery money&quot; before the buyer has physically inspected the item or accommodation in person.
              </li>
              <li>
                <strong className="text-foreground">Academic Dishonesty:</strong> Listing exam papers, unauthorized test materials, or ghostwritten academic work.
              </li>
              <li>
                <strong className="text-foreground">Contraband &amp; Controlled Goods:</strong> Illicit substances, unapproved pharmaceutical drugs, alcohol in violation of hostel regulations, or counterfeit credentials.
              </li>
              <li>
                <strong className="text-foreground">Weapons &amp; Hazardous Material:</strong> Firearms, explosives, unapproved blades, or dangerous chemicals.
              </li>
              <li>
                <strong className="text-foreground">Stolen or Counterfeit Property:</strong> Stolen electronic devices, fake cadet insignia, or counterfeit epaulettes.
              </li>
            </ul>
            <p className="text-sm">
              Listings in violation are permanently removed, and the associated vendor account is suspended immediately.
            </p>
          </section>

          {/* Section 5: Safe Trading Obligations */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              5. Safe Trading Guidelines
            </h2>
            <p>
              All community members must observe these baseline precautions:
            </p>
            <ol className="space-y-1.5 pl-5 list-decimal text-sm leading-relaxed">
              <li>
                <strong className="text-foreground">Public Daytime Handover:</strong> Meet in well-lit public campus locations (such as the NMU Gate, Administrative Quadrangle, or Jetty Pavilion) during daylight hours.
              </li>
              <li>
                <strong className="text-foreground">Inspect Thoroughly Before Paying:</strong> Verify electronic gadgets, test charging ports, inspect uniform sizes, and inspect hostel rooms in person before releasing payment.
              </li>
              <li>
                <strong className="text-foreground">Accompanied Accommodation Visits:</strong> Never inspect hostel rooms alone. Always bring a course mate or colleague when viewing off-campus lodgings.
              </li>
            </ol>
          </section>

          {/* Section 6: Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              6. Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
            <p className="text-sm uppercase tracking-wide text-muted-foreground/90 font-mono text-xs">
              Notice: Platform Provided &quot;As Is&quot;
            </p>
            <p className="text-sm leading-relaxed">
              Jetty is provided &quot;as is&quot; without warranties of any kind, whether express or implied. In no event shall Jetty, its developers, or its volunteers be held liable for any direct, indirect, incidental, or consequential damages resulting from peer transactions, disputes between students and vendors, or third-party interactions.
            </p>
          </section>

          {/* Section 7: Account Deletion */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              7. Termination &amp; Self-Service Deletion
            </h2>
            <p>
              You may terminate your vendor account and remove all listings at any time by navigating to your profile settings and selecting &quot;Delete Account &amp; Listings.&quot; All associated records and media will be erased permanently from our databases.
            </p>
          </section>

          {/* Section 8: Contact */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              8. Contact &amp; Moderation
            </h2>
            <p>
              For legal inquiries, dispute reporting, or policy questions:
            </p>
            <div className="text-sm space-y-1 pt-1 font-mono text-xs">
              <p><span className="text-foreground font-semibold">Administrator:</span> Francis Naga</p>
              <p>
                <span className="text-foreground font-semibold">Email:</span>{' '}
                <a href="mailto:efobifrancis53@gmail.com" className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground">
                  efobifrancis53@gmail.com
                </a>
              </p>
              <p>
                <span className="text-foreground font-semibold">WhatsApp Desk:</span>{' '}
                <a
                  href={buildJettyTeamWhatsAppUrl('Hello Jetty Administration, I have an inquiry regarding the Terms of Service.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                >
                  +{JETTY_TEAM_PHONE_DISPLAY}
                </a>
              </p>
              <p><span className="text-foreground font-semibold">Campus Locality:</span> Nigeria Maritime University (Okerenkoko / Kurutie), Delta State, Nigeria</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <footer className="pt-8 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <Link
            href="/privacy"
            className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            Privacy Policy →
          </Link>
          <Link
            href="/safety"
            className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            Campus Safety Guidelines →
          </Link>
        </footer>
      </div>
    </article>
  )
}
