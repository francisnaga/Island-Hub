'use client'

import { useState } from 'react'
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

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '')

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const hasVariants = sizes.length > 0 || colors.length > 0

  const whatsappResult = buildProductWhatsAppUrl({
    whatsappNumber: vendor?.whatsapp_number || '',
    productTitle: product.title,
    price: product.price,
    selectedSize: selectedSize || undefined,
    selectedColor: selectedColor || undefined,
    quantity: 1,
    productUrl,
    requestLivePhoto: !product.images || product.images.length === 0,
  })

  return (
    <>
      {/* 1. Optional Variants Box (Only if sizes or colors are configured) */}
      {hasVariants && (
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-4 shadow-2xs">
          {/* Available Sizes */}
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

          {/* Available Colors */}
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
        </div>
      )}

      {/* 2. Solid Bottom Action Bar (Fixed flush to viewport bottom edge) */}
      <div className="fixed bottom-0 inset-x-0 z-50 w-full bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom,0px)] after:absolute after:top-full after:left-0 after:right-0 after:h-40 after:bg-card">
        <div className="container mx-auto max-w-lg md:max-w-5xl px-4 h-[68px] flex items-center justify-between gap-4">
          {/* Price & Meetup Info */}
          <div className="min-w-0 flex flex-col justify-center">
            <b className="text-[21px] sm:text-[23px] font-bold text-foreground tabular-nums tracking-tight leading-none">
              {formatNaira(product.price)}
            </b>
            <span className="text-[11.5px] text-muted-foreground truncate font-medium mt-1 leading-none">
              {isOutOfStock ? 'Sold out' : 'Pay when you meet'}
            </span>
          </div>

          {/* WhatsApp Message Seller CTA Button */}
          <div className="shrink-0">
            {whatsappResult.valid ? (
              <a
                href={whatsappResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 sm:h-12 px-5 sm:px-7 rounded-xl sm:rounded-2xl bg-[#0F6E6E] hover:bg-[#0A4F4F] active:bg-[#083E3E] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white font-semibold text-[14px] sm:text-[15px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <WhatsAppIcon className="w-4.5 h-4.5 text-white shrink-0" />
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
