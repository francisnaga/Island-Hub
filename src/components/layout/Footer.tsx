'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Store,
  MapPin,
  ExternalLink,
  Heart,
  Sparkles,
  MessageCircle,
  Code2,
  Check,
} from 'lucide-react'
import { INITIAL_CATEGORIES } from '@/lib/marketplace-data'

const LAUNCH_CATEGORY_SLUGS = new Set([
  'maritime-cadet-gear',
  'electronics-gadgets',
  'books-stationery',
  'hostel-daily-essentials',
])

const TIP_AMOUNTS = [
  { label: '₦1,000', value: '₦1,000', note: 'Buy Naga a cold drink' },
  { label: '₦2,500', value: '₦2,500', note: 'Fuel late-night coding' },
  { label: '₦5,000', value: '₦5,000', note: 'Support Jetty server & updates' },
  { label: '₦10,000+', value: 'a custom tip', note: 'Champion campus innovation' },
]

export function Footer() {
  const [tipOpen, setTipOpen] = useState(false)
  const [selectedTip, setSelectedTip] = useState(TIP_AMOUNTS[1])

  const activeCategories = INITIAL_CATEGORIES.filter((cat) =>
    LAUNCH_CATEGORY_SLUGS.has(cat.slug)
  )

  const tipWhatsAppUrl = `https://wa.me/2349130436032?text=${encodeURIComponent(
    `Hi Francis (Naga)! 👋 I just used Jetty Marketplace and want to send you ${selectedTip.value} (${selectedTip.note}) to support your work. Drop your account details!`
  )}`

  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12 space-y-10">
        {/* 1. Prominent Developer Spotlight & Tip Card — First thing visitors see in Footer */}
        <div className="relative overflow-hidden rounded-2xl border border-[#0F6E6E]/25 bg-gradient-to-br from-[#0F2438] via-[#122C44] to-[#0A3D3D] text-white p-5 sm:p-7 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Developer Identity */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
              <a
                href="https://francisnaga.site"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Francis Naga Portfolio — francisnaga.site"
                className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-[#E8B84A] hover:bg-white/15 transition-colors shadow-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  aria-hidden="true"
                >
                  <path d="M16 16H38V48L58 74L42 84H16V16Z" />
                  <path d="M84 84H62V52L42 26L58 16H84V84Z" />
                </svg>
              </a>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8B84A]/20 border border-[#E8B84A]/40 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#E8B84A]">
                    <Code2 className="h-3 w-3" />
                    Built by Naga
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    Marine Engineering, NMU · Software Developer
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Designed &amp; engineered by{' '}
                  <a
                    href="https://francisnaga.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[#E8B84A]/70 underline-offset-4 hover:text-[#E8B84A] transition-colors"
                  >
                    Francis Naga
                  </a>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Building fast, practical digital products for campus communities and modern businesses. Explore my work, hire me for a project, or send a tip to support Jetty.
                </p>
              </div>
            </div>

            {/* Fast Developer Actions: Portfolio Link + Tip Button */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setTipOpen((prev) => !prev)}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-[#E8B84A] hover:bg-[#dca938] px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 transition-all shadow-xs cursor-pointer"
              >
                <Heart className="h-4 w-4 fill-slate-950 text-slate-950 shrink-0" />
                <span>Tip the Developer</span>
              </button>

              <a
                href="https://francisnaga.site"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                <span>francisnaga.site</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#E8B84A] shrink-0" />
              </a>
            </div>
          </div>

          {/* Interactive Expandable Tip Bar */}
          {tipOpen && (
            <div className="mt-5 pt-5 border-t border-white/15 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8B84A]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Select a tip amount to support Francis Naga:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {TIP_AMOUNTS.map((amt) => {
                    const active = selectedTip.label === amt.label
                    return (
                      <button
                        key={amt.label}
                        type="button"
                        onClick={() => setSelectedTip(amt)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#E8B84A] text-slate-950 shadow-2xs'
                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                        }`}
                      >
                        {active && <Check className="h-3 w-3 shrink-0" />}
                        <span>{amt.label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-slate-300">
                  {selectedTip.note} · Direct transfer via WhatsApp (zero platform cut).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <a
                  href={tipWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F9D55] hover:bg-[#198246] px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>Send {selectedTip.label} Tip on WhatsApp</span>
                </a>
                <a
                  href="https://francisnaga.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <span>View Full Portfolio</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 2. Clean 4-Column Marketplace Navigation Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
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
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The campus marketplace for Nigeria Maritime University (NMU). Compare verified sellers across Okerenkoko and Kurutie and order directly on WhatsApp.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
              <MapPin className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
              <span>Okerenkoko &amp; Kurutie · Delta State, Nigeria</span>
            </div>
          </div>

          {/* Categories (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              Marketplace
            </h3>
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
            </ul>
          </div>

          {/* For Vendors (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
              For Vendors
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/vendor/apply"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors inline-flex items-center gap-1.5 font-medium text-foreground"
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
                  Verified Storefronts
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
                >
                  Campus Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Policies (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Safety &amp; Policies
            </h3>
            <div className="rounded-xl border border-border bg-muted/50 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                Direct WhatsApp Orders
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confirm item size, condition, and campus pickup landmark with the seller before paying.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              <Link href="/safety#buyer-safety" className="hover:text-foreground">
                Buyer Safety
              </Link>
              <Link href="/safety#vendor-guidelines" className="hover:text-foreground">
                Vendor Rules
              </Link>
              <Link href="/safety#privacy-policy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/safety#terms-of-use" className="hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Clean Bottom Attribution Bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Jetty Marketplace · NMU Okerenkoko &amp; Kurutie.</p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://francisnaga.site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                fill="currentColor"
                className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A]"
                aria-hidden="true"
              >
                <path d="M16 16H38V48L58 74L42 84H16V16Z" />
                <path d="M84 84H62V52L42 26L58 16H84V84Z" />
              </svg>
              <span>Built by Naga</span>
              <span className="text-muted-foreground font-normal">(francisnaga.site)</span>
              <ExternalLink className="h-3 w-3 opacity-75" />
            </a>

            <span className="text-border">·</span>

            <button
              type="button"
              onClick={() => setTipOpen(true)}
              className="inline-flex items-center gap-1 font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline cursor-pointer"
            >
              <Heart className="h-3 w-3 fill-current" />
              <span>Tip Developer</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
