import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChevronRight } from 'lucide-react'
import { getPublicServices } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Services | NMU Campus Services Directory',
  description:
    'Discover trusted campus service providers around Nigeria Maritime University (Okerenkoko & Kurutie). Haircuts, laundry, tailoring, meals, phone repairs, electrical, and tutoring.',
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
      <div className="container mx-auto max-w-lg md:max-w-2xl px-4 pt-6 md:pt-10 space-y-6 min-w-0">
        {/* Services Page Header */}
        <div className="space-y-1">
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.035em] text-foreground font-sans leading-tight">
            Services
          </h1>
          <p className="text-[14px] sm:text-[15px] text-muted-foreground">
            Pick a service to see who offers it.
          </p>
        </div>

        {/* Clean, Unified iOS / Claude-grade Card Container */}
        <div className="rounded-3xl border border-border/80 bg-card shadow-xs overflow-hidden divide-y divide-border/60">
          {services.map((service) => {
            const Icon = service.icon
            const detailHref = `/services/${service.slug}`
            const count = service.providers.length
            const countText =
              count === 0 ? 'None yet' : count === 1 ? '1 provider' : `${count} providers`

            return (
              <Link
                key={service.id}
                href={detailHref}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors group cursor-pointer"
              >
                {/* Left side: Prominent Icon + Service Name */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon
                    className="w-5 h-5 text-[#0F6E6E] dark:text-[#22D3EE] stroke-[2] shrink-0 group-hover:scale-110 transition-transform duration-150"
                    aria-hidden="true"
                  />
                  <span className="text-[15px] sm:text-[16px] font-semibold text-foreground tracking-[-0.015em] truncate">
                    {service.shortTitle || service.title}
                  </span>
                </div>

                {/* Right side: Provider Count + Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      'text-[13.5px] sm:text-[14px] font-medium',
                      count === 0
                        ? 'text-muted-foreground/60'
                        : 'text-muted-foreground'
                    )}
                  >
                    {countText}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Subtle Bottom CTA: Offer a service? List it on Jetty > */}
        <div className="rounded-2xl bg-muted/60 dark:bg-card border border-border/80 p-4 text-center">
          <p className="text-[13.5px] sm:text-sm text-muted-foreground">
            Offer a service?{' '}
            <Link
              href="/vendor/apply"
              className="font-semibold text-[#0F6E6E] dark:text-[#22D3EE] hover:underline inline-flex items-center gap-0.5 group"
            >
              <span>List it on Jetty</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
