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
        <span className="inline-flex items-center rounded-md bg-slate-800/90 px-2 py-0.5 text-[11px] font-semibold text-white">
          Out of Stock
        </span>
      )
    }
    if (product.stock_status === 'low_stock') {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
          Low Stock
        </span>
      )
    }
    return null
  }

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className="group flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all hover:border-[#0F6E6E]/40 hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
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
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <Package className="h-10 w-10" />
          </div>
        )}

        {/* Top Left Category / Condition Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {product.category && (
            <span className="rounded-md bg-white/95 backdrop-blur-xs border border-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow-2xs">
              {product.category.short_name || product.category.name}
            </span>
          )}
          {stockBadge()}
        </div>

        {/* Stale confirmation indicator if applicable */}
        {stale && product.stock_status !== 'out_of_stock' && (
          <div className="absolute bottom-2 left-2.5 right-2.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50/95 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              Confirm availability with seller
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4 gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-[#0F6E6E] transition-colors leading-snug">
            {product.title}
          </h3>

          {product.variants &&
            ((product.variants.sizes && product.variants.sizes.length > 0) ||
              (product.variants.colors && product.variants.colors.length > 0)) && (
              <p className="text-xs text-slate-500 truncate">
                {product.variants.sizes && product.variants.sizes.length > 0
                  ? `Sizes: ${product.variants.sizes.slice(0, 4).join(', ')}${
                      product.variants.sizes.length > 4 ? '+' : ''
                    }`
                  : ''}
                {product.variants.sizes?.length && product.variants.colors?.length ? ' · ' : ''}
                {product.variants.colors && product.variants.colors.length > 0
                  ? product.variants.colors.join(', ')
                  : ''}
              </p>
            )}
        </div>

        <div className="space-y-2.5 pt-1 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-base font-bold text-slate-900 tracking-tight">
              {formatNaira(product.price)}
            </span>
            <span className="text-[11px] font-medium text-[#0F6E6E] group-hover:underline">
              View prices →
            </span>
          </div>

          {product.vendor && (
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1 truncate">
                <span className="truncate font-medium text-slate-700">
                  {product.vendor.shop_name}
                </span>
                {product.vendor.verification_status === 'verified' && (
                  <BadgeCheck
                    className="h-3.5 w-3.5 text-[#0F6E6E] shrink-0"
                    aria-label="Verified Vendor"
                  />
                )}
              </div>
              {product.vendor.location_visibility !== 'hidden' &&
                product.vendor.location_label && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 shrink-0 max-w-[110px] truncate">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
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
