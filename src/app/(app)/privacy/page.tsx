import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Privacy Policy | Jetty NMU',
  description:
    'Privacy Policy and Google API User Data Policy disclosure for Jetty, the Nigeria Maritime University campus marketplace.',
  alternates: {
    canonical: 'https://jetty.francisnaga.site/privacy',
  },
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            How Jetty handles personal data, Google authentication, and user information across the Nigeria Maritime University community.
          </p>
        </header>

        {/* Document Content */}
        <div className="space-y-10 text-[15px] sm:text-base leading-[1.75] text-muted-foreground">
          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              1. Overview &amp; Scope
            </h2>
            <p>
              Jetty (&quot;we,&quot; &quot;our,&quot; or &quot;the platform&quot;) operates the campus directory and discovery marketplace at{' '}
              <a
                href="https://jetty.francisnaga.site"
                className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors font-medium"
              >
                jetty.francisnaga.site
              </a>
              . The platform is built specifically for students, cadets, faculty, and local merchants at Nigeria Maritime University (NMU), operating across the Okerenkoko permanent campus and Kurutie take-off campus in Delta State, Nigeria.
            </p>
            <p>
              This Privacy Policy explains how information is collected, used, and protected when you access Jetty, authenticate with Google, list items or services, or interact with campus sellers.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              2. Information Collected
            </h2>
            <p>
              The information we collect depends on how you interact with Jetty:
            </p>

            <div className="space-y-4 pt-1">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  A. Browsing Shoppers (No Tracking)
                </h3>
                <p className="mt-1 text-sm leading-relaxed">
                  Students and visitors can browse listings, view hostel accommodations, compare prices, and read safety advisories without creating an account or signing in. We do not track individual search histories, build marketing profiles, or use behavioral tracking cookies.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  B. Google OAuth 2.0 Profile Information
                </h3>
                <p className="mt-1 text-sm leading-relaxed">
                  When a vendor signs in using Google, we request access only to basic profile information under standard scopes (<code className="font-mono text-xs text-foreground">openid</code>, <code className="font-mono text-xs text-foreground">email</code>, <code className="font-mono text-xs text-foreground">profile</code>):
                </p>
                <ul className="mt-2 space-y-1.5 pl-5 list-disc text-sm">
                  <li>
                    <strong className="text-foreground">Full Name:</strong> Identifies your seller profile or administrative account.
                  </li>
                  <li>
                    <strong className="text-foreground">Email Address:</strong> Used strictly for authentication, account recovery, and essential security notifications.
                  </li>
                  <li>
                    <strong className="text-foreground">Profile Photo URL:</strong> Displayed optionally on your seller dashboard and storefront.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  C. Vendor Storefront &amp; Listings Data
                </h3>
                <p className="mt-1 text-sm leading-relaxed">
                  When you set up a vendor storefront or publish an item, room, or service listing, you provide:
                </p>
                <ul className="mt-2 space-y-1.5 pl-5 list-disc text-sm">
                  <li>Store name, description, and handle (<code className="font-mono text-xs text-foreground">@username</code>)</li>
                  <li>WhatsApp phone number (displayed publicly so buyers can reach you)</li>
                  <li>Campus zone (Okerenkoko, Kurutie, or Both)</li>
                  <li>Photographs of products, services, or accommodations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Google API User Data Policy Compliance */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              3. Google API User Data Policy &amp; Limited Use
            </h2>
            <p>
              Jetty&apos;s use and transfer of information received from Google APIs adheres strictly to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors font-medium"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements:
            </p>
            <ul className="space-y-2 pl-5 list-disc text-sm leading-relaxed">
              <li>
                <strong className="text-foreground">No Advertising Transfers:</strong> We never sell, rent, or transfer Google user data to advertising platforms, data brokers, or third-party marketing services.
              </li>
              <li>
                <strong className="text-foreground">No AI/ML Training:</strong> Google user data is not used to train, retrain, or improve generalized machine learning or artificial intelligence models.
              </li>
              <li>
                <strong className="text-foreground">Limited Human Access:</strong> No human reads your personal Google data unless required to resolve critical technical incidents, comply with applicable law, or with your explicit written consent for troubleshooting.
              </li>
              <li>
                <strong className="text-foreground">Single Functional Purpose:</strong> Google account data is utilized solely to provide authentication, maintain your merchant storefront, and protect against impersonation.
              </li>
            </ul>
          </section>

          {/* Section 4: How Information Is Used */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              4. How Information Is Used
            </h2>
            <p>
              Information gathered on Jetty is used solely for the following operational needs:
            </p>
            <ul className="space-y-1.5 pl-5 list-disc text-sm leading-relaxed">
              <li>Operating and maintaining the campus discovery directory.</li>
              <li>Authenticating vendors and preventing duplicate or fraudulent store setups.</li>
              <li>Enabling buyers to initiate peer-to-peer WhatsApp chats directly with sellers.</li>
              <li>Sending administrative alerts regarding listing approvals or moderation actions (with your permission).</li>
              <li>Investigating reports of scam attempts or prohibited items.</li>
            </ul>
          </section>

          {/* Section 5: Residential Privacy */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              5. Residential Privacy Protection
            </h2>
            <p>
              To protect students operating ventures from hostel accommodations, precise GPS coordinates are never published on student listings. Only broad campus indicators (e.g., Okerenkoko or Kurutie) and user-specified meeting points are displayed publicly.
            </p>
          </section>

          {/* Section 6: Data Retention & Deletion */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              6. Data Retention &amp; Self-Service Deletion
            </h2>
            <p>
              We retain personal data only for as long as your account remains active. You maintain full control over your data and may permanently delete your account, listings, and uploaded media at any time:
            </p>
            <ol className="space-y-1.5 pl-5 list-decimal text-sm leading-relaxed">
              <li>Sign in and open your <strong className="text-foreground">Profile</strong> or <strong className="text-foreground">Vendor Dashboard</strong>.</li>
              <li>Scroll to the <strong className="text-foreground">Danger Zone</strong> section.</li>
              <li>Click <strong className="text-foreground">&quot;Delete Account &amp; Listings&quot;</strong> and confirm.</li>
            </ol>
            <p className="text-sm">
              Upon confirmation, all profile information, product/service listings, and uploaded images are immediately and permanently erased from our databases and storage buckets. You may also contact us by email to request immediate manual erasure.
            </p>
          </section>

          {/* Section 7: Security */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              7. Security Architecture
            </h2>
            <p>
              All traffic to Jetty is encrypted using Transport Layer Security (HTTPS/TLS). Database access is strictly governed by Supabase Row-Level Security (RLS) policies, ensuring each authenticated user can only access and modify their own records.
            </p>
          </section>

          {/* Section 8: Contact */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              8. Contact &amp; Questions
            </h2>
            <p>
              For questions regarding this policy or data practices, contact:
            </p>
            <div className="text-sm space-y-1 pt-1 font-mono text-xs">
              <p><span className="text-foreground font-semibold">Lead Developer:</span> Francis Efobi</p>
              <p><span className="text-foreground font-semibold">Email:</span> <a href="mailto:efobifrancis53@gmail.com" className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground">efobifrancis53@gmail.com</a></p>
              <p><span className="text-foreground font-semibold">Institution:</span> Nigeria Maritime University, Delta State, Nigeria</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <footer className="pt-8 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <Link
            href="/terms"
            className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            Terms of Service →
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
