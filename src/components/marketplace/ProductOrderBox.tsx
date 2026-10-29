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
      : `https://islandhub.nmu/product/${product.slug || product.id}`

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
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
      {/* Price & Stock Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <p className="text-xs font-medium text-slate-500">Displayed Price</p>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatNaira(product.price)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {product.stock_status === 'available' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              In Stock
            </span>
          )}
          {product.stock_status === 'low_stock' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Low Stock
            </span>
          )}
          {product.stock_status === 'out_of_stock' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Size Selector (if applicable) */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Select Size</span>
            <span className="text-slate-500">Included in WhatsApp inquiry</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'min-w-[44px] rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer',
                  selectedSize === size
                    ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] ring-1 ring-[#1E3A8A]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
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
          <span className="block text-xs font-semibold text-slate-700">
            Select Colour / Variant
          </span>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer',
                  selectedColor === color
                    ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] ring-1 ring-[#1E3A8A]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
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
        <span className="text-xs font-semibold text-slate-700">Quantity Needed</span>
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-xs font-bold text-slate-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(20, quantity + 1))}
            className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Pickup Location & Privacy Box */}
      {vendor && (
        <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              {vendor.location_type === 'delivery_only' ? (
                <>
                  <Truck className="h-4 w-4 text-blue-700 shrink-0" />
                  <span>Delivery-Only Vendor</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-blue-700 shrink-0" />
                  <span>Pickup & Collection Area</span>
                </>
              )}
            </div>
            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">
              {vendor.location_type.replace('_', ' ')}
            </span>
          </div>

          {vendor.location_type === 'delivery_only' ? (
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Coverage:</strong>{' '}
              {vendor.delivery_coverage || 'Delivers across NMU hostels and Okerenkoko.'}
            </p>
          ) : vendor.location_visibility === 'hidden' ? (
            <p className="text-xs text-slate-600 leading-relaxed">
              This vendor keeps their residential/hostel location private. Tap{' '}
              <strong>Ask vendor for pickup location</strong> below to arrange a campus meeting point.
            </p>
          ) : (
            <div className="space-y-1 text-xs text-slate-600">
              <p className="font-medium text-slate-800">
                {vendor.location_label || vendor.pickup_options}
              </p>
              {vendor.pickup_options && vendor.location_label !== vendor.pickup_options && (
                <p>{vendor.pickup_options}</p>
              )}
              {vendor.location_visibility === 'approximate' && (
                <p className="text-[11px] text-slate-500">
                  General area shown · Exact meeting spot is shared when you message the seller.
                </p>
              )}
            </div>
          )}

          {vendor.delivery_available && vendor.location_type !== 'delivery_only' && (
            <p className="text-[11px] text-blue-800 font-medium pt-1 border-t border-slate-200/70">
              ✓ Campus/hostel delivery also available ({vendor.delivery_coverage || 'NMU & Okerenkoko'})
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
            <MessageCircle className="h-5 w-5" />
            {isOutOfStock
              ? 'Ask Vendor When Back in Stock on WhatsApp'
              : 'Message Vendor on WhatsApp'}
          </a>
        )}

        {/* Secondary Location Action based on visibility */}
        {vendor && vendor.location_type !== 'delivery_only' && (
          <>
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="h-4 w-4 text-blue-700" />
                Get Directions on Google Maps
              </a>
            ) : (
              whatsappResult.valid && (
                <a
                  href={askLocationWhatsappResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-blue-700" />
                  Ask Vendor for Pickup Location
                </a>
              )
            )}
          </>
        )}
      </div>

      {/* Buyer Safeguard Notice */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-700 shrink-0" />
          Before you travel or pay:
        </div>
        <p className="leading-relaxed">
          Confirm current availability and pickup arrangements on WhatsApp first. Payments happen directly between you and the seller—inspect the item at pickup before paying.
        </p>
      </div>
    </div>
  )
}
