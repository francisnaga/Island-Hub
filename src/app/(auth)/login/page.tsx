import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { EmailSignInForm } from '@/components/auth/EmailSignInForm'
import { JettyMark } from '@/components/brand/JettyMark'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const sp = await searchParams
  const nextPath = sp.next || '/vendor/dashboard'

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip flex flex-col justify-center items-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-sm space-y-5">
        {/* Top Navigation Back Link */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace</span>
          </Link>
          <span className="text-muted-foreground">NMU Campus</span>
        </div>

        {/* Clean, Modern Linear-Grade Auth Container */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <Link href="/" aria-label="Jetty Home" className="transition-transform hover:scale-105">
              <JettyMark size={42} className="h-10.5 w-10.5 shrink-0" />
            </Link>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Vendor Portal
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Sign in to manage your storefront catalogue, prices, and stock across Okerenkoko &amp; Kurutie.
              </p>
            </div>
          </div>

          {sp.error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">
              {sp.error === 'auth_callback_failed'
                ? 'Authentication could not be completed. Please try with email link or ensure Google OAuth is configured in Supabase.'
                : sp.error}
            </div>
          )}

          {/* Sign In Options */}
          <div className="space-y-3.5">
            <GoogleSignInButton nextPath={nextPath} label="Continue with Google" />

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-border" />
              <span className="bg-card px-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider relative">
                or email link
              </span>
            </div>

            <EmailSignInForm nextPath={nextPath} />
          </div>

          {/* Understated Merchant Capabilities */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-2 text-xs">
            <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
              Storefront Features
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-foreground/60 shrink-0" />
                <span>Instant WhatsApp order inquiries directly to your phone</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-foreground/60 shrink-0" />
                <span>Select campus location (Okerenkoko or Kurutie) per listing</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-foreground/60 shrink-0" />
                <span>Zero commission &amp; free verified badge for approved student sellers</span>
              </li>
            </ul>
          </div>

          {/* Quiet Shopper Footnote */}
          <div className="pt-2 border-t border-border/80 text-center text-xs text-muted-foreground">
            <span>Just here to buy? </span>
            <Link
              href="/marketplace"
              className="font-semibold text-foreground hover:underline transition-colors"
            >
              Browse items freely →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
