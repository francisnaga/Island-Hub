import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { getItemCampus } from '@/lib/queries'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'

export function WaterlineProductCard({
  product,
  selectedCampus = 'all',
}: {
  product: Product
  selectedCampus?: string
}) {
  const campus = getItemCampus(product)
  const isSingleCampusSelected =
    selectedCampus !== 'all' && selectedCampus !== ''

  const priceNaira = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(product.price)

  const isFood = product.listing_type === 'food'
  const isService = product.listing_type === 'service'
  const typeLabel = isFood ? 'Food' : isService ? 'Service' : 'Item'

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card flex-none block w-[156px] snap-start text-left text-inherit no-underline group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-2xl"
    >
      {/* 1:1 Image Container */}
      <div className="relative aspect-square w-full rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] overflow-hidden flex items-center justify-center text-[#0F6E6E] dark:text-[#E8B84A]">
        {product.images && product.images.length > 0 && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
          />
        ) : (
          <ShoppingBag className="w-9 h-9 opacity-45" />
        )}
        <span className="absolute left-2.5 top-2.5 h-[22px] px-2.5 rounded-full bg-white dark:bg-[#0B1414] text-[#0E1B1B] dark:text-[#E8F1F1] text-[11px] font-semibold flex items-center shadow-xs">
          {typeLabel}
        </span>
      </div>

      {/* Price */}
      <div className="mt-2.5 font-semibold text-[16px] text-foreground tracking-tight">
        {priceNaira}
      </div>

      {/* Title (2-Line Clamp) */}
      <div className="mt-0.5 text-[14px] text-foreground line-clamp-2 min-h-[2.8em] leading-snug">
        {product.title}
      </div>

      {/* Meta Row */}
      <div className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden">
        {product.vendor?.verification_status === 'verified' ? (
          <>
            <VerifiedBadge size={14} />
            <span>Verified</span>
            {!isSingleCampusSelected && (
              <span className="truncate">· {campus === 'Both' ? 'Okerenkoko & Kurutie' : campus}</span>
            )}
          </>
        ) : (
          <span className="truncate">
            {product.vendor?.shop_name ? `${product.vendor.shop_name} · ` : ''}
            {campus === 'Both' ? 'Both campuses' : campus}
          </span>
        )}
      </div>
    </Link>
  )
}
