import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Plus } from 'lucide-react'
import { getPublicServices } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Services | Jetty NMU',
  description: 'Pick a service to see who offers it across NMU Okerenkoko and Kurutie campuses.',
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; campus?: string }>
}) {
  const sp = await searchParams

  if (sp.category && sp.category !== 'all') {
    redirect(`/services/${encodeURIComponent(sp.category)}`)
  }

  const cookieStore = await cookies()
  const cookieCampus = cookieStore.get('jetty_campus')?.value
  const selectedCampus =
    sp.campus || (cookieCampus && cookieCampus !== 'all' ? cookieCampus : 'all')

  const services = await getPublicServices(selectedCampus)

  return (
    <div className="min-w-0 max-w-full pb-24">
      <div className="container mx-auto max-w-lg px-4 pt-5 space-y-1 min-w-0">
        {/* Services Page Header (No search bar per user requirement) */}
        <div className="flex items-end justify-between gap-3 pb-2">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground font-[family-name:var(--font-bricolage)] leading-tight">
              Services
            </h1>
            <p className="text-[14px] text-muted-foreground mt-0.5">
              Pick a service to see who offers it.
            </p>
          </div>
          <Link
            href="/vendor/products/new?type=service"
            className="inline-flex items-center gap-1 h-9 px-3.5 rounded-full bg-[#0A4F4F] text-white text-xs font-semibold hover:bg-[#0F6E6E] transition-colors shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>List service</span>
          </Link>
        </div>

        {/* 2-Column Clean Grid (Linear / Claude Precision UI) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {services.map((service) => {
            const Icon = service.icon
            const detailHref = `/services/${service.slug}`
            const count = service.providers.length

            return (
              <Link
                key={service.id}
                href={detailHref}
                className="flex flex-col justify-between gap-4 p-4 rounded-2xl border border-border/70 bg-card hover:border-foreground/30 hover:bg-muted/30 active:scale-[0.98] transition-all text-left min-h-[144px] group shadow-2xs"
              >
                {/* Clean, Direct Icon (No nested bubble/box) */}
                <Icon className="w-6 h-6 stroke-[1.75] text-foreground group-hover:scale-105 transition-transform" />

                {/* Service Name & Provider Count */}
                <div className="space-y-1">
                  <b className="block text-[15px] font-semibold text-foreground leading-snug tracking-tight">
                    {service.title}
                  </b>
                  <div className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
                    <span className="font-[family-name:var(--font-bricolage)] font-bold text-[22px] leading-none text-foreground">
                      {count}
                    </span>
                    <span className="font-medium">{count === 1 ? 'provider' : 'providers'}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
