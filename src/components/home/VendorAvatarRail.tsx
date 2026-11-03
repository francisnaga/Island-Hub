import Link from 'next/link'
import { Vendor } from '@/lib/types'
import { UserAvatar } from '@/components/brand/UserAvatar'

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
    <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 px-4 scroll-px-4 scrollbar-none snap-x items-start">
      {sortedVendors.map((vendor) => {
        const href = vendor.username
          ? `/vendors/${vendor.username}`
          : `/vendors/${vendor.slug || vendor.id}`

        return (
          <Link
            key={vendor.id}
            href={href}
            className="flex-none w-[72px] sm:w-[80px] snap-start flex flex-col items-center gap-1.5 group text-center cursor-pointer"
          >
            {/* Circular Avatar (Matching prototype & screenshot) */}
            <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border border-border/80 shadow-2xs group-hover:scale-105 group-hover:border-[#0F6E6E] dark:group-hover:border-[#E8B84A] transition-all">
              <UserAvatar
                src={vendor.logo_url}
                seed={vendor.id || vendor.slug}
                name={vendor.shop_name}
                size={64}
                className="w-full h-full"
                priority
              />
            </div>

            {/* Vendor Name underneath — single line truncated */}
            <span className="text-[12px] sm:text-[13px] text-foreground font-medium truncate w-full group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors leading-tight">
              {vendor.shop_name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
