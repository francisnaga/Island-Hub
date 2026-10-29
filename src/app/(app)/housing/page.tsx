import Link from 'next/link'
import { ShieldCheck, AlertTriangle, ArrowLeft, ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HousingPage() {
  return (
    <div className="py-8 sm:py-14 min-w-0">
      <div className="container mx-auto max-w-2xl px-4 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Jetty Marketplace
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Housing &amp; Bedspace Listings Deferred for Launch
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            To protect Nigeria Maritime University (NMU) students from unverified agents, advance inspection fees, and accommodation scams in Okerenkoko and Kurutie, Jetty is not publishing public housing or bedspace offers during initial launch.
          </p>

          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-4 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Campus Accommodation Safety Reminder</p>
              <p className="leading-relaxed">
                Never pay inspection fees, agent registration fees, or advance rent before physically inspecting a room in Okerenkoko or Kurutie and verifying the property owner in person.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex flex-wrap gap-3">
            <Link
              href="/marketplace"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F6E6E] px-5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0A4F4F] transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Cadet Gear &amp; Hostel Supplies
            </Link>
            <Link
              href="/fresher-kit"
              className="inline-flex h-11 items-center rounded-xl border border-border bg-background px-4 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              View NMU Fresher Kit Checklist
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
