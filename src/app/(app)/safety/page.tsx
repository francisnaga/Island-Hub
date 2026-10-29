import Link from 'next/link'
import {
  MessageCircle,
  MapPin,
  AlertTriangle,
  BadgeCheck,
  Store,
  Flag,
} from 'lucide-react'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'

export default function SafetyAndHelpPage() {
  return (
    <div className="py-6 sm:py-10 md:py-12 min-w-0">
      <div className="container mx-auto max-w-4xl px-3.5 sm:px-4 space-y-6 sm:space-y-8 min-w-0">
        {/* Header (No Eyebrow Pill Slop) */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How Buying Works, Safety &amp; Policies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Jetty connects students at Nigeria Maritime University (NMU) across Okerenkoko and Kurutie with verified local vendors.
          </p>
        </div>

        {/* Step-by-step Buying Flow */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-5">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            1. The Jetty Buying Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A]">
                <BadgeCheck className="h-4 w-4" />
                Step 1: Browse &amp; Compare
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Search for safety boots, action rigs, electronics, or hostel supplies without creating an account.
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A]">
                <MessageCircle className="h-4 w-4" />
                Step 2: Message on WhatsApp
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tap <strong>Message Vendor on WhatsApp</strong> to open a prefilled chat with the product name, price, size, and quantity.
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A]">
                <MapPin className="h-4 w-4" />
                Step 3: Inspect &amp; Pay Directly
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confirm stock and agree on a campus pickup point or shop visit. Inspect the product in person before paying the seller directly.
              </p>
            </div>
          </div>
        </section>

        {/* Direct Payment & What Verification Means */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              Direct Vendor Payments (No Escrow)
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jetty is a product discovery and vendor contact platform. <strong>We do not collect, hold, or process buyer payments on the website.</strong>
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
              <li>Never send advance bank transfers to an unknown seller before seeing the item.</li>
              <li>Meet in well-known daytime locations on the NMU campus or established Okerenkoko shops.</li>
              <li>Always confirm stock availability on WhatsApp before walking to a pickup location.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BadgeCheck className="h-5 w-5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
              What the Verified Vendor Badge Means
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When a storefront shows <strong>Verified Vendor</strong>, it means the Jetty team has checked the seller&apos;s identity (such as student ID or local shop presence) and confirmed their WhatsApp contact details.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verification helps deter anonymous scammers, but it does not replace inspecting your item at pickup.
            </p>
          </section>
        </div>

        {/* Vendor Policies & Reporting */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                Report a Problem or Misleading Listing
              </h2>
              <p className="text-xs text-muted-foreground">
                Every product page and vendor storefront has a <strong>Report</strong> button. You can also submit a general platform report here.
              </p>
            </div>
            <div className="shrink-0">
              <ReportListingModal
                targetType="vendor"
                targetName="General Jetty Report"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>Want to become a verified seller on campus?</span>
            <Link
              href="/vendor/apply"
              className="inline-flex items-center gap-1.5 font-bold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline"
            >
              <Store className="h-3.5 w-3.5" />
              Apply for a Vendor Storefront →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
