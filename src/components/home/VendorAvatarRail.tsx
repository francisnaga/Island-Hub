import Link from 'next/link'
import { BadgeCheck, MapPin, ArrowRight } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { WavyAvatar } from '@/components/brand/WavyAvatar'

export function VendorAvatarRail({ vendors }: { vendors: Vendor[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-none snap-x">
      {vendors.map((vendor) => {
        const href = `/vendors/${vendor.slug || vendor.id}`
        const isGolden = vendor.slug === 'naga' || vendor.slug === 'francis-naga'
        const displayCampus = vendor.campus || 'Okerenkoko'

        return (
          <Link
            key={vendor.id}
            href={href}
            className="flex-none w-[225px] sm:w-[250px] snap-start rounded-2xl border border-border/80 bg-card p-3.5 flex flex-col justify-between gap-3 hover:border-[#0F6E6E] dark:hover:border-[#E8B84A] hover:shadow-xs transition-all group focus-visible:outline-2 focus-visible:outline-[#0F6E6E]"
          >
            {/* Top row: Avatar + Name + Campus */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-border/80 shadow-2xs group-hover:scale-105 transition-transform">
                {vendor.logo_url ? (
                  <img
                    src={vendor.logo_url}
                    alt={vendor.shop_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <WavyAvatar
                    name={vendor.shop_name}
                    seed={vendor.id || vendor.slug}
                    size={44}
                    className="w-full h-full"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[13px] text-foreground line-clamp-1 leading-snug group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors">
                  {vendor.shop_name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                  <span className="truncate">{displayCampus}</span>
                </div>
              </div>
            </div>

            {/* Middle: Short seller category / info */}
            <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
              {vendor.department_or_business_info || vendor.description || 'Verified Campus Merchant'}
            </p>

            {/* Bottom Row: Verified Badge & Enter Arrow */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <div className="inline-flex items-center gap-1 font-semibold text-foreground/85">
                <BadgeCheck
                  className={`h-3.5 w-3.5 ${
                    isGolden ? 'text-[#E8B84A]' : 'text-[#0F6E6E] dark:text-[#E8B84A]'
                  }`}
                />
                <span>Verified</span>
              </div>

              <span className="inline-flex items-center gap-0.5 font-semibold text-[#0F6E6E] dark:text-[#E8B84A] group-hover:translate-x-0.5 transition-transform">
                <span>View</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
