import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { FresherKitClient, KitSection } from './FresherKitClient'

export const dynamic = 'force-dynamic'

const kitSections: KitSection[] = [
  {
    title: 'Cadet Uniform & Gear',
    priority: true,
    note: 'Required from Week 1 of resumption.',
    items: [
      { id: 'action-rig', name: 'Action Rig (Navy / White)', note: 'Regulation cadet action rig set', searchQuery: 'action rig' },
      { id: 'safety-boots', name: 'Safety Boots (Steel-toe)', note: 'Black, polishable, heavy-duty', searchQuery: 'safety boots' },
      { id: 'black-socks', name: 'Black Boot Socks (Pack)', note: 'Ankle/crew length, plain black', searchQuery: 'socks' },
      { id: 'black-belt', name: 'Plain Black Belt', note: 'Standard regulation width, no logos', searchQuery: 'belt' },
      { id: 'cadet-beret', name: 'Cadet Beret & Cap Badge', note: 'Confirm color with your faculty', searchQuery: 'beret' },
      { id: 'name-badge', name: 'Name Badges & Pins', note: 'Engraved with your matric number', searchQuery: 'nameplate' },
      { id: 'epaulettes', name: 'Shoulder Boards / Epaulettes', note: 'Confirm rank with your department', searchQuery: 'cadet' },
    ],
  },
  {
    title: 'Electronics & Gadgets',
    priority: false,
    items: [
      { id: 'calc', name: 'Scientific Calculator', note: 'Casio fx-991ES Plus or similar', searchQuery: 'calculator' },
      { id: 'powerbank', name: 'Power Bank (10,000mAh+)', note: 'Fast charging for frequent power cuts', searchQuery: 'power bank' },
      { id: 'earphones', name: 'Earphones / Earbuds', note: 'Durable wired or wireless', searchQuery: 'earphone' },
      { id: 'charger', name: 'Phone Charger (spare)', note: 'Keep a backup cable in your locker', searchQuery: 'charger' },
      { id: 'extension', name: 'Extension Cable (Surge Protected)', note: 'For hostel study desks', searchQuery: 'extension' },
    ],
  },
  {
    title: 'Textbooks & Engineering Tools',
    priority: false,
    items: [
      { id: 'drawing-board', name: 'A2 Technical Drawing Board', note: 'With T-square and set squares', searchQuery: 'drawing board' },
      { id: 'drawing-set', name: 'Engineering Mathematical Set', note: 'Compass, dividers, protractor', searchQuery: 'drawing' },
      { id: 'notebooks', name: 'A4 Hardcover Notebooks (10)', note: 'For lecture notes and tutorials', searchQuery: 'notebook' },
      { id: 'pens-pencils', name: 'Exam-Grade Pens & Drawing Pencils', note: 'Ballpoint 0.7mm and 2H/2B pencils', searchQuery: 'pen' },
    ],
  },
  {
    title: 'Hostel & Riverine Living Essentials',
    priority: false,
    items: [
      { id: 'table-fan', name: 'Rechargeable Hostel Table Fan', note: 'Built-in battery with LED night light', searchQuery: 'fan' },
      { id: 'padlock', name: 'Heavy-Duty Brass Padlocks (2)', note: 'For room door and wardrobe locker', searchQuery: 'padlock' },
      { id: 'bedding', name: 'Bedsheet & Pillowcase Set', note: 'Standard single bunk mattress size', searchQuery: 'bedsheet' },
      { id: 'mosquito-net', name: 'Mosquito Net & Insect Spray', note: 'Essential in Delta riverine hostels', searchQuery: 'mosquito' },
      { id: 'bucket-basin', name: 'Heavy-Duty Water Bucket & Basin', note: 'For water collection and laundry', searchQuery: 'bucket' },
      { id: 'towels', name: 'Bath & Hand Towels', note: 'Quick-drying cotton towels', searchQuery: 'towel' },
    ],
  },
]

export default async function FresherKitPage() {
  const totalItems = kitSections.reduce((acc, s) => acc + s.items.length, 0)

  return (
    <div className="min-w-0">
      {/* Compact Header */}
      <section className="py-5 sm:py-7">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              NMU Fresher Kit ({totalItems} items)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive preparation checklist · Progress saves automatically to your device
            </p>
          </div>
          <Link
            href="/category/maritime-cadet-gear"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground text-background px-4 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0 self-start sm:self-auto"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Shop Cadet Gear
          </Link>
        </div>
      </section>

      {/* Interactive Checklist Component */}
      <section className="py-2 sm:py-6 pb-12">
        <div className="container mx-auto max-w-7xl px-3.5 sm:px-4">
          <FresherKitClient sections={kitSections} />
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
                className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Uniforms &amp; Kits
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
