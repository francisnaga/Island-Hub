import Link from 'next/link'
import { ShieldCheck, Lock, Eye, Trash2, ArrowLeft, Mail, FileText } from 'lucide-react'

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
    <div className="py-8 sm:py-12 min-w-0">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8 min-w-0">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/20 px-3 py-1 text-xs font-bold text-[#0F6E6E] dark:text-[#22D3EE]">
            <Lock className="h-3.5 w-3.5" />
            <span>Official Legal Disclosure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Effective Date: {lastUpdated} · Applicable to Jetty (jetty.francisnaga.site)
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-foreground/90">
          {/* Section 1: Introduction */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>1. Introduction &amp; Scope</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jetty (&quot;we,&quot; &quot;our,&quot; or &quot;the platform&quot;) operates the campus marketplace located at{' '}
              <a href="https://jetty.francisnaga.site" className="text-[#0F6E6E] dark:text-[#22D3EE] font-semibold underline">
                https://jetty.francisnaga.site
              </a>
              , serving students, cadets, faculty, and local vendors of Nigeria Maritime University (NMU) across the Okerenkoko permanent campus and Kurutie take-off campus in Delta State, Nigeria.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We respect your privacy and are committed to protecting any personal data you share with us. This Privacy Policy details how we collect, use, disclose, and safeguard your personal information when you use our web application, authenticate via Google OAuth, list products or services, or interact with other campus users.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              2. Information We Collect
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect information in the following ways depending on how you interact with Jetty:
            </p>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <b className="text-foreground block">A. Browsing Cadets &amp; Shoppers (Zero Tracking)</b>
                <p className="text-xs text-muted-foreground">
                  Students and visitors can browse listings, compare prices, read safety tips, and inspect hostels without creating an account or logging in. We do not track individual search histories, build consumer marketing profiles, or use behavioral tracking cookies.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <b className="text-foreground block">B. Information Received via Google OAuth 2.0</b>
                <p className="text-xs text-muted-foreground">
                  When a seller or vendor signs in using Google, we request access only to basic profile information under standard scopes (<code className="font-mono text-xs">openid</code>, <code className="font-mono text-xs">email</code>, <code className="font-mono text-xs">profile</code>):
                </p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pt-1">
                  <li><strong>Full Name:</strong> Used to identify your seller profile or store administrator.</li>
                  <li><strong>Email Address:</strong> Used strictly for account authentication, passwordless recovery, and security alerts.</li>
                  <li><strong>Profile Picture URL:</strong> Used optionally to display your avatar or store profile image.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <b className="text-foreground block">C. Vendor Storefront &amp; Listing Information</b>
                <p className="text-xs text-muted-foreground">
                  When you register a store or publish a product, room, or service listing, you provide:
                </p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pt-1">
                  <li><strong>Store Name &amp; Description:</strong> Displayed on your public storefront.</li>
                  <li><strong>WhatsApp Phone Number:</strong> Displayed on listings so prospective student buyers can contact you directly.</li>
                  <li><strong>Campus Location:</strong> Your campus zone (e.g., Okerenkoko, Kurutie, or Both).</li>
                  <li><strong>Product &amp; Room Photographs:</strong> User-uploaded images illustrating goods, services, or accommodations.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Google API User Data Policy Compliance (Crucial for Verification) */}
          <section className="space-y-4 rounded-2xl border-2 border-[#0F6E6E]/40 bg-[#E6F2F2]/30 dark:bg-[#132A2A]/40 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                3. Google API Services User Data Policy &amp; Limited Use Disclosure
              </h2>
            </div>
            
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              Jetty&apos;s use and transfer to any other app of information received from Google APIs adheres strictly to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F6E6E] dark:text-[#22D3EE] font-bold underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements:
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-1">
              <li>
                <strong>No Transfer for Advertising:</strong> We do not sell, rent, or transfer your Google user data to third-party ad networks, data brokers, or marketing platforms.
              </li>
              <li>
                <strong>No Transfer for AI/ML Training:</strong> We do not use Google user data to train, retrain, or fine-tune generalized machine learning or artificial intelligence models.
              </li>
              <li>
                <strong>Human Access Limitations:</strong> No human employees or developers read your personal Google data unless required to resolve critical security incidents, comply with applicable Nigerian law, or when you give explicit prior consent for troubleshooting.
              </li>
              <li>
                <strong>Strict Internal Purpose:</strong> Google user data is utilized solely to facilitate authentication, provide user-facing campus marketplace functionality, and maintain account integrity.
              </li>
            </ul>
          </section>

          {/* Section 4: How We Use Your Data */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              4. How We Use Collected Information
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <li>To provide, maintain, and secure the Jetty campus marketplace.</li>
              <li>To authenticate store owners and prevent impersonation or fraudulent listings.</li>
              <li>To display vendor storefronts and facilitate peer-to-peer communication between cadets and campus merchants over WhatsApp.</li>
              <li>To dispatch essential push notifications regarding listing approvals, policy violations, or moderation status (only if you subscribe).</li>
              <li>To prevent fraud, advance-fee rental scams, and unauthorized commercial exploitation.</li>
            </ul>
          </section>

          {/* Section 5: Location Data Protection */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>5. Residential Coordinates Protection</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To safeguard students operating small ventures from campus residential halls, precise GPS coordinates (<code className="font-mono text-xs">latitude</code> &amp; <code className="font-mono text-xs">longitude</code>) are automatically stripped on the server unless the vendor explicitly designates an authorized commercial public storefront. Private hostel room locations are never published or accessible to public clients.
            </p>
          </section>

          {/* Section 6: Data Retention & Account Deletion */}
          <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                6. Data Retention &amp; User Account Deletion
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your personal information only for as long as your account remains active or as needed to provide you with marketplace services.
            </p>
            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2">
              <b className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-300 block">
                How to Delete Your Data at Any Time:
              </b>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You retain full sovereignty over your data. You can permanently delete your vendor account, profile information, and all associated product/service listings directly inside the app:
              </p>
              <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 pl-1">
                <li>Navigate to your <strong>Profile</strong> or <strong>Vendor Dashboard Settings</strong>.</li>
                <li>Scroll to the <strong>Danger Zone</strong> section.</li>
                <li>Click <strong>&quot;Delete Account &amp; Listings&quot;</strong> and confirm.</li>
              </ol>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Upon confirmation, all profile records, active listings, and associated uploaded media are immediately and permanently erased from our primary databases and storage buckets. You may also email{' '}
                <a href="mailto:efobifrancis53@gmail.com" className="font-semibold text-red-700 dark:text-red-300 underline">
                  efobifrancis53@gmail.com
                </a>{' '}
                to request manual deletion.
              </p>
            </div>
          </section>

          {/* Section 7: Security Measures */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              7. Security Architecture
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jetty is served exclusively over Transport Layer Security (HTTPS/SSL). All database interactions are protected via Supabase Enterprise Row-Level Security (RLS) policies, ensuring that only authenticated resource owners can modify their respective stores or product listings.
            </p>
          </section>

          {/* Section 8: Contact Information */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>8. Contact Information</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our compliance with the Google API Services User Data Policy, please contact our administrator:
            </p>
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3.5 rounded-xl border border-border">
              <p><strong className="text-foreground">Administrator:</strong> Francis Efobi (Jetty Lead Developer)</p>
              <p><strong className="text-foreground">Official Email:</strong> <a href="mailto:efobifrancis53@gmail.com" className="text-[#0F6E6E] dark:text-[#22D3EE] font-medium underline">efobifrancis53@gmail.com</a></p>
              <p><strong className="text-foreground">Campus Locality:</strong> Nigeria Maritime University, Okerenkoko &amp; Kurutie Campuses, Delta State, Nigeria</p>
              <p><strong className="text-foreground">Website:</strong> <a href="https://jetty.francisnaga.site" className="text-[#0F6E6E] dark:text-[#22D3EE] font-medium underline">https://jetty.francisnaga.site</a></p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground underline">
            Terms of Service →
          </Link>
          <Link href="/safety" className="hover:text-foreground underline">
            Campus Safety &amp; Trust →
          </Link>
        </div>
      </div>
    </div>
  )
}
