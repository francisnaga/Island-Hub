import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { ChevronLeft, ChevronRight, MapPin, BadgeCheck, Plus, ShieldCheck } from 'lucide-react'
import { getPublicServiceBySlug } from '@/lib/queries'
import { getServiceBySlug } from '@/lib/services-data'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found | Jetty' }

  return {
    title: `${service.title} | Jetty NMU`,
    description: service.description,
  }
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ campus?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams

  const cookieStore = await cookies()
  const cookieCampus = cookieStore.get('jetty_campus')?.value
  const selectedCampus =
    sp.campus || (cookieCampus && cookieCampus !== 'all' ? cookieCampus : 'all')

  const service = await getPublicServiceBySlug(slug, selectedCampus)

  if (!service) {
    notFound()
  }

  const filteredProviders = service.providers
  const Icon = service.icon

  return (
    <div className="min-w-0 max-w-full pb-24">
      <div className="container mx-auto max-w-lg px-0 pt-4 min-w-0">
        {/* Back link to Services */}
        <div className="px-4 pb-1">
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2] -ml-1 group-hover:-translate-x-0.5 transition-transform" />
            <span>All Services</span>
          </Link>
        </div>

        {/* Heading & Provider Count */}
        <div className="px-4 pt-2 pb-3 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground font-[family-name:var(--font-bricolage)] leading-tight">
              {service.title}
            </h1>
            <p className="text-[14px] text-muted-foreground mt-0.5">
              {filteredProviders.length}{' '}
              {filteredProviders.length === 1 ? 'provider' : 'providers'}
            </p>
          </div>
          <Link
            href="/vendor/products/new?type=service"
            className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Offer {service.title.toLowerCase()}</span>
          </Link>
        </div>

        {/* Provider List Rows */}
        {filteredProviders.length > 0 ? (
          <div className="border-t border-[#DCE8E8] dark:border-border divide-y divide-[#DCE8E8] dark:divide-border">
            {filteredProviders.map((provider) => {
              const waMessage = encodeURIComponent(
                `Hi ${provider.name}, I found your ${service.title} service on Jetty (${provider.campus}). I would like to get a quote and check availability.`
              )
              const targetHref = provider.vendorSlug
                ? `/vendors/${provider.vendorSlug}`
                : `https://wa.me/${provider.whatsapp}?text=${waMessage}`
              const isExternal = !provider.vendorSlug

              return (
                <Link
                  key={provider.id}
                  href={targetHref}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 px-4 py-3 min-h-[76px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  {/* 56px Monogram Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[#0A4F4F] dark:bg-[#172D2D] border border-white/15 text-white flex items-center justify-center font-[family-name:var(--font-bricolage)] font-semibold text-[18px] shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    {provider.initials}
                  </div>

                  {/* Provider Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold text-[15px] text-[#0E1B1B] dark:text-[#F1F5F9]">
                      <span className="truncate">{provider.name}</span>
                      {provider.verified && (
                        <BadgeCheck className="w-4 h-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                      )}
                    </div>

                    <div className="text-[13px] text-[#5B6B6B] dark:text-[#94A3B8] mt-0.5">
                      From {provider.priceFrom}
                    </div>

                    <div className="flex items-center gap-1 text-[13px] text-[#5B6B6B] dark:text-[#94A3B8] mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 stroke-[1.75]" />
                      <span>{provider.campus}</span>
                    </div>
                  </div>

                  {/* Subtle Right Chevron */}
                  <ChevronRight className="w-5 h-5 text-[#5B6B6B] dark:text-[#94A3B8] stroke-[1.75] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )
            })}
          </div>
        ) : (
          /* High-Converting Empty State for Service Category */
          <div className="px-4 pt-3">
            <div className="rounded-2xl border border-border/80 bg-card p-7 sm:p-8 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0A4F4F] dark:text-[#E8B84A] flex items-center justify-center mx-auto">
                <Icon className="w-6 h-6 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-bold text-foreground font-[family-name:var(--font-bricolage)]">
                  Be the first verified {service.title.toLowerCase()} provider
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {service.tagline} Apply as a campus provider and get featured here once approved by Admin.
                </p>
              </div>

              <div className="pt-1">
                <Link
                  href="/vendor/products/new?type=service"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#0A4F4F] hover:bg-[#0F6E6E] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.2]" />
                  <span>List Your {service.title} Service</span>
                </Link>
              </div>

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
                <span>Students message you directly on WhatsApp</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
