import Link from 'next/link'
import { BadgeCheck, MapPin, Package, AlertTriangle } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatNaira, isListingStale } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || ''
  const stale = isListingStale(product.last_confirmed_at, 14)

  const stockBadge = () => {
    if (product.stock_status === 'out_of_stock') {
      return (
        <span className="inline-flex items-center rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-white">
          Out of Stock
        </span>
      )
    }
    if (product.stock_status === 'low_stock') {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-900">
          Low Stock
        </span>
      )
    }
    return null
  }

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className="group flex min-w-0 flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-[#0F6E6E]/50 hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-square sm:aspect-4/3 w-full bg-muted overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            loading="lazy"
            className={cn(
              'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
              product.stock_status === 'out_of_stock' && 'opacity-60 grayscale'
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <Package className="h-9 w-9" />
          </div>
        )}

        {/* Top Left Category / Stock Badge */}
        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1">
          {product.category && (
            <span className="max-w-full truncate rounded-md bg-card/95 backdrop-blur-xs border border-border px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-foreground shadow-2xs">
              {product.category.short_name || product.category.name}
            </span>
          )}
          {stockBadge()}
        </div>

        {/* Stale confirmation indicator if applicable */}
        {stale && product.stock_status !== 'out_of_stock' && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5">
            <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-amber-50/95 border border-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 truncate">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span className="truncate">Confirm stock</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 min-w-0 flex-col justify-between p-2.5 sm:p-4 gap-2 sm:gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors leading-snug">
            {product.title}
          </h3>

          {product.variants &&
            ((product.variants.sizes && product.variants.sizes.length > 0) ||
              (product.variants.colors && product.variants.colors.length > 0)) && (
              <p className="text-[11px] text-muted-foreground truncate">
                {product.variants.sizes && product.variants.sizes.length > 0
                  ? `Sizes: ${product.variants.sizes.slice(0, 3).join(', ')}${
                      product.variants.sizes.length > 3 ? '+' : ''
                    }`
                  : ''}
                {product.variants.sizes?.length && product.variants.colors?.length ? ' · ' : ''}
                {product.variants.colors && product.variants.colors.length > 0
                  ? product.variants.colors.join(', ')
                  : ''}
              </p>
            )}
        </div>

        <div className="space-y-1.5 sm:space-y-2 pt-1.5 border-t border-border/60 min-w-0">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-sm sm:text-base font-extrabold text-foreground tracking-tight truncate">
              {formatNaira(product.price)}
            </span>
            <span className="hidden sm:inline text-[11px] font-medium text-[#0F6E6E] dark:text-[#E8B84A] group-hover:underline shrink-0">
              View →
            </span>
          </div>

          {product.vendor && (
            <div className="flex items-center justify-between gap-1.5 text-[11px] text-muted-foreground min-w-0">
              <div className="flex items-center gap-1 min-w-0 truncate">
                <span className="truncate font-medium text-foreground/85">
                  {product.vendor.shop_name}
                </span>
                {product.vendor.verification_status === 'verified' && (
                  <BadgeCheck
                    className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0"
                    aria-label="Verified Vendor"
                  />
                )}
              </div>
              {product.vendor.location_visibility !== 'hidden' &&
                product.vendor.location_label && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0 max-w-[100px] truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{product.vendor.location_label}</span>
                  </span>
                )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
