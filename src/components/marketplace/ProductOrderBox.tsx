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

  return (
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              In Stock
            </span>
          )}
          {product.stock_status === 'low_stock' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Low Stock
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
            <span className="font-semibold text-foreground">Select Size</span>
            <span className="text-muted-foreground">Sent on WhatsApp</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'min-w-[42px] rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer',
                  selectedSize === size
                    ? 'border-[#0F6E6E] bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white ring-1 ring-[#0F6E6E]'
                    : 'border-border bg-background text-foreground hover:border-[#0F6E6E]/40'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colour Selector (if applicable) */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-foreground">
            Select Colour / Variant
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer',
                  selectedColor === color
                    ? 'border-[#0F6E6E] bg-[#E6F2F2] text-[#0A4F4F] dark:bg-[#132A2A] dark:text-white ring-1 ring-[#0F6E6E]'
                    : 'border-border bg-background text-foreground hover:border-[#0F6E6E]/40'
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-foreground">Quantity</span>
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
            onClick={() => setQuantity(Math.min(20, quantity + 1))}
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
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
                  <Truck className="h-4 w-4 text-[#0F6E6E] shrink-0" />
                  <span>Delivery-Only Vendor</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
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
              Private hostel/home location. Tap <strong>Ask vendor for pickup location</strong> below to arrange a campus meeting point.
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
            <p className="text-[11px] text-[#0F6E6E] dark:text-[#E8B84A] font-medium pt-1 border-t border-border">
              ✓ Campus delivery also available ({vendor.delivery_coverage || 'NMU & Okerenkoko'})
            </p>
          )}
        </div>
      )}

      {/* Primary Action Buttons: WhatsApp & Google Maps Directions */}
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
              'w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all',
              isOutOfStock
                ? 'bg-slate-700 text-white hover:bg-slate-800'
                : 'bg-[#16A34A] text-white hover:bg-green-700'
            )}
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <span className="truncate">
              {isOutOfStock ? 'Ask When Back in Stock' : 'Message Vendor on WhatsApp'}
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
                <Navigation className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
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
                  <MapPin className="h-4 w-4 text-[#0F6E6E] dark:text-[#E8B84A]" />
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
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F6E6E] dark:text-[#E8B84A] shrink-0" />
          Before you pay:
        </div>
        <p className="leading-relaxed">
          Confirm stock on WhatsApp first. Inspect your item at pickup before paying the seller directly.
        </p>
      </div>
    </div>
  )
}
