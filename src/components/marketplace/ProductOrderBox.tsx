'use client'

import { useState } from 'react'
import {
  MessageCircle,
  Navigation,
  MapPin,
  Truck,
  AlertCircle,
  ShieldCheck,
  Minus,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { Product } from '@/lib/types'
import {
  buildGoogleMapsDirectionsUrl,
  buildProductWhatsAppUrl,
  formatNaira,
} from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

interface ProductOrderBoxProps {
  product: Product
}

export function ProductOrderBox({ product }: ProductOrderBoxProps) {
  const sizes = product.variants?.sizes || []
  const colors = product.variants?.colors || []

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '')
  const [quantity, setQuantity] = useState<number>(1)

  const vendor = product.vendor
  const isOutOfStock = product.stock_status === 'out_of_stock'

  const hasValidLowStock =
    product.stock_status === 'low_stock' &&
    typeof product.stock_quantity === 'number' &&
    product.stock_quantity > 0

  const maxStock =
    typeof product.stock_quantity === 'number' && product.stock_quantity > 0
      ? product.stock_quantity
      : 20

  const totalPrice = product.price * quantity

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://jetty.ng/product/${product.slug || product.id}`

  const whatsappResult = buildProductWhatsAppUrl({
    whatsappNumber: vendor?.whatsapp_number || '',
    productTitle: product.title,
    price: product.price,
    selectedSize: selectedSize || undefined,
    selectedColor: selectedColor || undefined,
    quantity,
    productUrl: currentUrl,
    requestLivePhoto: !product.images || product.images.length === 0,
  })

  const askLocationWhatsappResult = buildProductWhatsAppUrl({
    whatsappNumber: vendor?.whatsapp_number || '',
    productTitle: product.title,
    price: product.price,
    selectedSize: selectedSize || undefined,
    selectedColor: selectedColor || undefined,
    quantity,
    productUrl: currentUrl,
    askingLocation: true,
  })

  const directionsUrl = vendor
    ? buildGoogleMapsDirectionsUrl({
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        locationVisibility: vendor.location_visibility,
        locationType: vendor.location_type,
      })
    : null

  const handleIncreaseQuantity = () => {
    if (quantity >= maxStock) {
      toast.info(`Only ${maxStock} available in stock`)
      return
    }
    setQuantity(quantity + 1)
  }

  return (
    <>
      <div className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xs min-w-0">
        {/* Price & Stock Header */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-border">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Price</p>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {formatNaira(product.price)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {product.stock_status === 'available' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                In Stock
              </span>
            )}
            {product.stock_status === 'low_stock' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {hasValidLowStock ? `Only ${product.stock_quantity} left` : 'Low Stock'}
              </span>
            )}
            {product.stock_status === 'out_of_stock' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Size Selector (if applicable) */}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {sizes.length === 1 ? 'Size' : 'Select Size'}
              </span>
              {sizes.length > 1 && (
                <span className="text-muted-foreground">Sent on WhatsApp</span>
              )}
            </div>
            {sizes.length === 1 ? (
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
                  {sizes[0]}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'min-w-[42px] rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer',
                      selectedSize === size
                        ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                        : 'border-border bg-background text-foreground hover:border-primary/40'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Colour Selector (if applicable) */}
        {colors.length > 0 && (
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-foreground">
              {colors.length === 1 ? 'Colour' : 'Select Colour / Variant'}
            </span>
            {colors.length === 1 ? (
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
                  {colors[0]}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer',
                      selectedColor === color
                        ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                        : 'border-border bg-background text-foreground hover:border-primary/40'
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quantity Selector with Live Total Calculation */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs font-semibold text-foreground block">Quantity</span>
            {quantity > 1 && (
              <span className="text-[11px] text-muted-foreground">
                Total: <strong className="text-foreground">{formatNaira(totalPrice)}</strong>
              </span>
            )}
          </div>
          <div className="inline-flex items-center rounded-lg border border-border bg-muted">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-xs font-bold text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncreaseQuantity}
              disabled={quantity >= maxStock}
              className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Pickup Location & Privacy Box */}
        {vendor && (
          <div className="rounded-xl border border-border bg-muted/50 p-3.5 sm:p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                {vendor.location_type === 'delivery_only' ? (
                  <>
                    <Truck className="h-4 w-4 text-primary shrink-0" />
                    <span>Delivery-Only Vendor</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>Pickup &amp; Collection</span>
                  </>
                )}
              </div>
              <span className="rounded-md bg-card border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize shrink-0">
                {vendor.location_type.replace('_', ' ')}
              </span>
            </div>

            {vendor.location_type === 'delivery_only' ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Coverage:</strong>{' '}
                {vendor.delivery_coverage || 'Delivers across NMU hostels and Okerenkoko.'}
              </p>
            ) : vendor.location_visibility === 'hidden' ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Private hostel/home location. Message vendor on WhatsApp to arrange a campus meeting point.
              </p>
            ) : (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  {vendor.location_label || vendor.pickup_options}
                </p>
                {vendor.pickup_options && vendor.location_label !== vendor.pickup_options && (
                  <p>{vendor.pickup_options}</p>
                )}
              </div>
            )}

            {vendor.delivery_available && vendor.location_type !== 'delivery_only' && (
              <p className="text-[11px] text-primary font-medium pt-1 border-t border-border">
                ✓ Campus delivery available ({vendor.delivery_coverage || 'NMU hostels'} · fee agreed on WhatsApp)
              </p>
            )}
          </div>
        )}

        {/* Primary Action Buttons (Desktop / Tablet) */}
        <div className="space-y-2.5">
          {!whatsappResult.valid ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-center gap-2.5 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{whatsappResult.error}</span>
            </div>
          ) : (
            <a
              href={whatsappResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-opacity',
                isOutOfStock
                  ? 'bg-slate-700 text-white hover:bg-slate-800'
                  : 'bg-[#25D366] text-white hover:opacity-90'
              )}
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              <span className="truncate">
                {isOutOfStock ? 'Ask When Back in Stock' : 'Order on WhatsApp'}
              </span>
            </a>
          )}

          {vendor && vendor.location_type !== 'delivery_only' && (
            <>
              {directionsUrl ? (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-xl border border-border bg-background text-foreground hover:bg-muted font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="h-4 w-4 text-primary" />
                  Get Directions on Google Maps
                </a>
              ) : (
                whatsappResult.valid && (
                  <a
                    href={askLocationWhatsappResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-xl border border-border bg-background text-foreground hover:bg-muted font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    Ask Vendor for Pickup Location
                  </a>
                )
              )}
            </>
          )}
        </div>

        {/* Buyer Safeguard Notice */}
        <div className="rounded-xl bg-muted/60 border border-border p-3 space-y-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            Before you pay:
          </div>
          <p className="leading-relaxed">
            Confirm stock on WhatsApp first. Inspect your item at pickup before paying the seller directly.
          </p>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar (< md screens) */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border bg-card/95 backdrop-blur-md px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-extrabold text-foreground tracking-tight leading-none">
            {formatNaira(totalPrice)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {quantity > 1 ? `${quantity} items` : hasValidLowStock ? `Only ${product.stock_quantity} left` : 'In stock'}
          </p>
        </div>

        {whatsappResult.valid ? (
          <a
            href={whatsappResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold text-white shadow-sm transition-opacity shrink-0',
              isOutOfStock ? 'bg-slate-700 hover:bg-slate-800' : 'bg-[#25D366] hover:opacity-90'
            )}
          >
            <MessageCircle className="h-4.5 w-4.5" />
            <span>{isOutOfStock ? 'Notify When Ready' : 'Order on WhatsApp'}</span>
          </a>
        ) : (
          <span className="text-xs text-red-500 font-semibold">Contact unavailable</span>
        )}
      </div>
    </>
  )
}
