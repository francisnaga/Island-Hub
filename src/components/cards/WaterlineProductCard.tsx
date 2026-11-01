import Link from 'next/link'
import { Briefcase, ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { getItemCampus } from '@/lib/queries'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { getServiceBySlug, inferServiceSlugFromProduct } from '@/lib/services-data'

export function WaterlineProductCard({
  product,
  selectedCampus = 'all',
  variant = 'rail',
  priority = false,
}: {
  product: Product
  selectedCampus?: string
  variant?: 'rail' | 'grid'
  priority?: boolean
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

  const serviceSlug = isService ? inferServiceSlugFromProduct(product) : ''
  const matchedService = isService ? getServiceBySlug(serviceSlug) : null
  const ServiceIcon = (matchedService?.icon as any) || Briefcase

  const typeLabel = isFood
    ? 'Food'
    : isService
    ? matchedService?.shortTitle || 'Service'
    : 'Item'

  // When a service card is clicked from home page, it opens the service provider's profile
  const vendorStoreHref = product.vendor?.slug
    ? `/vendors/${product.vendor.slug}`
    : product.vendor?.id
    ? `/vendors/${product.vendor.id}`
    : `/product/${product.slug || product.id}`

  const targetHref = isService ? vendorStoreHref : `/product/${product.slug || product.id}`
  const priceDisplay = isService && product.price > 0 ? `From ${priceNaira}` : priceNaira

  return (
    <Link
      href={targetHref}
      className={
        variant === 'rail'
          ? 'card flex-none block w-[156px] snap-start text-left text-inherit no-underline group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-2xl'
          : 'card block w-full text-left text-inherit no-underline group focus-visible:outline-2 focus-visible:outline-[#0F6E6E] rounded-2xl'
      }
    >
      {/* 1:1 Image Container */}
      <div className="relative aspect-square w-full rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] overflow-hidden flex items-center justify-center text-[#0F6E6E] dark:text-[#E8B84A]">
        {product.images && product.images.length > 0 && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'low'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
          />
        ) : isService ? (
          <div className="flex flex-col items-center justify-center p-2 text-center text-[#0F6E6E] dark:text-[#22D3EE]">
            <ServiceIcon className="w-10 h-10 opacity-80 stroke-[1.75] mb-1" />
            <span className="text-[11px] font-semibold text-foreground/80 line-clamp-1 max-w-[120px]">
              {matchedService?.shortTitle || 'Service'}
            </span>
          </div>
        ) : (
          <ShoppingBag className="w-9 h-9 opacity-45" />
        )}
        <span className="absolute left-2.5 top-2.5 h-[22px] px-2.5 rounded-full bg-white/95 dark:bg-[#0B1414]/95 backdrop-blur-xs text-[#0E1B1B] dark:text-[#E8F1F1] text-[11px] font-semibold flex items-center shadow-xs border border-black/5 dark:border-white/10">
          {typeLabel}
        </span>
      </div>

      {/* Price */}
      <div className="mt-2.5 font-semibold text-[16px] text-foreground tracking-tight">
        {priceDisplay}
      </div>

      {/* Title (2-Line Clamp) */}
      <div className="mt-0.5 text-[14px] text-foreground line-clamp-2 min-h-[2.8em] leading-snug">
        {product.title}
      </div>

      {/* Meta Row */}
      <div className="mt-1 flex items-center gap-1 text-[12px] text-muted-foreground overflow-hidden min-w-0">
        {product.vendor?.verification_status === 'verified' ? (
          <>
            <VerifiedBadge size={14} />
            <span className="truncate font-medium text-foreground/80 min-w-0">
              {product.vendor?.shop_name || 'Verified'}
            </span>
            {!isSingleCampusSelected && (
              <span className="truncate shrink-0 text-[11px]">
                · {campus === 'Both' ? 'Both campuses' : campus}
              </span>
            )}
          </>
        ) : (
          <span className="truncate min-w-0">
            {product.vendor?.shop_name ? `${product.vendor.shop_name} · ` : ''}
            {campus === 'Both' ? 'Both campuses' : campus}
          </span>
        )}
      </div>
    </Link>
  )
}
