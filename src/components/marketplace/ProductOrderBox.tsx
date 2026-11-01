'use client'

import { useState } from 'react'
import { Minus, Plus, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Product, Vendor } from '@/lib/types'
import {
  buildProductWhatsAppUrl,
  formatNaira,
} from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/brand/WhatsAppIcon'

interface ProductOrderBoxProps {
  product: Product
  vendor: Vendor | null
  productUrl: string
}

export function ProductOrderBox({ product, vendor, productUrl }: ProductOrderBoxProps) {
  const sizes = product.variants?.sizes || []
  const colors = product.variants?.colors || []

  const [quantity, setQuantity] = useState<number>(1)
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '')

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const hasValidLowStock =
    product.stock_status === 'low_stock' &&
    typeof product.stock_quantity === 'number' &&
    product.stock_quantity > 0

  // Only restrict to stock_quantity if the vendor explicitly marked this item as low_stock!
  // Normal available items allow purchasing multiple units (up to 99).
  const maxStock =
    hasValidLowStock && typeof product.stock_quantity === 'number' && product.stock_quantity > 0
      ? product.stock_quantity
      : 99

  const totalPrice = product.price * quantity

  const whatsappResult = buildProductWhatsAppUrl({
    whatsappNumber: vendor?.whatsapp_number || '',
    productTitle: product.title,
    price: product.price,
    selectedSize: selectedSize || undefined,
    selectedColor: selectedColor || undefined,
    quantity,
    productUrl,
    requestLivePhoto: !product.images || product.images.length === 0,
  })

  // Decrement quantity strictly clamped to minimum of 1
  const handleDecreaseQuantity = () => {
    setQuantity((q) => Math.max(1, q - 1))
  }

  // Increment quantity up to maxStock
  const handleIncreaseQuantity = () => {
    if (quantity >= maxStock) {
      toast.info(`Maximum available quantity is ${maxStock}`)
      return
    }
    setQuantity((q) => q + 1)
  }

  return (
    <>
      {/* 1. Inline Order Details & Quantity Box (in page body) */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-4 shadow-2xs">
        {/* Available Sizes (if provided) */}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {sizes.length === 1 ? 'Size' : 'Select Size'}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Sent to seller on WhatsApp
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const isSelected = selectedSize === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#0F6E6E] text-white border-[#0F6E6E] dark:bg-[#14B8A6] dark:border-[#14B8A6] dark:text-slate-950 shadow-2xs'
                        : 'bg-muted/50 border-border text-foreground hover:border-[#0F6E6E]/40'
                    )}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Colors (if provided) */}
        {colors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {colors.length === 1 ? 'Color / Variant' : 'Select Color / Variant'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => {
                const isSelected = selectedColor === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#0F6E6E] text-white border-[#0F6E6E] dark:bg-[#14B8A6] dark:border-[#14B8A6] dark:text-slate-950 shadow-2xs'
                        : 'bg-muted/50 border-border text-foreground hover:border-[#0F6E6E]/40'
                    )}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quantity Selection */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Quantity
              </span>
              {hasValidLowStock && (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  (Only {product.stock_quantity} left)
                </span>
              )}
            </div>

            {/* Quantity Stepper */}
            <div className="inline-flex items-center rounded-xl border border-border bg-muted/70 p-1 shadow-2xs">
              <button
                type="button"
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1 || isOutOfStock}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-base text-foreground font-[family-name:var(--font-bricolage)] select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncreaseQuantity}
                disabled={quantity >= maxStock || isOutOfStock}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer active:scale-95"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Price Multiplication Breakdown */}
          <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-[#E6F2F2] dark:bg-[#132A2A] text-xs transition-all">
            <span className="text-muted-foreground font-medium">
              {quantity > 1 ? (
                <>
                  Total ({quantity} × {formatNaira(product.price)}):
                </>
              ) : (
                'Price (1 unit):'
              )}
            </span>
            <span className="font-extrabold text-base text-[#0F6E6E] dark:text-[#22D3EE] font-[family-name:var(--font-bricolage)] tracking-tight">
              {formatNaira(totalPrice)}
            </span>
          </div>
        </div>

        {/* Campus Safety Tip */}
        <div className="flex items-start gap-2.5 pt-1 text-[11px] text-muted-foreground leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0 mt-0.5" />
          <span>Quantity &amp; calculated total are automatically included in your WhatsApp message.</span>
        </div>
      </div>

      {/* 2. Solid Bottom Action Bar (Pinned flush to viewport bottom edge) */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 w-full bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.10)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="container mx-auto max-w-lg md:max-w-5xl px-4 py-3 flex items-center justify-between gap-4 min-h-[72px]">
          {/* Price & Quantity Summary */}
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-baseline gap-1.5">
              <b className="text-xl sm:text-2xl font-bold text-foreground font-[family-name:var(--font-bricolage)] tracking-tight leading-none">
                {formatNaira(totalPrice)}
              </b>
            </div>
            <span className="text-xs text-muted-foreground truncate mt-1 font-medium">
              {quantity > 1
                ? `${quantity} items (${formatNaira(product.price)} ea)`
                : 'Pay when you meet'}
            </span>
          </div>

          {/* WhatsApp CTA Button */}
          <div className="shrink-0">
            {whatsappResult.valid ? (
              <a
                href={whatsappResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 sm:h-13 px-5 sm:px-8 rounded-2xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
                <span className="whitespace-nowrap">
                  {isOutOfStock ? 'Notify seller' : 'Message seller'}
                </span>
              </a>
            ) : (
              <span className="text-xs text-red-500 font-semibold px-2">
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
