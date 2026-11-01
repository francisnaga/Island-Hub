import Link from 'next/link'
import { Briefcase, ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatNaira } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { getServiceBySlug, inferServiceSlugFromProduct } from '@/lib/services-data'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface ProductCardProps {
  product: Product
  offerCount?: number
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'maritime-cadet-gear': '/products/cadet-action-rig-navy.jpg',
  'electronics-gadgets': '/products/mi-power-bank-silver.jpg',
  'books-stationery': '/products/casio-scientific-calculator.jpg',
  'hostel-daily-essentials': '/products/rechargeable-table-fan-white.jpg',
  'fashion-accessories': '/products/cadet-beret-gloves-pack.jpg',
  'food-beauty-other': '/products/fresh-fruit-salad-bowl.jpg',
}

function isVideoMedia(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
}

export function ProductCard({ product }: ProductCardProps) {
  const categorySlug = product.category?.slug || ''
  const isService = product.listing_type === 'service'
  const matchedService = isService
    ? getServiceBySlug(inferServiceSlugFromProduct(product))
    : null
  const ServiceIcon = (matchedService?.icon as any) || Briefcase

  const rawImage = product.images?.[0]
  const fallbackImage = isService
    ? null
    : CATEGORY_FALLBACK_IMAGES[categorySlug] || '/products/cadet-action-rig-navy.jpg'
  const mediaUrl = rawImage || fallbackImage
  const isVideo = mediaUrl ? isVideoMedia(mediaUrl) : false

  const hasValidLowStock =
    product.stock_status === 'low_stock' &&
    typeof product.stock_quantity === 'number' &&
    product.stock_quantity > 0

  const campusShort =
    product.campus ||
    (product.vendor?.campus === 'Kurutie' ? 'Kurutie' : 'Okerenkoko')

  const vendorStoreHref = product.vendor?.slug
    ? `/vendors/${product.vendor.slug}`
    : product.vendor?.id
    ? `/vendors/${product.vendor.id}`
    : `/product/${product.slug || product.id}`

  const targetHref = isService ? vendorStoreHref : `/product/${product.slug || product.id}`
  const priceDisplay =
    isService && product.price > 0
      ? `From ${formatNaira(product.price)}`
      : formatNaira(product.price)

  return (
    <Link
      href={targetHref}
      aria-label={`${product.title}, ${priceDisplay}${
        product.vendor ? `, offered by ${product.vendor.shop_name}` : ''
      }`}
      className="group flex min-w-0 flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* 1. Large Visual-First Product Media */}
      <div className="relative aspect-square md:aspect-[4/3] w-full bg-muted overflow-hidden flex items-center justify-center">
        {mediaUrl ? (
          isVideo ? (
            <video
              src={mediaUrl}
              muted
              loop
              playsInline
              autoPlay
              className={cn(
                'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
                product.stock_status === 'out_of_stock' && 'opacity-60 grayscale'
              )}
            />
          ) : (
            <OptimizedImage
              src={mediaUrl}
              alt={product.title}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
              className={cn(
                'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
                product.stock_status === 'out_of_stock' && 'opacity-60 grayscale'
              )}
            />
          )
        ) : (
          <div className="w-full h-full bg-[#E6F2F2] dark:bg-[#132A2A] flex flex-col items-center justify-center text-[#0F6E6E] dark:text-[#22D3EE] p-4 text-center">
            {isService ? (
              <>
                <ServiceIcon className="w-10 h-10 stroke-[1.75] mb-2 opacity-80" />
                <span className="text-xs font-semibold text-foreground line-clamp-2">
                  {product.title}
                </span>
                <span className="mt-1 text-[11px] font-semibold text-[#0F6E6E] dark:text-[#22D3EE]">
                  {matchedService?.shortTitle || 'Service'}
                </span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-10 h-10 stroke-[1.75] mb-2 opacity-75" />
                <span className="text-xs font-semibold text-foreground line-clamp-2">
                  {product.title}
                </span>
              </>
            )}
          </div>
        )}

        {/* Minimal Status / Featured Pill */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          {product.is_featured ? (
            <span className="inline-flex items-center rounded-md bg-slate-950/80 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
              Featured
            </span>
          ) : isService ? (
            <span className="inline-flex items-center rounded-md bg-white/95 dark:bg-slate-950/90 backdrop-blur-xs border border-black/5 dark:border-white/15 px-2 py-0.5 text-[10px] font-bold text-[#0F6E6E] dark:text-[#22D3EE]">
              {matchedService?.shortTitle || 'Service'}
            </span>
          ) : (
            <span />
          )}

          {product.stock_status === 'out_of_stock' && (
            <span className="rounded-md bg-slate-950/85 px-2 py-0.5 text-[10px] font-semibold text-white">
              Sold out
            </span>
          )}
        </div>
      </div>

      {/* 2. Clean 3-Line Visual Body: Price -> Title -> Seller */}
      <div className="flex flex-1 min-w-0 flex-col justify-between p-3 sm:p-3.5 md:p-4 gap-1.5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-sm sm:text-base md:text-[15px] font-extrabold text-foreground tracking-tight">
              {priceDisplay}
            </div>
            {hasValidLowStock && (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                Only {product.stock_quantity} left
              </span>
            )}
          </div>

          <h3 className="text-xs sm:text-sm md:text-[13px] font-medium text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.title}
          </h3>
        </div>

        {product.vendor && (
          <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-border/60 text-[11px] text-muted-foreground min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <UserAvatar
                src={product.vendor.logo_url}
                seed={product.vendor.id || product.vendor.slug}
                name={product.vendor.shop_name}
                size={16}
                className="w-4 h-4 shrink-0 border border-border/80 shadow-2xs"
              />
              <span className="truncate font-medium text-foreground/80 min-w-0 block">
                {product.vendor.shop_name}
              </span>
              {product.vendor.verification_status === 'verified' && (
                <VerifiedBadge size={13} />
              )}
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
              {campusShort}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
