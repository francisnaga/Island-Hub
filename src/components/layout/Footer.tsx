import Link from 'next/link'
import { MapPin, ExternalLink } from 'lucide-react'
import { NagaLogo } from '@/components/brand/NagaLogo'
import { JettyMark } from '@/components/brand/JettyMark'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-10 space-y-6">
        {/* Compact Links Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="space-y-1.5">
            <Link
              href="/"
              aria-label="Jetty — NMU Campus Marketplace Home"
              className="inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-lg"
            >
              <JettyMark size={28} className="h-7 w-7 shrink-0" />
              <span className="text-lg font-bold tracking-tight text-foreground lowercase leading-none font-[family-name:var(--font-bricolage)]">
                jetty
              </span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>NMU Campus Marketplace · Okerenkoko &amp; Kurutie</span>
            </div>
          </div>

          {/* Minimal Navigation Links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-medium text-muted-foreground"
          >
            <Link href="/marketplace" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <Link href="/category/maritime-cadet-gear" className="hover:text-foreground transition-colors">
              Uniforms &amp; Kits
            </Link>
            <Link href="/housing" className="hover:text-foreground transition-colors">
              Lodge
            </Link>
            <Link href="/fresher-kit" className="hover:text-foreground transition-colors">
              Fresher Kit
            </Link>
            <Link href="/vendors" className="hover:text-foreground transition-colors">
              Vendors
            </Link>
            <Link href="/vendor/apply" className="hover:text-foreground transition-colors font-semibold">
              Sell on Jetty
            </Link>
            <Link href="/safety" className="hover:text-foreground transition-colors">
              Safety
            </Link>
          </nav>
        </div>

        {/* Clean Bottom Attribution Bar */}
        <div className="pt-5 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Jetty · NMU Okerenkoko &amp; Kurutie</p>

          <a
            href="https://francisnaga.site"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Built by</span>
            <NagaLogo size={14} className="text-foreground group-hover:text-primary transition-colors" />
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              Naga
            </span>
            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </footer>
  )
}
