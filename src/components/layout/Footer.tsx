import Link from 'next/link'
import { Anchor, ShieldCheck, Store, MapPin } from 'lucide-react'
import { INITIAL_CATEGORIES } from '@/lib/marketplace-data'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A8A] text-white">
                <Anchor className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                IslandHub Marketplace
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed">
              Campus & community marketplace for Nigeria Maritime University (NMU), Okerenkoko, Warri South West LGA, Delta State.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <MapPin className="h-3.5 w-3.5 text-blue-700 shrink-0" />
              <span>Okerenkoko & Kurutie, Delta State</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Shop by Category
            </h3>
            <ul className="space-y-2 text-sm">
              {INITIAL_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-blue-800 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              For Vendors & Sellers
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/vendor/apply" className="hover:text-blue-800 transition-colors flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-blue-700" />
                  Apply to Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-blue-800 transition-colors">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="hover:text-blue-800 transition-colors">
                  Browse Verified Stores
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-blue-800 transition-colors">
                  Switch Consumer / Vendor Mode
                </Link>
              </li>
            </ul>
          </div>

          {/* Buyer Safety */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Safety & Policies
            </h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
                Direct Buyer–Seller Orders
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                IslandHub connects buyers with vendors via WhatsApp. Confirm item availability and inspect goods at pickup before completing payment.
              </p>
              <Link
                href="/safety"
                className="inline-block text-xs font-semibold text-blue-800 hover:underline pt-1"
              >
                Read Safety & Buying Guide →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} IslandHub Marketplace · Built for NMU Okerenkoko.</p>
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="hover:text-slate-900">All Listings</Link>
            <Link href="/vendors" className="hover:text-slate-900">Vendors</Link>
            <Link href="/safety" className="hover:text-slate-900">Report an Issue</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
