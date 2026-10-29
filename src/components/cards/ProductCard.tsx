import Link from 'next/link'
import {
  BadgeCheck,
  MapPin,
  Package,
  AlertTriangle,
  Anchor,
  Laptop,
  BookOpen,
  Home,
  Shirt,
  CameraOff,
  Clock,
} from 'lucide-react'
import { Product, Vendor } from '@/lib/types'
import { daysSinceConfirmed, formatNaira, isListingStale } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  offerCount?: number
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Anchor,
  Laptop,
  BookOpen,
  Home,
  Shirt,
  Package,
}

function getSellerTypeBadge(vendor: Vendor): string {
  if (vendor.location_type === 'delivery_only') return 'Delivery only'
  if (vendor.location_type === 'pickup_point') return 'Campus pickup'
  if (vendor.location_type === 'home_based') return 'Student seller'
  if (vendor.location_type === 'shop') {
    return vendor.is_student ? 'Student seller · Shop' : 'Physical shop'
  }
  return vendor.is_student ? 'Student seller' : 'Local seller'
}

export function ProductCard({ product, offerCount = 1 }: ProductCardProps) {
  const imageUrl = product.images?.[0] || ''
  const stale = isListingStale(product.last_confirmed_at, 14)
  const daysConfirmed = daysSinceConfirmed(product.last_confirmed_at)
  const CategoryIcon =
    (product.category?.icon && categoryIcons[product.category.icon]) || Package

  const hasValidLowStock =
    product.stock_status === 'low_stock' &&
    typeof product.stock_quantity === 'number' &&
    product.stock_quantity > 0

  const stockBadge = () => {
    if (product.stock_status === 'out_of_stock') {
      return (
        <span className="inline-flex items-center rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-white">
          Out of stock
        </span>
      )
    }
    if (hasValidLowStock) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-950">
          Low stock ({product.stock_quantity} left)
        </span>
      )
    }
    return null
  }

  const variantSummary = [
    product.variants?.sizes?.length
      ? `Sizes: ${product.variants.sizes.join(', ')}`
      : '',
    product.variants?.colors?.length ? product.variants.colors.join(', ') : '',
    product.variants?.custom_label || '',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      aria-label={`${product.title}, ${formatNaira(product.price)}${
        product.vendor ? `, sold by ${product.vendor.shop_name}` : ''
      }`}
      className="group flex min-w-0 flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-[#0F6E6E]/60 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E]"
    >
      {/* 1. Accurate Photo or Structured Seller-Photo-Pending Placeholder */}
      <div className="relative aspect-4/3 w-full bg-muted overflow-hidden border-b border-border/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${product.title}${
              product.variants?.colors?.length
                ? ` (${product.variants.colors.join(', ')})`
                : ''
            } — sold by ${product.vendor?.shop_name || 'verified seller on Jetty'}`}
            loading="lazy"
            className={cn(
              'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
              product.stock_status === 'out_of_stock' && 'opacity-60 grayscale'
            )}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-3 sm:p-4 text-center bg-gradient-to-b from-muted/50 to-muted">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-card border border-border text-[#0F6E6E] dark:text-[#E8B84A] shadow-2xs mb-2">
              <CategoryIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[10px] font-semibold text-amber-950 dark:text-amber-200">
              <CameraOff className="h-3 w-3 shrink-0" />
              Seller photo pending
            </span>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 line-clamp-2 max-w-[200px] leading-tight">
              Ask vendor for live item photo on WhatsApp before pickup
            </p>
          </div>
        )}

        {/* Top Category & Stock Status Badges */}
        <div className="absolute top-2 left-2 right-2 flex flex-wrap items-center justify-between gap-1 pointer-events-none">
          {product.category && (
            <span className="max-w-full truncate rounded-md bg-card/95 backdrop-blur-xs border border-border px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-foreground shadow-2xs">
              {product.category.name}
            </span>
          )}
          {stockBadge()}
        </div>

        {/* Stale confirmation warning if >14 days */}
        {stale && product.stock_status !== 'out_of_stock' && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5">
            <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-amber-50/95 border border-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 truncate">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span className="truncate">Confirm stock on WhatsApp</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Body: Title -> Price -> Variants -> Seller & Location -> Stock Confirmation */}
      <div className="flex flex-1 min-w-0 flex-col justify-between p-3 sm:p-4 gap-2.5">
        <div className="space-y-1.5 min-w-0">
          {/* 2. Full, readable product name */}
          <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-[#0F6E6E] dark:group-hover:text-[#E8B84A] transition-colors leading-snug">
            {product.title}
          </h3>

          {/* 3. Price and Currency */}
          <div className="flex items-baseline justify-between gap-1.5 pt-0.5">
            <span className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
              {formatNaira(product.price)}
            </span>
            <span className="text-[11px] font-semibold text-[#0F6E6E] dark:text-[#E8B84A] group-hover:underline shrink-0">
              {offerCount > 1 ? 'Compare sellers →' : 'View product →'}
            </span>
          </div>

          {/* 4. Available sizes or essential variants */}
          {variantSummary && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {variantSummary}
            </p>
          )}
        </div>

        {/* 5. Seller Name (full line) + Pickup Landmark & Stock Confirmation beneath */}
        <div className="space-y-1.5 pt-2 border-t border-border/70 min-w-0 text-[11px]">
          {product.vendor && (
            <div className="space-y-1 min-w-0">
              {/* Full line for vendor name */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-semibold text-foreground line-clamp-1">
                  {product.vendor.shop_name}
                </span>
                {product.vendor.verification_status === 'verified' && (
                  <BadgeCheck
                    className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0"
                    aria-label="Verified Vendor"
                  />
                )}
              </div>

              {/* Separate line for Seller Type + Campus / Landmark */}
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-muted-foreground min-w-0">
                <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-foreground/80 shrink-0">
                  {getSellerTypeBadge(product.vendor)}
                </span>
                {product.vendor.location_visibility !== 'hidden' &&
                  product.vendor.location_label && (
                    <span className="inline-flex items-center gap-0.5 min-w-0 truncate">
                      <MapPin className="h-3 w-3 shrink-0 text-[#0F6E6E] dark:text-[#E8B84A]" />
                      <span className="truncate">{product.vendor.location_label}</span>
                    </span>
                  )}
              </div>
            </div>
          )}

          {/* 6. Truthful Stock / Last-Confirmed Indicator */}
          <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground pt-0.5">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 shrink-0" />
              {daysConfirmed === 0
                ? 'Stock confirmed today'
                : `Confirmed ${daysConfirmed}d ago`}
            </span>
            {product.stock_status === 'available' &&
              typeof product.stock_quantity === 'number' &&
              product.stock_quantity > 0 && (
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  In stock
                </span>
              )}
          </div>
        </div>
      </div>
    </Link>
  )
}
