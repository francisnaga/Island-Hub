import Link from 'next/link'
import { Anchor, ArrowLeft } from 'lucide-react'
import { login } from './actions'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const sp = await searchParams
  const nextPath = sp.next || '/'

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF9F6] px-4 py-12 text-slate-900">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Marketplace
          </Link>
          <span className="text-xs text-slate-500">No account needed to browse</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Link
              href="/"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E3A8A] text-white shadow-xs"
            >
              <Anchor className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Sign in to IslandHub
            </h1>
            <p className="text-xs text-slate-500 max-w-xs">
              Sign in with Google or email to manage your vendor storefront or switch between Consumer and Vendor modes.
            </p>
          </div>

          {sp.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              {sp.error === 'auth_callback_failed'
                ? 'Google authentication could not be completed. Please try again.'
                : sp.error}
            </div>
          )}

          {/* Primary Google Sign-In */}
          <GoogleSignInButton nextPath={nextPath} label="Continue with Google" />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              or email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          <form className="space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
              />
            </div>

            <button
              type="submit"
              formAction={login}
              className="w-full h-11 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm hover:bg-blue-900 transition-colors cursor-pointer"
            >
              Sign In with Email
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
            New to IslandHub?{' '}
            <Link
              href={`/register?next=${encodeURIComponent(nextPath)}`}
              className="font-bold text-blue-800 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
