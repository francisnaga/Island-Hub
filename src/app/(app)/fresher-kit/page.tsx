import Link from 'next/link'
import { CheckCircle2, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const kitSections = [
  {
    title: 'Cadet Uniform & Gear',
    priority: true,
    note: 'Commonly needed from Week 1 of resumption.',
    items: [
      { name: 'Action Rig (White)', note: 'Full set: shirt + trousers' },
      { name: 'Safety Boots (Steel-toe)', note: 'Black, polishable, steel-toe cap' },
      { name: 'Black Socks (6 pairs)', note: 'Ankle or crew length, plain black' },
      { name: 'Black Belt', note: 'Plain, no logos' },
      { name: 'Beret (NMU colour)', note: 'Confirm colour with your faculty' },
      { name: 'Name Badges & Pins', note: 'Engraved with your name & matric no' },
      { name: 'Shoulder Boards / Epaulettes', note: 'Confirm rank with your department' },
    ],
  },
  {
    title: 'Electronics & Gadgets',
    priority: false,
    items: [
      { name: 'Scientific Calculator', note: 'Casio FX-991ES Plus or similar' },
      { name: 'Power Bank (10,000mAh+)', note: 'Power cuts are frequent in hostels' },
      { name: 'Earphones / Earbuds', note: 'Durable wired or wireless' },
      { name: 'Phone Charger (spare)', note: 'Always keep a backup charger' },
      { name: 'Extension Cable (3-socket)', note: 'With surge protection' },
    ],
  },
  {
    title: 'Textbooks & Stationery',
    priority: false,
    items: [
      { name: 'Engineering Drawing Set', note: 'Compass, set squares, protractor' },
      { name: 'A4 Notebooks (10)', note: 'Hard cover preferred' },
      { name: 'Course Textbooks', note: 'Get your faculty handbook first' },
      { name: 'Blue & Black Pens (pack)', note: 'Ballpoint, exam-grade' },
      { name: 'Pencils & Eraser Set', note: 'For technical drawing' },
    ],
  },
  {
    title: 'Hostel & Daily Essentials',
    priority: false,
    items: [
      { name: 'Padlock (heavy duty)', note: 'For locker and room door' },
      { name: 'Bedsheet & Pillowcase Set', note: 'Single/twin size for hostel bunks' },
      { name: 'Towels (2)', note: 'Bath + face towel' },
      { name: 'Plastic Storage Box', note: 'Under-bed storage for uniform & kit' },
      { name: 'Bucket & Basin', note: 'Water supply can be intermittent' },
      { name: 'Mosquito Net / Repellent', note: 'Essential in riverine hostels' },
      { name: 'Toiletries & Soap', note: 'Stock up on arrival' },
    ],
  },
]

export default async function FresherKitPage() {
  const totalItems = kitSections.reduce((acc, s) => acc + s.items.length, 0)

  return (
    <div className="min-w-0">
      {/* Header */}
      <section className="border-b border-border bg-card py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="max-w-2xl space-y-2.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.12] text-foreground">
              Getting ready for NMU? Find your cadet essentials in one place.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {totalItems} commonly needed items for new NMU students across Okerenkoko and Kurutie. Tap any item to see vendors who stock it on Jetty.
            </p>
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>Community-compiled checklist. Always verify your department&apos;s official requirements on resumption.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 space-y-6 sm:space-y-8">
          {kitSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">{section.title}</h2>
                {section.priority && (
                  <span className="rounded-md bg-[#E8B84A]/25 border border-[#E8B84A]/50 px-2 py-0.5 text-[10px] font-bold text-[#0E1B1B] dark:text-[#E8B84A] uppercase tracking-wider">
                    Priority
                  </span>
                )}
                {section.note && (
                  <span className="text-xs text-muted-foreground">{section.note}</span>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3.5 sm:px-5 py-3.5 hover:bg-muted/30 transition-colors min-w-0">
                    <div className="flex items-start gap-3 min-w-0">
                      <CheckCircle2 className="h-4.5 w-4.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{item.note}</p>
                      </div>
                    </div>
                    <Link
                      href={`/marketplace?q=${encodeURIComponent(item.name.split(' ')[0])}`}
                      className="shrink-0 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-semibold text-[#0F6E6E] dark:text-[#E8B84A] hover:bg-[#E6F2F2] dark:hover:bg-[#132A2A] flex items-center gap-1"
                    >
                      <span>Find</span>
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
      <section className="py-8 sm:py-10 border-t border-border bg-card">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Ready to shop your kit?</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Browse verified vendors who stock cadet gear, electronics, and hostel essentials around NMU.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                href="/category/maritime-cadet-gear"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F6E6E] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0A4F4F] transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Cadet Gear
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Browse All
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
