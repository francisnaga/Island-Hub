'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
  quality?: number
  aspectClass?: string
  fallback?: React.ReactNode
}

// Low-overhead instant placeholder SVG so layout never jumps and empty grey boxes don't hang
const INSTANT_BLUR_DATA_URL =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23DCE8E8"/%3E%3C/svg%3E'

/**
 * High-performance Next.js Image wrapper:
 * - AVIF & WebP auto-conversion via Next.js optimizer
 * - Responsive srcset sizing (phones download 8KB-18KB thumbnails, not 2MB originals)
 * - Instant SVG blur placeholder prevents layout shift & hanging empty holes
 * - Progressive rendering on poor 2G/3G networks
 * - Graceful fallback on error
 */
export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px',
  fill = true,
  width,
  height,
  quality = 70,
  aspectClass,
  fallback,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return fallback ? <>{fallback}</> : null
  }

  const isDataUrl = src.startsWith('data:')
  const isBlob = src.startsWith('blob:')
  const isSvg = src.endsWith('.svg') || src.includes('.svg?')
  const bypassOptimizer = isDataUrl || isBlob || isSvg

  // Use fill if width and height are not explicitly provided
  const useFill = fill && !width && !height

  return (
    <span
      className={cn(
        'relative block w-full h-full overflow-hidden bg-[#E6F2F2] dark:bg-[#132A2A]',
        aspectClass
      )}
    >
      {/* Sleek skeleton shimmer while loading */}
      {!loaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#E6F2F2] via-[#F0F7F7] to-[#E6F2F2] dark:from-[#132A2A] dark:via-[#193737] dark:to-[#132A2A] animate-pulse pointer-events-none z-0"
        />
      )}
      <Image
        src={src}
        alt={alt || ''}
        fill={useFill}
        width={!useFill ? width : undefined}
        height={!useFill ? height : undefined}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        placeholder={bypassOptimizer ? 'empty' : 'blur'}
        blurDataURL={bypassOptimizer ? undefined : INSTANT_BLUR_DATA_URL}
        unoptimized={bypassOptimizer}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn(
          'transition-opacity duration-300 z-1',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    </span>
  )
}
