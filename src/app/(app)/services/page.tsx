import Link from 'next/link'
import {
  Wrench,
  Scissors,
  Shirt,
  BookOpen,
  Camera,
  Printer,
  Utensils,
  Store,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { getPublicVendors } from '@/lib/queries'
import { VendorCard } from '@/components/cards/VendorCard'

export const dynamic = 'force-dynamic'

const serviceCategories = [
  {
    id: 'tailoring',
    icon: Shirt,
    name: 'Uniform Tailoring & Alterations',
    description:
      'Cadet uniform alterations, shoulder board stitching, badge attachment, and custom fittings around Okerenkoko & Kurutie.',
  },
  {
    id: 'printing',
    icon: Printer,
    name: 'Printing, Photocopy & Binding',
    description:
      'Course handouts, engineering lab reports, assignment printing, and project spiral binding.',
  },
  {
    id: 'laundry',
    icon: Wrench,
    name: 'Laundry & Uniform Pressing',
    description:
      'Washing, starching, and ironing for white and navy cadet rigs and everyday hostel wear.',
  },
  {
    id: 'barbing',
    icon: Scissors,
    name: 'Barbing & Hairdressing',
    description:
      'Regulation cadet haircuts, trims, and hair braiding near campus hostels.',
  },
  {
    id: 'photography',
    icon: Camera,
    name: 'Passport Photos & ID Cards',
    description:
      'Clearance passport photographs in cadet uniform and event photography.',
  },
  {
    id: 'food',
    icon: Utensils,
    name: 'Cooked Meals & Campus Catering',
    description:
      'Verified campus meal providers and food delivery across Okerenkoko and Kurutie.',
  },
  {
    id: 'tutoring',
    icon: BookOpen,
    name: 'Peer Tutoring & Technical Drawing Help',
    description:
      'Study support for 100L–300L Marine Engineering, Nautical Science, and Maritime Transport courses.',
  },
]

export default async function ServicesPage() {
  const verifiedVendors = await getPublicVendors({ verifiedOnly: true })

  return (
    <div className="min-w-0">
      {/* Header */}
      <section className="border-b border-border bg-card py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Campus Services around NMU
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Jetty only publishes service providers whose identity, campus location, and WhatsApp contact details have been verified. We do not display unverified phone numbers.
            </p>
            <div className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Verification policy:</strong> Are you a tailor, barber, print operator, or laundry provider in Okerenkoko or Kurutie? Apply below for free verification to list your service here.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Verified Stores Offering Campus Supplies & Support */}
      {verifiedVendors.length > 0 && (
        <section className="py-6 sm:py-10 border-b border-border">
          <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Verified Campus Storefronts ({verifiedVendors.length})
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Approved sellers currently active in Okerenkoko &amp; Kurutie
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {verifiedVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service Categories Open for Provider Verification */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Service Categories Open for Provider Onboarding
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Providers in these categories can apply for free identity &amp; WhatsApp verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {serviceCategories.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0"
                >
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0F6E6E] dark:text-[#E8B84A] shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Onboarding providers
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">{service.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/vendor/apply"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 text-xs font-semibold text-foreground hover:border-[#0F6E6E] hover:bg-[#E6F2F2] hover:text-[#0A4F4F] dark:hover:bg-[#132A2A] dark:hover:text-white transition-colors"
                  >
                    <Store className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                    Apply to List This Service
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Offer your service CTA */}
      <section className="py-8 sm:py-10 border-t border-border bg-card">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Provide a service in Okerenkoko or Kurutie?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                Complete our free vendor verification so NMU students can find your shop or campus pickup point and contact you directly on WhatsApp.
              </p>
            </div>
            <Link
              href="/vendor/apply"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F6E6E] px-5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0A4F4F] transition-colors shrink-0"
            >
              <Store className="h-4 w-4" />
              Become a Vendor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
