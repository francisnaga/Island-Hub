import Link from 'next/link'
import { Anchor, CheckCircle2, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getCurrentUserContext } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const kitSections = [
  {
    title: 'Cadet Uniform & Gear',
    priority: true,
    note: 'Required from Week 1 of resumption. Non-negotiable.',
    items: [
      { name: 'Action Rig (White)', note: 'Full set: shirt + trousers', vendorHint: 'NMU Cadet Quartermaster' },
      { name: 'Safety Boots (Steel-toe)', note: 'Black, polishable, steel-toe cap', vendorHint: 'NMU Cadet Quartermaster' },
      { name: 'Black Socks (6 pairs)', note: 'Ankle or crew length, plain black', vendorHint: 'Hostel Essentials vendors' },
      { name: 'Black Belt', note: 'Plain, no logos', vendorHint: 'Fashion vendors' },
      { name: 'Beret (NMU colour)', note: 'Confirm colour with your faculty', vendorHint: 'NMU Cadet Quartermaster' },
      { name: 'Name Badges & Pins', note: 'Engraved with your name & matric no', vendorHint: 'Tailoring services' },
      { name: 'Shoulder Boards / Epaulettes', note: 'Confirm rank with your department', vendorHint: 'NMU Cadet Quartermaster' },
    ],
  },
  {
    title: 'Electronics & Gadgets',
    priority: false,
    items: [
      { name: 'Scientific Calculator', note: 'Casio FX-991ES Plus or similar', vendorHint: 'Electronics vendors' },
      { name: 'Power Bank (10,000mAh+)', note: 'Power cuts are frequent in hostels', vendorHint: 'Electronics vendors' },
      { name: 'Earphones / Earbuds', note: 'Wired preferred for durability in field exercises', vendorHint: 'Electronics vendors' },
      { name: 'Phone Charger (spare)', note: 'Carry a backup — original chargers get stolen', vendorHint: 'Electronics vendors' },
      { name: 'Extension Cable (3-socket)', note: 'With surge protection', vendorHint: 'Hostel Essentials vendors' },
    ],
  },
  {
    title: 'Textbooks & Stationery',
    priority: false,
    items: [
      { name: 'Engineering Drawing Set', note: 'Compass, set squares, protractor', vendorHint: 'Books vendors' },
      { name: 'A4 Notebooks (10)', note: 'Hard cover preferred', vendorHint: 'Books vendors' },
      { name: 'Course Textbooks', note: 'Get your faculty handbook first; buy only required texts', vendorHint: 'Books vendors' },
      { name: 'Blue & Black Pens (pack)', note: 'Ballpoint, exam-grade', vendorHint: 'Books vendors' },
      { name: 'Pencils & Eraser Set', note: 'For technical drawing', vendorHint: 'Books vendors' },
    ],
  },
  {
    title: 'Hostel & Daily Essentials',
    priority: false,
    items: [
      { name: 'Padlock (heavy duty)', note: 'For locker and room door', vendorHint: 'Hostel Essentials vendors' },
      { name: 'Bedsheet & Pillowcase Set', note: 'Single/twin size for hostel bunks', vendorHint: 'Hostel Essentials vendors' },
      { name: 'Towels (2)', note: 'Bath + face towel', vendorHint: 'Hostel Essentials vendors' },
      { name: 'Plastic Storage Box', note: 'Under-bed storage for uniform & kit', vendorHint: 'Hostel Essentials vendors' },
      { name: 'Bucket & Basin', note: 'Water supply can be intermittent', vendorHint: 'Hostel Essentials vendors' },
      { name: 'Mosquito Net / Repellent', note: 'Essential in the creeks — malaria risk is real', vendorHint: 'Hostel Essentials vendors' },
      { name: 'Toilet Paper & Soap (stock)', note: 'Buy in bulk on arrival', vendorHint: 'Hostel Essentials vendors' },
    ],
  },
]

export default async function FresherKitPage() {
  const userContext = await getCurrentUserContext()
  const totalItems = kitSections.reduce((acc, s) => acc + s.items.length, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar
        user={userContext.user}
        profile={userContext.profile}
        vendor={userContext.vendor}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-card py-10 md:py-14">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Anchor className="h-3.5 w-3.5" />
                NMU Fresher Guide
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.12]">
                NMU Fresher Kit Checklist
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                {totalItems} essential items every new NMU student needs before Week 1. Find where to buy each item on Jetty.
              </p>
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>This is a community-compiled guide. Always verify the official kit list with your faculty/department on resumption.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="py-10">
          <div className="container mx-auto max-w-7xl px-4 space-y-8">
            {kitSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                  {section.priority && (
                    <span className="rounded-full bg-red-100 border border-red-200 dark:bg-red-950/40 dark:border-red-800 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                      Required from Day 1
                    </span>
                  )}
                  {section.note && (
                    <span className="text-xs text-muted-foreground">{section.note}</span>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                      </div>
                      <Link
                        href={`/marketplace?q=${encodeURIComponent(item.name.split(' ')[0])}`}
                        className="shrink-0 text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Find on Jetty
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 border-t border-border bg-card">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="rounded-2xl border border-primary/20 bg-accent/30 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground">Ready to shop your kit?</h2>
                <p className="text-sm text-muted-foreground">
                  Browse verified vendors who stock cadet gear, electronics, and hostel essentials around NMU.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link
                  href="/category/maritime-cadet-gear"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Shop Cadet Gear
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Browse All
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
