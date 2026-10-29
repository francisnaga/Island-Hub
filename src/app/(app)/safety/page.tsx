import Link from 'next/link'
import {
  MessageCircle,
  MapPin,
  AlertTriangle,
  BadgeCheck,
  Store,
  Flag,
  Camera,
  Lock,
  FileText,
} from 'lucide-react'
import { ReportListingModal } from '@/components/marketplace/ReportListingModal'

export default function SafetyAndHelpPage() {
  return (
    <div className="py-6 sm:py-10 md:py-12 min-w-0">
      <div className="container mx-auto max-w-4xl px-3.5 sm:px-4 space-y-6 sm:space-y-8 min-w-0">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Safety, Verification, Vendor Guidelines &amp; Legal Policies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Jetty connects students at Nigeria Maritime University (NMU) across Okerenkoko and Kurutie with approved local vendors. Review our buying rules, verification standards, privacy policy, and terms of use below.
          </p>
        </div>

        {/* Section 1: Buyer Safety */}
        <section
          id="buyer-safety"
          className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-5"
        >
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            1. Buyer Safety &amp; How Ordering Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A]">
                <BadgeCheck className="h-4 w-4" />
                Step 1: Browse &amp; Compare
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Search for safety boots, action rigs, electronics, or hostel supplies without creating an account. Check whether the seller is a physical shop, student seller, or campus pickup point.
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A]">
                <MessageCircle className="h-4 w-4" />
                Step 2: Confirm on WhatsApp
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confirm the item&apos;s exact size, condition, price, live photo, and current stock availability on WhatsApp before travelling to pick it up.
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#0F6E6E] dark:text-[#E8B84A]">
                <MapPin className="h-4 w-4" />
                Step 3: Inspect &amp; Pay Directly
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Meet at the seller&apos;s shop or agreed campus landmark, inspect the product in person, and pay the vendor directly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-border bg-background p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                Direct Vendor Payments (No Escrow)
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jetty is a discovery and vendor directory platform. <strong>We do not collect, hold, or process buyer payments on the website.</strong> Never send advance bank transfers to an unknown seller before inspecting the item in person.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <BadgeCheck className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                What the Verified Vendor Badge Means
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Only approved vendors can publish listings on Jetty. A <strong>Verified Vendor</strong> badge means the Jetty team has checked the seller&apos;s student status or local shop presence in Okerenkoko/Kurutie and confirmed their WhatsApp contact number.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Vendor Guidelines & Photo Integrity */}
        <section
          id="vendor-guidelines"
          className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#0F6E6E] dark:text-[#E8B84A]" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              2. Vendor Guidelines &amp; Product Photo Rules
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            To maintain buyer trust across NMU, all vendors must adhere to the following listing and storefront standards:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
            <li>
              <strong className="text-foreground">Accurate Product Photos Required:</strong> Uploaded images must show the actual item being sold, including its true colour, model, pack quantity, and included accessories. Unrelated stock photos (such as fashion sneakers for safety boots or suits for action rigs) are strictly prohibited and removed by moderators.
            </li>
            <li>
              <strong className="text-foreground">Truthful Stock &amp; Pricing:</strong> Keep your Naira prices, available sizes, and stock status (<em>Available</em>, <em>Low Stock</em>, or <em>Out of Stock</em>) accurate. Listings not re-confirmed within 14 days display a stock-check reminder to buyers.
            </li>
            <li>
              <strong className="text-foreground">Honest Seller Type &amp; Location:</strong> Clearly indicate whether you operate a physical shop, campus pickup point, student hostel business, or delivery-only service. Always confirm your map pin before saving.
            </li>
          </ul>
        </section>

        {/* Section 3: Privacy Policy */}
        <section
          id="privacy-policy"
          className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#0F6E6E] dark:text-[#E8B84A]" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              3. Privacy Policy
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Buyers:</strong> You do not need an account to browse or search Jetty. When you tap a WhatsApp button, you open a direct chat with the vendor on WhatsApp using your own device.
            </p>
            <p>
              <strong className="text-foreground">Vendor Identity &amp; Contact Data:</strong> When you apply as a vendor via Google Sign-In, we store your name, email address, shop description, department or business info, and the WhatsApp business number you choose to publish for buyer inquiries. We do not store copies of government or student ID cards on public servers.
            </p>
            <p>
              <strong className="text-foreground">Location Coordinates &amp; Residence Privacy:</strong> Vendors control their location visibility. If you select <em>General Area Only</em> (recommended for student hostel sellers) or <em>Hidden</em>, or if you operate as <em>Delivery Only</em>, your exact GPS coordinates (`latitude` and `longitude`) are stripped on the server and never exposed to public browsers.
            </p>
          </div>
        </section>

        {/* Section 4: Terms of Use */}
        <section
          id="terms-of-use"
          className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0F6E6E] dark:text-[#E8B84A]" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              4. Terms of Use
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Jetty is an independent campus marketplace directory serving the Nigeria Maritime University (NMU) community in Okerenkoko and Kurutie. Jetty is not a party to any sale, payment, delivery, or warranty agreement between buyers and sellers.
            </p>
            <p>
              Prohibited items include counterfeit identification, exam malpractice materials, weapons, illegal substances, and unverified accommodation/agent fee schemes. Listings or storefronts thatreceive credible reports of misrepresentation or price gouging may be hidden pending administrator review and vendor appeal.
            </p>
          </div>
        </section>

        {/* Section 5: Reporting */}
        <section
          id="report"
          className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                5. Report a Problem or Misleading Listing
              </h2>
              <p className="text-xs text-muted-foreground">
                Every product page and vendor storefront includes a <strong>Report</strong> button. Credible reports are reviewed by an administrator with an appeal path for vendors.
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
              Become a Vendor →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
