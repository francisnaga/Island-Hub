'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Store, MapPin } from 'lucide-react'
import { INITIAL_CATEGORIES } from '@/lib/marketplace-data'

export function Footer() {
  const [nagaLogoLoaded, setNagaLogoLoaded] = useState(true)

  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 py-1 pr-2">
              <img
                src="/jetty-mark.svg"
                alt="Jetty"
                width={32}
                height={32}
                className="h-8 w-8 shrink-0"
              />
              <span className="text-xl font-semibold tracking-[0.02em] text-foreground lowercase leading-none">
                jetty
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The campus marketplace for Nigeria Maritime University (NMU), covering both Okerenkoko and Kurutie campuses. Buy &amp; sell cadet gear, find housing, and discover campus services.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
              <span>Okerenkoko &amp; Kurutie · Delta State</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Shop &amp; Explore
            </h3>
            <ul className="space-y-2 text-sm">
              {INITIAL_CATEGORIES.map((cat) => (
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
                  href="/services"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  Campus Services
                </Link>
              </li>
              <li>
                <Link
                  href="/housing"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  Housing &amp; Bedspaces
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              For Vendors &amp; Sellers
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/vendor/apply"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors flex items-center gap-1.5"
                >
                  <Store className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
                  Apply to Become a Vendor
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
                  Browse Verified Stores
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
            </ul>
          </div>

          {/* Buyer Safety */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Safety &amp; Policies
            </h3>
            <div className="rounded-xl border border-border bg-muted/60 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                Direct Buyer–Seller Orders
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jetty connects buyers with verified vendors via WhatsApp. Confirm item availability and inspect goods at pickup before completing payment.
              </p>
              <Link
                href="/safety"
                className="inline-block text-xs font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline pt-1"
              >
                Read Safety &amp; Buying Guide →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <p>© {new Date().getFullYear()} Jetty · NMU Okerenkoko &amp; Kurutie.</p>
            <span className="hidden sm:inline text-border">·</span>
            <div className="inline-flex items-center gap-2 text-muted-foreground/80">
              {nagaLogoLoaded && (
                <img
                  src="/naga-logo.svg"
                  alt="Naga"
                  className="h-5 w-auto opacity-80"
                  onError={() => setNagaLogoLoaded(false)}
                />
              )}
              <span>Built by Naga</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="hover:text-foreground">All Listings</Link>
            <Link href="/vendors" className="hover:text-foreground">Vendors</Link>
            <Link href="/safety" className="hover:text-foreground">Report an Issue</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
