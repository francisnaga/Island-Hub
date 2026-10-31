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

        {/* 2-Column Exact Prototype Grid (.sgrid & .scard) */}
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
                className="flex flex-col justify-between gap-5 p-4 rounded-[16px] bg-[#E6F2F2] dark:bg-[#13242A] hover:opacity-95 active:scale-[0.98] transition-all text-left min-h-[148px] group shadow-2xs"
              >
                {/* White rounded square icon box (.ic) */}
                <div className="w-11 h-11 rounded-[12px] bg-white dark:bg-[#1E333C] text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-5.5 h-5.5 stroke-[1.8]" />
                </div>

                {/* Service Name & Provider Count (.ct) */}
                <div className="space-y-0.5">
                  <b className="block text-[17px] font-semibold text-[#0E1B1B] dark:text-[#F1F5F9] leading-snug">
                    {service.title}
                  </b>
                  <div className="flex items-baseline gap-1.5 text-[14px] text-[#5B6B6B] dark:text-[#94A3B8]">
                    <em className="not-italic font-[family-name:var(--font-bricolage)] font-semibold text-[28px] leading-none text-[#0F6E6E] dark:text-[#22D3EE]">
                      {count}
                    </em>
                    <span>{count === 1 ? 'provider' : 'providers'}</span>
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
