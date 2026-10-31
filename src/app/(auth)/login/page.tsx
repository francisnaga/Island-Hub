import Link from 'next/link'
import { ArrowLeft, Store, ShieldCheck, Zap } from 'lucide-react'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { JettyMark } from '@/components/brand/JettyMark'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const sp = await searchParams
  const nextPath = sp.next || '/vendor/dashboard'

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip flex flex-col justify-center items-center bg-background px-4 py-10 sm:py-14 text-foreground">
      <div className="w-full max-w-sm space-y-5">
        {/* Top Back Link */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Marketplace</span>
          </Link>
          <span className="text-[11px] font-medium text-muted-foreground">NMU Campus</span>
        </div>

        {/* Linear-Grade Obsidian / Crisp Container */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <Link href="/" aria-label="Jetty Home" className="transition-transform hover:scale-105">
              <JettyMark size={44} className="h-11 w-11 shrink-0" />
            </Link>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-[family-name:var(--font-bricolage)]">
                Vendor Sign In
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Sign in with Google to create or manage your campus storefront. Buyers browse without an account.
              </p>
            </div>
          </div>

          {sp.error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">
              {sp.error === 'auth_callback_failed'
                ? 'Google authentication could not be completed. Please try again.'
                : sp.error}
            </div>
          )}

          {/* Google Sign In Only */}
          <div className="space-y-3 pt-1">
            <GoogleSignInButton nextPath={nextPath} label="Continue with Google" />
          </div>

          {/* Merchant Features Overview */}
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 space-y-2.5 text-xs">
            <p className="font-bold text-foreground text-[11px] uppercase tracking-wider">
              Storefront Features
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
                <span>Instant WhatsApp orders directly to your personal phone number</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
                <span>Verified seller badge &amp; top-tier featured listing placement</span>
              </li>
              <li className="flex items-start gap-2">
                <Store className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
                <span>Zero commission on sales — 100% of your earnings are yours</span>
              </li>
            </ul>
          </div>

          {/* Shopper Footnote */}
          <div className="pt-2 border-t border-border/70 text-center text-xs text-muted-foreground">
            <span>Just here to buy? </span>
            <Link
              href="/marketplace"
              className="font-bold text-foreground hover:underline transition-colors"
            >
              Browse items freely →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
