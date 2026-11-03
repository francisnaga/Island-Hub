import Link from 'next/link'
import { Vendor } from '@/lib/types'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'

export function VendorAvatarRail({ vendors }: { vendors: Vendor[] }) {
  // Sort vendors so Naga is always pinned at the very front
  const sortedVendors = [...vendors].sort((a, b) => {
    const isNagaA = a.slug === 'naga' || a.slug === 'francis-naga' || a.username === 'naga'
    const isNagaB = b.slug === 'naga' || b.slug === 'francis-naga' || b.username === 'naga'
    if (isNagaA && !isNagaB) return -1
    if (!isNagaA && isNagaB) return 1
    return 0
  })

  return (
    <div className="flex gap-4 sm:gap-5 overflow-x-auto pt-2 pb-3 px-4 scroll-px-4 scrollbar-none snap-x items-start">
      {sortedVendors.map((vendor) => {
        const href = vendor.username
          ? `/vendors/${vendor.username}`
          : `/vendors/${vendor.slug || vendor.id}`
        const isGolden =
          vendor.slug === 'naga' ||
          vendor.slug === 'francis-naga' ||
          vendor.username === 'naga' ||
          vendor.shop_name?.toLowerCase() === 'naga'
        const isVerified =
          (vendor.verification_status === 'verified' || isGolden) &&
          vendor.verification_status !== 'suspended'

        return (
          <Link
            key={vendor.id}
            href={href}
            className="flex-none w-[76px] sm:w-[84px] snap-start flex flex-col items-center gap-2 group text-center cursor-pointer"
          >
            {/* Circular Avatar: Exact 64x64 square, never squished or clipped */}
            <div className="relative w-16 h-16 min-w-16 min-h-16 aspect-square rounded-full overflow-hidden shrink-0 border border-border/80 shadow-2xs group-hover:scale-105 group-hover:border-[#0F6E6E] dark:group-hover:border-[#E8B84A] transition-all flex items-center justify-center bg-card">
              <UserAvatar
                src={vendor.logo_url}
                seed={vendor.id || vendor.slug}
                name={vendor.shop_name}
                size={64}
                className="w-full h-full aspect-square"
                priority
              />
            </div>

            {/* Vendor Name underneath with persistent Verification Badge */}
            <div className="flex items-center justify-center gap-1 w-full max-w-[76px] sm:max-w-[84px] min-w-0 px-0.5">
              <span className="truncate text-[12px] sm:text-[13px] text-foreground font-medium group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors leading-tight min-w-0">
                {vendor.shop_name}
              </span>
              {isVerified && (
                <VerifiedBadge
                  size={13}
                  variant={isGolden ? 'gold' : 'blue'}
                  className="shrink-0"
                />
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
