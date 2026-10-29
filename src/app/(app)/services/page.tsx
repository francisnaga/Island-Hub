import Link from 'next/link'
import { Wrench, Scissors, Shirt, BookOpen, Camera, Printer, Utensils, MessageCircle, BadgeCheck, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const services = [
  {
    id: 'tailoring',
    icon: Shirt,
    name: 'Uniform Tailoring',
    description: 'Custom cadet uniform sets, alterations, patches, and nameplates. Campus pickup available.',
    providers: ['Mama Tailor (Block C)', 'Swift Stitch Okerenkoko'],
    priceRange: '₦1,500 – ₦8,000',
    turnaround: '1–3 days',
    whatsapp: '2348012345678',
    verified: true,
  },
  {
    id: 'barbing',
    icon: Scissors,
    name: 'Barbing & Haircuts',
    description: 'Low cuts, fades, and trims. Campus-side barbershops available within 5 mins of hostels.',
    providers: ['CoolCuts Campus', 'Top Barber Okerenkoko'],
    priceRange: '₦500 – ₦2,000',
    turnaround: 'Walk-in',
    whatsapp: '2348023456789',
    verified: true,
  },
  {
    id: 'laundry',
    icon: Wrench,
    name: 'Laundry Services',
    description: 'Wash, iron, and fold your uniforms and everyday clothes. Per-piece and bag pricing.',
    providers: ['FreshPress NMU', 'CreekClean Okerenkoko'],
    priceRange: '₦200 – ₦800/piece',
    turnaround: '24–48 hours',
    whatsapp: '2348034567890',
    verified: false,
  },
  {
    id: 'printing',
    icon: Printer,
    name: 'Printing & Stationery',
    description: 'Print assignments, CVs, ID cards, banners and course materials. Colour and B&W available.',
    providers: ['Campus Print Hub', 'Okerenkoko Press'],
    priceRange: '₦20 – ₦500/page',
    turnaround: 'Same day',
    whatsapp: '2348045678901',
    verified: true,
  },
  {
    id: 'photography',
    icon: Camera,
    name: 'Photography & ID Cards',
    description: 'Passport photos, student ID photos, event coverage and portrait photography on campus.',
    providers: ['NMU Clicks', 'Marina Photography'],
    priceRange: '₦500 – ₦15,000',
    turnaround: 'Same day – 2 days',
    whatsapp: '2348056789012',
    verified: false,
  },
  {
    id: 'food',
    icon: Utensils,
    name: 'Food & Cooked Meals',
    description: 'Campus food vendors, soup & swallow, rice & stew, snacks delivered to hostels.',
    providers: ['Mama Kitchen Block A', 'CreekSide Buka'],
    priceRange: '₦300 – ₦1,500/plate',
    turnaround: '15–45 mins',
    whatsapp: '2348067890123',
    verified: true,
  },
  {
    id: 'tutoring',
    icon: BookOpen,
    name: 'Tutoring & Study Help',
    description: 'Peer tutoring in maritime engineering, navigation, calculus, physics and other core NMU units.',
    providers: ['NMU Peer Scholars', 'Study Circle Okerenkoko'],
    priceRange: '₦500 – ₦3,000/hr',
    turnaround: 'Scheduled',
    whatsapp: '2348078901234',
    verified: false,
  },
]

export default async function ServicesPage() {
  return (
    <div className="min-w-0">
      {/* Header */}
      <section className="border-b border-border bg-card py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="max-w-2xl space-y-2.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Services around NMU &amp; Okerenkoko
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Tailoring, laundry, barbing, printing, food and more — all from trusted providers on and around campus. Contact any vendor directly on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-[#0F6E6E]/40 hover:shadow-sm transition-all min-w-0"
                >
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0F6E6E] dark:text-[#E8B84A] shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      {service.verified && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F2F2] dark:bg-[#132A2A] border border-[#0F6E6E]/20 px-2 py-0.5 text-[10px] font-bold text-[#0F6E6E] dark:text-[#E8B84A] uppercase tracking-wider shrink-0">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-foreground">{service.name}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{service.description}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">Price range</span>
                        <span>{service.priceRange}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">Turnaround</span>
                        <span>{service.turnaround}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-medium text-foreground">Providers:</p>
                      {service.providers.map((p) => (
                        <p key={p} className="text-muted-foreground truncate">• {p}</p>
                      ))}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${service.whatsapp}?text=${encodeURIComponent(`Hi! I found your ${service.name} service on Jetty. I'd like to enquire about pricing and availability.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enquire on WhatsApp
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Offer your service CTA */}
      <section className="py-8 sm:py-10 border-t border-border bg-card">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Offer a service on campus?</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                List your tailoring, laundry, barbing, or printing service on Jetty for free.
              </p>
            </div>
            <Link
              href="/vendor/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F6E6E] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0A4F4F] transition-colors shrink-0"
            >
              <Wrench className="h-4 w-4" />
              List My Service
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
