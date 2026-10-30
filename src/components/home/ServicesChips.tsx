import Link from 'next/link'
import { Scissors, Droplets, Shirt, Utensils, Wrench, BookOpen } from 'lucide-react'

const SERVICES = [
  { label: 'Tailoring', icon: Shirt, href: '/services/tailoring' },
  { label: 'Laundry', icon: Droplets, href: '/services/laundry' },
  { label: 'Haircuts', icon: Scissors, href: '/services/barbing' },
  { label: 'Meals', icon: Utensils, href: '/services/cooking' },
  { label: 'Repairs', icon: Wrench, href: '/services/tech-repairs' },
  { label: 'Tutoring', icon: BookOpen, href: '/services/tutoring' },
]

export function ServicesChips() {
  return (
    <div className="flex flex-wrap gap-2 px-4">
      {SERVICES.map((s) => {
        const Icon = s.icon
        return (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-2 h-11 px-3.5 rounded-full bg-card border border-border text-foreground text-[14px] font-medium hover:border-[#0F6E6E] hover:text-[#0F6E6E] dark:hover:text-[#E8B84A] transition-colors shadow-2xs"
          >
            <Icon className="w-[18px] h-[18px] text-[#0F6E6E] dark:text-[#E8B84A]" />
            <span>{s.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
