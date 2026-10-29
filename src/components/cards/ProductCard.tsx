import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatNaira } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

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
  'campus-services': '/products/cadet-uniform-tailoring.jpg',
}

function isVideoMedia(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
}

export function ProductCard({ product }: ProductCardProps) {
  const categorySlug = product.category?.slug || ''
  const mediaUrl =
    product.images?.[0] ||
    CATEGORY_FALLBACK_IMAGES[categorySlug] ||
    '/products/cadet-action-rig-navy.jpg'
  const isVideo = isVideoMedia(mediaUrl)

  const hasValidLowStock =
    product.stock_status === 'low_stock' &&
    typeof product.stock_quantity === 'number' &&
    product.stock_quantity > 0

  const campusShort =
    product.campus ||
    (product.vendor?.campus === 'Kurutie' ? 'Kurutie' : 'Okerenkoko')

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      aria-label={`${product.title}, ${formatNaira(product.price)}${
        product.vendor ? `, sold by ${product.vendor.shop_name}` : ''
      }`}
      className="group flex min-w-0 flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* 1. Large Visual-First Product Media */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        {isVideo ? (
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
          <img
            src={mediaUrl}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className={cn(
              'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
              product.stock_status === 'out_of_stock' && 'opacity-60 grayscale'
            )}
          />
        )}

        {/* Minimal Status / Featured Pill */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          {product.is_featured ? (
            <span className="inline-flex items-center rounded-md bg-slate-950/80 backdrop-blur-xs border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
              Featured
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
      <div className="flex flex-1 min-w-0 flex-col justify-between p-3 sm:p-3.5 gap-1.5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
              {formatNaira(product.price)}
            </div>
            {hasValidLowStock && (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                Only {product.stock_quantity} left
              </span>
            )}
          </div>

          <h3 className="text-xs sm:text-sm font-medium text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.title}
          </h3>
        </div>

        {product.vendor && (
          <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-border/60 text-[11px] text-muted-foreground min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="truncate font-medium text-foreground/80">
                {product.vendor.shop_name}
              </span>
              {product.vendor.verification_status === 'verified' && (
                <BadgeCheck
                  className="h-3.5 w-3.5 text-primary shrink-0"
                  aria-label="Verified Vendor"
                />
              )}
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {campusShort}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
