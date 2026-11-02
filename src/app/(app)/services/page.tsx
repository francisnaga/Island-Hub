import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChevronRight, Wrench } from 'lucide-react'
import { getPublicServices } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Campus Services | Electrical, Tailoring, Barbers, Laundry & Meals',
  description:
    'Discover trusted campus service providers around Nigeria Maritime University (Okerenkoko & Kurutie). Electrical repairs, uniform tailoring, haircuts, laundry, meals, gadget fixes, and errands.',
  keywords: [
    'NMU campus services',
    'Nigeria Maritime University electrician',
    'hostel electrical repairs Okerenkoko',
    'Nigeria Maritime University tailoring',
    'cadet uniform tailoring Okerenkoko',
    'NMU haircut barber Kurutie',
    'student laundry Okerenkoko',
    'NMU food vendors',
  ],
  alternates: {
    canonical: 'https://jetty.francisnaga.site/services',
  },
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
      <div className="container mx-auto max-w-lg md:max-w-6xl px-4 pt-5 md:pt-8 space-y-4 min-w-0">
        {/* Services Page Header — Clean Linear-grade header with integrated action */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-foreground font-[family-name:var(--font-bricolage)] leading-tight">
              Campus Services
            </h1>
            <p className="text-[14px] text-muted-foreground mt-0.5">
              Verified student and local service providers across Okerenkoko &amp; Kurutie.
            </p>
          </div>
          <Link
            href="/vendor/apply?type=service"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold shadow-2xs hover:border-foreground/30 transition-all cursor-pointer shrink-0"
          >
            <Wrench className="w-3.5 h-3.5 text-[#0F6E6E] dark:text-[#E8B84A]" />
            <span>Offer a service &rarr;</span>
          </Link>
        </div>

        {/* Clean Responsive Bento Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {services.map((service) => {
            const Icon = service.icon
            const detailHref = `/services/${service.slug}`
            const count = service.providers.length

            return (
              <Link
                key={service.id}
                href={detailHref}
                className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-border/70 dark:border-white/[0.08] bg-card dark:bg-[#0D151F] hover:border-foreground/30 dark:hover:border-white/20 hover:shadow-xs transition-all duration-200 overflow-hidden text-left min-h-[156px]"
              >
                {/* Top Row: Icon enclosure + Status indicator */}
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-muted/60 dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.08] flex items-center justify-center text-[#0F6E6E] dark:text-[#E8B84A] group-hover:scale-105 group-hover:bg-[#0F6E6E]/10 dark:group-hover:bg-[#E8B84A]/10 transition-all shrink-0">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>

                  {count > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{count} {count === 1 ? 'provider' : 'providers'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>

                {/* Middle: Title & Tagline */}
                <div className="space-y-1 my-2 min-w-0">
                  <b className="block text-[15px] sm:text-[16px] font-semibold text-foreground tracking-tight leading-snug group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors truncate">
                    {service.title}
                  </b>
                  <p className="text-[12px] text-muted-foreground line-clamp-1 leading-snug">
                    {service.tagline}
                  </p>
                </div>

                {/* Bottom Row: Starting Price & Turnaround */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2.5 border-t border-border/50 dark:border-white/[0.06]">
                  <span className="font-medium text-foreground/85">{service.startingPrice}</span>
                  <span className="truncate">{service.turnaround || 'Same day'}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
