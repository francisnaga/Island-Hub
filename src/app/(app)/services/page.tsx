import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { SERVICES_LIST } from '@/lib/services-data'

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

  // Backward compatibility: If an old link points to /services?category=barbing, redirect to /services/haircuts
  if (sp.category && sp.category !== 'all') {
    redirect(`/services/${encodeURIComponent(sp.category)}`)
  }

  const cookieStore = await cookies()
  const cookieCampus = cookieStore.get('jetty_campus')?.value
  const selectedCampus =
    sp.campus || (cookieCampus && cookieCampus !== 'all' ? cookieCampus : 'all')

  return (
    <div className="min-w-0 max-w-full pb-24">
      <div className="container mx-auto max-w-lg px-4 pt-5 space-y-1 min-w-0">
        {/* Services Page Header Matching Prototype Image 1 */}
        <h1 className="text-[26px] font-semibold tracking-tight text-foreground font-[family-name:var(--font-bricolage)] leading-tight">
          Services
        </h1>
        <p className="text-[14px] text-muted-foreground pb-2">
          Pick a service to see who offers it.
        </p>

        {/* 2-Column Clean Grid (Linear / Claude Precision UI) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {SERVICES_LIST.map((service) => {
            const Icon = service.icon
            const detailHref = `/services/${service.slug}`

            // Filter providers by campus if selected
            const count = service.providers.filter((p) => {
              if (selectedCampus === 'all' || !selectedCampus) return true
              if (p.campus === 'Both campuses') return true
              return p.campus.toLowerCase() === selectedCampus.toLowerCase()
            }).length

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
