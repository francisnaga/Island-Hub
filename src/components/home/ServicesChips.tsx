import Link from 'next/link'
import { SERVICES_LIST } from '@/lib/services-data'

export function ServicesChips() {
  return (
    <div className="flex flex-wrap gap-2 px-4">
      {SERVICES_LIST.map((service) => {
        const Icon = service.icon
        return (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            className="flex items-center gap-2 h-10 px-3.5 rounded-full bg-card border border-border/80 text-foreground text-[13px] font-medium hover:border-foreground/40 hover:bg-muted/40 transition-all group shadow-2xs"
          >
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground stroke-[1.75] transition-colors shrink-0" />
            <span className="group-hover:text-foreground transition-colors">{service.title}</span>
          </Link>
        )
      })}
    </div>
  )
}
