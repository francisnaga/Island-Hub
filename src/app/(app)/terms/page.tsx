import Link from 'next/link'
import { FileText, ShieldCheck, AlertTriangle, Scale, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
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
            <Scale className="h-3.5 w-3.5" />
            <span>User Agreement &amp; Platform Rules</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Effective Date: {lastUpdated} · Applicable to Jetty (jetty.francisnaga.site)
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-foreground/90">
          {/* Section 1: Acceptance & Community Scope */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>1. Acceptance of Terms &amp; Scope</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of Jetty (&quot;we,&quot; &quot;our,&quot; or &quot;the platform&quot;) accessible at{' '}
              <a href="https://jetty.francisnaga.site" className="text-[#0F6E6E] dark:text-[#22D3EE] font-semibold underline">
                https://jetty.francisnaga.site
              </a>
              . Jetty is designed specifically for students, cadets, staff, and local vendors connected with Nigeria Maritime University (NMU) operating across the Okerenkoko permanent campus and Kurutie take-off campus in Delta State, Nigeria.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing, browsing, registering for an account, or listing any product, service, or accommodation on Jetty, you confirm that you have read, understood, and agree to be legally bound by these Terms and our companion{' '}
              <Link href="/privacy" className="text-[#0F6E6E] dark:text-[#22D3EE] font-semibold underline">
                Privacy Policy
              </Link>
              . If you do not agree to these terms, you must discontinue using Jetty immediately.
            </p>
          </section>

          {/* Section 2: Platform Nature & Non-Custodial Architecture */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>2. Nature of Platform (Directory &amp; Discovery Only)</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jetty operates strictly as an <strong className="text-foreground">online directory and peer discovery platform</strong>. Jetty is NOT an online retailer, broker, escrow agent, payment processor, or auction house.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-1.5">
                <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#0F6E6E] dark:text-[#22D3EE]" />
                  Direct Peer Interaction
                </p>
                <p className="text-xs text-muted-foreground leading-normal">
                  Buyers contact sellers and service providers directly via WhatsApp or phone. No intermediary takes a commission or intercepts messages.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-1.5">
                <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#0F6E6E] dark:text-[#22D3EE]" />
                  Physical Campus Handover
                </p>
                <p className="text-xs text-muted-foreground leading-normal">
                  All transactions and payments take place in person after physical inspection of items at verified campus landmarks.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              Jetty is not a party to any contract, agreement, transaction, or dispute between buyers and sellers. We do not hold funds in custody, handle bank transfers, or guarantee delivery or product conditions.
            </p>
          </section>

          {/* Section 3: Authentication & Accounts */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>3. User Accounts &amp; Google Sign-In</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browsing items, rooms, services, and vendor storefronts on Jetty requires no account. Creating a vendor storefront or posting listings requires authentication through Google OAuth.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Accurate Information:</strong> You agree to provide truthful, accurate, and current information when creating a vendor profile, including your authentic WhatsApp business phone number and campus location.
              </li>
              <li>
                <strong className="text-foreground">Account Security:</strong> You are responsible for safeguarding your Google account credentials and for any listings or modifications made under your account.
              </li>
              <li>
                <strong className="text-foreground">One Merchant, One Storefront:</strong> Vendors may not create multiple duplicate profiles to circumvent moderation policies or artificial rank inflation.
              </li>
            </ul>
          </section>

          {/* Section 4: Prohibited Items & Code of Conduct */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span>4. Prohibited Items &amp; Marketplace Safety Rules</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To safeguard NMU cadets and campus residents, the following items and activities are strictly prohibited on Jetty:
            </p>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2 text-xs sm:text-sm text-foreground">
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Advance Payment Solicitations:</strong> Any listing or seller demanding “inspection fees,” “commitment deposits,” or “delivery fares” prior to in-person meeting.
                </li>
                <li>
                  <strong className="text-foreground">Academic Dishonesty:</strong> Selling exam questions, leaked assessments, completed assignments, or unauthorized academic materials.
                </li>
                <li>
                  <strong className="text-foreground">Controlled Substances &amp; Alcohol:</strong> Narcotics, unapproved pharmaceutical drugs, prescription medications, or illegal contraband.
                </li>
                <li>
                  <strong className="text-foreground">Weapons &amp; Hazardous Goods:</strong> Firearms, ammunition, knives (except recognized maritime utility tools), explosives, or hazardous chemicals.
                </li>
                <li>
                  <strong className="text-foreground">Counterfeit &amp; Stolen Property:</strong> Counterfeit maritime epaulettes, stolen gadgets, or unauthorized identity cards.
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Violations will result in immediate permanent account suspension, removal of all listings, and referral to NMU campus security and law enforcement where appropriate.
            </p>
          </section>

          {/* Section 5: Safe Trading Guidelines */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>5. Safe In-Person Trading Obligations</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All buyers and sellers agree to follow our mandatory campus safety standards:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Public Daylight Meetings:</strong> Meet only at well-populated public campus landmarks (e.g., NMU Gate, Administrative Quadrangle, Campus Cafeteria, or Designated Jetty Waiting Pavilion) during daylight hours.
              </li>
              <li>
                <strong className="text-foreground">Physical Inspection Before Payment:</strong> Thoroughly test and examine electrical gadgets, uniform fits, boot sizes, and room premises before transferring or handing over any money.
              </li>
              <li>
                <strong className="text-foreground">Accompanied Viewings:</strong> For housing and lodge viewings, students are strongly advised to inspect properties in pairs or groups.
              </li>
            </ol>
          </section>

          {/* Section 6: Limitation of Liability */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>6. Disclaimer of Warranties &amp; Limitation of Liability</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              JETTY IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              IN NO EVENT SHALL JETTY, ITS DEVELOPERS, ADMINISTRATORS, OR VOLUNTEERS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM, TRANSACTIONS CONDUCTED WITH OTHER USERS, LOSS OF DATA, OR INABILITY TO ACCESS THE SERVICE.
            </p>
          </section>

          {/* Section 7: Account Deletion & Termination */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>7. Account Termination &amp; Data Deletion</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users may terminate their account at any time. When logged in, navigate to{' '}
              <Link href="/profile" className="text-[#0F6E6E] dark:text-[#22D3EE] font-semibold underline">
                Profile &gt; Danger Zone
              </Link>{' '}
              and click <strong className="text-foreground">&quot;Delete Account&quot;</strong> to permanently wipe your profile, store listings, and uploaded images. You may also request administrative deletion at{' '}
              <a href="mailto:efobifrancis53@gmail.com" className="text-[#0F6E6E] dark:text-[#22D3EE] font-semibold underline">
                efobifrancis53@gmail.com
              </a>
              .
            </p>
          </section>

          {/* Section 8: Governing Law & Contact */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#0F6E6E] dark:text-[#22D3EE]" />
              <span>8. Contact Information &amp; Moderation Desk</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For legal inquiries, dispute reporting, copyright notices, or questions regarding these Terms, contact our platform administration:
            </p>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs sm:text-sm space-y-1.5">
              <p>
                <strong className="text-foreground">Platform Administrator:</strong> Francis Naga
              </p>
              <p>
                <strong className="text-foreground">Official Email:</strong>{' '}
                <a href="mailto:efobifrancis53@gmail.com" className="text-[#0F6E6E] dark:text-[#22D3EE] font-semibold underline">
                  efobifrancis53@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-foreground">WhatsApp Moderation Desk:</strong>{' '}
                <a
                  href={buildJettyTeamWhatsAppUrl('Hello Jetty Administration, I have an inquiry regarding the Terms of Service.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0F6E6E] dark:text-[#22D3EE] font-semibold underline"
                >
                  +{JETTY_TEAM_PHONE_DISPLAY}
                </a>
              </p>
              <p>
                <strong className="text-foreground">Community Location:</strong> Nigeria Maritime University (Okerenkoko / Kurutie), Delta State, Nigeria
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
