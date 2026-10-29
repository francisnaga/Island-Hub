import Link from 'next/link'
import {
  ShieldCheck,
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
    <div className="py-10 md:py-12">
      <div className="container mx-auto max-w-4xl px-4 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-900">
            <ShieldCheck className="h-4 w-4 text-blue-700" />
            NMU & Okerenkoko Buyer & Seller Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How Buying Works, Safety & Policies
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            IslandHub Marketplace connects students at Nigeria Maritime University (NMU) and the Okerenkoko community with verified local vendors. Please review how orders, payments, and verification work.
          </p>
        </div>

        {/* Step-by-step Buying Flow */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            1. The IslandHub Buying Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl bg-[#FAF9F6] border border-slate-200/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-800">
                <BadgeCheck className="h-4 w-4" />
                Step 1: Browse & Compare
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search for safety boots, action rigs, electronics, or hostel supplies without creating an account. Check product photos, sizes, stock status, and vendor verification.
              </p>
            </div>

            <div className="rounded-xl bg-[#FAF9F6] border border-slate-200/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-800">
                <MessageCircle className="h-4 w-4" />
                Step 2: Message on WhatsApp
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tap <strong>Message Vendor on WhatsApp</strong>. IslandHub opens a prefilled chat with the product name, price, selected size/colour, and quantity.
              </p>
            </div>

            <div className="rounded-xl bg-[#FAF9F6] border border-slate-200/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-800">
                <MapPin className="h-4 w-4" />
                Step 3: Inspect & Pay Directly
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm that the item is in stock and agree on a campus pickup point or shop visit. Inspect the product in person before completing payment directly to the seller.
              </p>
            </div>
          </div>
        </section>

        {/* Direct Payment & What Verification Means */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              Direct Vendor Payments (No Escrow)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              IslandHub is a product discovery and vendor contact platform. <strong>We do not collect, hold, or process buyer payments on the website.</strong>
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
              <li>Never send advance bank transfers to an unknown seller before seeing the item.</li>
              <li>Meet in well-known daytime locations on the NMU campus or established Okerenkoko shops.</li>
              <li>Always confirm stock availability on WhatsApp before walking to a pickup location.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <BadgeCheck className="h-5 w-5 text-blue-700 shrink-0" />
              What the Verified Vendor Badge Means
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a storefront shows <strong>Verified Vendor</strong>, it means the IslandHub team has checked the seller&apos;s identity (such as student ID or local shop presence) and confirmed their WhatsApp contact details.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verification helps deter anonymous scammers, but it does not replace inspecting your item at pickup. If a vendor misleads buyers or repeatedly lists unavailable items, their account will be suspended.
            </p>
          </section>
        </div>

        {/* Vendor Policies & Reporting */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                Report a Problem or Misleading Listing
              </h2>
              <p className="text-xs text-slate-600">
                Every product page and vendor storefront has a <strong>Report</strong> button. You can also submit a general platform report right here.
              </p>
            </div>
            <div className="shrink-0">
              <ReportListingModal
                targetType="vendor"
                targetName="General IslandHub Marketplace Report"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <span>Want to become a verified seller on campus?</span>
            <Link
              href="/vendor/apply"
              className="inline-flex items-center gap-1.5 font-bold text-blue-800 hover:underline"
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
