import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const sp = await searchParams
  const nextPath = sp.next || '/vendor/dashboard'

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip flex flex-col justify-center items-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Marketplace
          </Link>
          <span className="text-xs text-muted-foreground">No account needed to browse</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col items-center text-center space-y-2.5">
            {/* Official Jetty Mark + Wordmark */}
            <Link href="/" className="inline-flex items-center gap-2.5 py-1">
              <img
                src="/jetty-mark.svg"
                alt="Jetty"
                width={36}
                height={36}
                className="h-9 w-9 shrink-0"
              />
              <span className="text-2xl font-semibold tracking-[0.02em] text-foreground lowercase leading-none">
                jetty
              </span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground pt-1">
              Sell on Jetty
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs">
              Sign in with Google to manage your vendor storefront. Buyers never need to sign in — just browse and contact vendors on WhatsApp.
            </p>
          </div>

          {sp.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {sp.error === 'auth_callback_failed'
                ? 'Google authentication could not be completed. Please try again.'
                : sp.error}
            </div>
          )}

          {/* Google-only Sign In */}
          <GoogleSignInButton nextPath={nextPath} label="Continue with Google" />

          <div className="rounded-xl bg-muted border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">Vendor benefits</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0F6E6E] shrink-0" />
                Manage your product listings, prices and stock status
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0F6E6E] shrink-0" />
                Set your shop landmark &amp; WhatsApp contact details
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0F6E6E] shrink-0" />
                Get verified by the Jetty team for free
              </li>
            </ul>
          </div>

          <p className="text-center text-xs text-muted-foreground border-t border-border pt-4">
            Just here to shop?{' '}
            <Link href="/marketplace" className="font-bold text-[#0F6E6E] dark:text-[#E8B84A] hover:underline">
              Browse the marketplace →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
