import Link from 'next/link'
import { Vendor } from '@/lib/types'
import { getVendorInitials } from '@/components/cards/VendorCard'

export function VendorAvatarRail({ vendors }: { vendors: Vendor[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 px-4 scrollbar-none snap-x">
      {vendors.map((vendor) => {
        const initials = getVendorInitials(vendor.shop_name)
        const href = `/vendors/${vendor.slug || vendor.id}`

        return (
          <Link
            key={vendor.id}
            href={href}
            className="flex-none w-[76px] flex flex-col items-center gap-2 text-center snap-start group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-xl py-0.5"
          >
            {/* 64px Circular Gradient Monogram Avatar */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-[family-name:var(--font-bricolage)] font-semibold text-[20px] bg-gradient-to-br from-[#17908D] to-[#0A4F4F] shadow-2xs group-hover:scale-105 transition-transform duration-200">
              {initials}
            </div>
            <span className="max-w-[76px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium text-foreground group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors">
              {vendor.shop_name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
