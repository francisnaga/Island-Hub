import Link from 'next/link'
import { ShieldCheck, Store, MapPin } from 'lucide-react'
import { INITIAL_CATEGORIES } from '@/lib/marketplace-data'

const LAUNCH_CATEGORY_SLUGS = new Set([
  'maritime-cadet-gear',
  'electronics-gadgets',
  'books-stationery',
  'hostel-daily-essentials',
])

export function Footer() {
  const activeCategories = INITIAL_CATEGORIES.filter((cat) =>
    LAUNCH_CATEGORY_SLUGS.has(cat.slug)
  )

  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link
              href="/"
              aria-label="Jetty — NMU Campus Marketplace Home"
              className="inline-flex items-center gap-2.5 py-1 pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E] rounded-lg"
            >
              <img
                src="/jetty-mark.svg"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0"
              />
              <span className="text-xl font-semibold tracking-[0.02em] text-foreground lowercase leading-none">
                jetty
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The campus marketplace for Nigeria Maritime University (NMU), covering Okerenkoko and Kurutie. Browse cadet gear, electronics, books, and hostel essentials from verified local sellers.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
              <span>Okerenkoko &amp; Kurutie · Delta State</span>
            </div>
          </div>

          {/* Categories (Unified Taxonomy) */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Shop Categories
            </h2>
            <ul className="space-y-2 text-sm">
              {activeCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/marketplace"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  All Marketplace Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/fresher-kit"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  NMU Fresher Kit Checklist
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  Campus Services Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              For Vendors &amp; Sellers
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/vendor/apply"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors flex items-center gap-1.5 font-medium text-foreground"
                >
                  <Store className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link
                  href="/vendor/dashboard"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  Verified Vendor Storefronts
                </Link>
              </li>
              <li>
                <Link
                  href="/safety#vendor-guidelines"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  Vendor &amp; Photo Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety, Trust & Legal Policies */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Safety &amp; Legal Policies
            </h2>
            <div className="rounded-xl border border-border bg-muted/60 p-3.5 space-y-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                Direct Buyer–Seller Orders
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jetty connects buyers with approved vendors via WhatsApp. Confirm item size, condition, price, and availability before travelling or paying.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <li>
                <Link href="/safety#buyer-safety" className="hover:text-foreground underline-offset-2 hover:underline">
                  Safety &amp; Reporting
                </Link>
              </li>
              <li>
                <Link href="/safety#vendor-guidelines" className="hover:text-foreground underline-offset-2 hover:underline">
                  Vendor Guidelines
                </Link>
              </li>
              <li>
                <Link href="/safety#privacy-policy" className="hover:text-foreground underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/safety#terms-of-use" className="hover:text-foreground underline-offset-2 hover:underline">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <p>© {new Date().getFullYear()} Jetty · NMU Okerenkoko &amp; Kurutie.</p>
            <span className="text-border">·</span>
            <span className="font-medium text-foreground/80">Built by Naga</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/safety#privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/safety#terms-of-use" className="hover:text-foreground">
              Terms of Use
            </Link>
            <Link href="/safety#vendor-guidelines" className="hover:text-foreground">
              Vendor Guidelines
            </Link>
            <Link href="/safety#report" className="hover:text-foreground">
              Report a Listing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
