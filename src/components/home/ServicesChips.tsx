import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SERVICES_LIST } from '@/lib/services-data'

export function ServicesChips({ limit = 6 }: { limit?: number }) {
  const displayedServices = SERVICES_LIST.slice(0, limit)
  const remainingCount = Math.max(0, SERVICES_LIST.length - limit)

  return (
    <div className="flex flex-wrap gap-2 px-4">
      {displayedServices.map((service) => {
        const Icon = service.icon
        return (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            className="flex items-center gap-2 h-9 px-3 rounded-full bg-card border border-border/80 text-foreground text-xs font-medium hover:border-foreground/40 hover:bg-muted/40 transition-all group shadow-2xs"
          >
            <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground stroke-[1.75] transition-colors shrink-0" />
            <span className="group-hover:text-foreground transition-colors">
              {service.shortTitle || service.title}
            </span>
          </Link>
        )
      })}

      {remainingCount > 0 && (
        <Link
          href="/services"
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-muted/60 border border-border text-xs font-semibold text-[#0F6E6E] dark:text-[#22D3EE] hover:bg-muted transition-colors shadow-2xs"
        >
          <span>+{remainingCount} more</span>
          <ArrowRight className="w-3 h-3 stroke-[2.2]" />
        </Link>
      )}
    </div>
  )
}
