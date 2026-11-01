import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { WavyAvatar } from '@/components/brand/WavyAvatar'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'

export function VendorAvatarRail({ vendors }: { vendors: Vendor[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 px-4 scroll-px-4 scrollbar-none snap-x">
      {vendors.map((vendor) => {
        const href = vendor.username
          ? `/vendors/${vendor.username}`
          : `/vendors/${vendor.slug || vendor.id}`
        const isGolden = vendor.slug === 'naga' || vendor.slug === 'francis-naga'
        const displayCampus = vendor.campus || 'Okerenkoko'

        return (
          <Link
            key={vendor.id}
            href={href}
            className="flex-none w-[225px] sm:w-[250px] snap-start rounded-2xl border border-border/80 bg-card p-3.5 flex flex-col justify-between gap-3 hover:border-[#0F6E6E] dark:hover:border-[#E8B84A] hover:shadow-xs transition-all group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] overflow-hidden min-w-0"
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

              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="font-bold text-[13px] text-foreground leading-snug group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors flex items-center gap-1 min-w-0">
                  <span className="truncate min-w-0 block">{vendor.shop_name}</span>
                  {vendor.verification_status === 'verified' && (
                    <VerifiedBadge size={13} variant={isGolden ? 'gold' : 'blue'} />
                  )}
                </h3>
                {vendor.username ? (
                  <p className="text-[11px] text-muted-foreground/70 font-medium truncate mt-0.5">
                    @{vendor.username}
                  </p>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                    <span className="truncate">{displayCampus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Short seller category / info */}
            <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
              {vendor.department_or_business_info || vendor.description || 'Verified Campus Merchant'}
            </p>

            {/* Bottom Row: Verified Badge (only if verified) & Enter Arrow */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              {vendor.verification_status === 'verified' ? (
                <div className="inline-flex items-center gap-1 font-semibold text-foreground/85">
                  <VerifiedBadge size={14} variant={isGolden ? 'gold' : 'blue'} />
                  <span>Verified</span>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  {vendor.products_count ?? 0}{' '}
                  {(vendor.products_count ?? 0) === 1 ? 'listing' : 'listings'}
                </span>
              )}

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
