'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Building2,
  Images,
} from 'lucide-react'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { ShareButton } from '@/components/shared/ShareButton'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[]
  title: string
  backHref: string
  backLabel?: string
  sharePath: string
  shareText?: string
  fallbackType?: 'product' | 'housing'
  campus?: string
  subtitle?: string
  className?: string
}

export function ProductImageGallery({
  images,
  title,
  backHref,
  backLabel = 'Back',
  sharePath,
  shareText,
  fallbackType = 'product',
  campus,
  subtitle,
  className,
}: ProductImageGalleryProps) {
  // Filter out any broken / placeholder strings
  const validImages = (images || []).filter(
    (img) =>
      Boolean(img) &&
      typeof img === 'string' &&
      img.trim().length > 0 &&
      !img.includes('cadet-uniform-tailoring.jpg')
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const thumbnailRailRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScrollRef = useRef(false)

  const hasMultipleImages = validImages.length > 1

  // Handle native swipe / scroll in main carousel
  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return
    const el = scrollContainerRef.current
    if (!el) return
    const width = el.clientWidth
    if (width > 0) {
      const newIndex = Math.round(el.scrollLeft / width)
      if (
        newIndex >= 0 &&
        newIndex < validImages.length &&
        newIndex !== activeIndex
      ) {
        setActiveIndex(newIndex)
      }
    }
  }, [activeIndex, validImages.length])

  // Smooth scroll to target slide
  const scrollToSlide = (index: number) => {
    const el = scrollContainerRef.current
    if (!el) return
    const clampedIndex = Math.max(0, Math.min(index, validImages.length - 1))

    isProgrammaticScrollRef.current = true
    setActiveIndex(clampedIndex)

    el.scrollTo({
      left: clampedIndex * el.clientWidth,
      behavior: 'smooth',
    })

    // Reset programmatic flag after smooth scroll completes
    setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 400)
  }

  // Keep active thumbnail visible in the rail
  useEffect(() => {
    const rail = thumbnailRailRef.current
    if (!rail) return
    const activeThumb = rail.children[activeIndex] as HTMLElement | undefined
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [activeIndex])

  return (
    <div
      className={cn(
        'w-full min-w-0 md:col-span-6 md:sticky md:top-20 flex flex-col gap-2.5',
        className
      )}
    >
      {/* ── Main Photo Frame: Full-bleed on mobile reaching top, left, and right edges with rounded bottom curve ── */}
      <div
        className={cn(
          'relative w-full mx-0 mt-0 rounded-none rounded-b-[28px] sm:rounded-b-3xl border-0 border-b border-border/70 overflow-hidden select-none group',
          'md:rounded-3xl md:border md:border-border/80 md:shadow-xs md:mx-0 md:mt-0',
          'bg-[#DCEBEB] dark:bg-[#132A2A]',
          fallbackType === 'housing' ? 'aspect-[16/11] md:aspect-[16/10]' : 'aspect-square md:aspect-[4/3]'
        )}
      >
        {/* Slides Scroll Container — touch-action enables effortless vertical page scrolling while preserving horizontal swipe */}
        {validImages.length > 0 ? (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={cn(
              'slides absolute inset-0 flex',
              hasMultipleImages
                ? 'overflow-x-auto scrollbar-none snap-x snap-mandatory'
                : 'overflow-hidden'
            )}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              touchAction: hasMultipleImages ? 'pan-x pan-y pinch-zoom' : 'pan-y',
            }}
          >
            {validImages.map((img, idx) => (
              <div
                key={idx}
                className="relative flex-none w-full h-full snap-center shrink-0"
              >
                <OptimizedImage
                  src={img}
                  alt={`${title} - View ${idx + 1}`}
                  priority={idx === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 550px"
                  className="w-full h-full object-cover pointer-events-none"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      {fallbackType === 'housing' ? (
                        <Building2 className="w-16 h-16 opacity-35 text-[#0F6E6E]" />
                      ) : (
                        <ShoppingBag className="w-16 h-16 opacity-35 text-[#0F6E6E]" />
                      )}
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#E6F2F2] to-[#D5E7E7] dark:from-[#112323] dark:to-[#0D1818] p-6 text-center pointer-events-none">
            <div className="w-20 h-20 rounded-3xl bg-[#0F6E6E]/15 dark:bg-[#14B8A6]/15 text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center mb-3 shadow-2xs">
              {fallbackType === 'housing' ? (
                <Building2 className="w-10 h-10 stroke-[1.8]" />
              ) : (
                <ShoppingBag className="w-10 h-10 stroke-[1.8]" />
              )}
            </div>
            <b className="text-base font-semibold text-foreground line-clamp-2 max-w-xs">
              {title}
            </b>
            {(subtitle || campus) && (
              <span className="text-xs text-muted-foreground mt-1 capitalize">
                {subtitle}
                {subtitle && campus ? ' · ' : ''}
                {campus || 'NMU'}
              </span>
            )}
          </div>
        )}

        {/* ── Floating Back Button ── */}
        <Link
          href={backHref}
          className="ov l cursor-pointer flex items-center justify-center"
          aria-label={backLabel}
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5 stroke-[2.2]" />
        </Link>

        {/* ── Direct Deep-Link Share Button ── */}
        <ShareButton
          path={sharePath}
          title={title}
          shareText={shareText || `Check out ${title} on Jetty:`}
          className="ov r cursor-pointer flex items-center justify-center"
          iconClassName="w-4.5 h-4.5 stroke-[2]"
        />

        {/* ── Desktop Prev / Next Chevrons (Only when 2+ images) ── */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous photo"
              className={cn(
                'hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white transition-all shadow-md active:scale-95 cursor-pointer',
                activeIndex === 0 && 'opacity-0 pointer-events-none'
              )}
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex + 1)}
              disabled={activeIndex === validImages.length - 1}
              aria-label="Next photo"
              className={cn(
                'hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white transition-all shadow-md active:scale-95 cursor-pointer',
                activeIndex === validImages.length - 1 &&
                  'opacity-0 pointer-events-none'
              )}
            >
              <ChevronRight className="w-5 h-5 ml-0.5 stroke-[2.2]" />
            </button>
          </>
        )}

        {/* ── Slide Indicator Dots (Only when 2+ images) ── */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center pointer-events-none px-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 shadow-md pointer-events-auto">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToSlide(idx)}
                  aria-label={`Go to photo ${idx + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                    activeIndex === idx
                      ? 'w-4.5 bg-white shadow-2xs'
                      : 'w-1.5 bg-white/60 hover:bg-white/80'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Photo Counter Badge (Airbnb / Grailed signature - hidden on housing) ── */}
        {hasMultipleImages && fallbackType !== 'housing' && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 dark:bg-black/75 backdrop-blur-md border border-white/20 text-[11px] tabular-nums font-medium text-white shadow-md tracking-wider pointer-events-none">
            <Images className="w-3 h-3 text-white/80" />
            <span>
              {activeIndex + 1}/{validImages.length}
            </span>
          </div>
        )}
      </div>

      {/* ── Thumbnail Rail Below Main Image (Visible on desktop; mobile uses swipe carousel + dots) ── */}
      {hasMultipleImages && (
        <div
          ref={thumbnailRailRef}
          className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToSlide(idx)}
              className={cn(
                'relative flex-none aspect-square w-14 sm:w-16 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                activeIndex === idx
                  ? 'border-[#0F6E6E] dark:border-[#22D3EE] ring-2 ring-[#0F6E6E] dark:ring-[#22D3EE] opacity-100 shadow-xs scale-100'
                  : 'border-border/80 opacity-60 hover:opacity-100 hover:border-foreground/30'
              )}
              aria-label={`View photo ${idx + 1}`}
            >
              <OptimizedImage
                src={img}
                alt=""
                sizes="64px"
                className="w-full h-full object-cover"
              />
              {activeIndex === idx && (
                <span className="absolute inset-0 bg-[#0F6E6E]/10 dark:bg-[#22D3EE]/15 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
