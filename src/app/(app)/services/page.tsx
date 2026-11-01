import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
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
      <div className="container mx-auto max-w-lg md:max-w-6xl px-4 pt-5 md:pt-8 space-y-2 min-w-0">
        {/* Services Page Header (No search bar per user requirement) */}
        <div className="pb-2">
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-foreground font-[family-name:var(--font-bricolage)] leading-tight">
            Services
          </h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            Pick a service to see who offers it.
          </p>
        </div>

        {/* Clean Responsive Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
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
