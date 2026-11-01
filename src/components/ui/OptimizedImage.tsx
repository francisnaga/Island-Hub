'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  /** If true, load eagerly (above the fold). Default: lazy */
  priority?: boolean
  /** Aspect ratio wrapper class e.g. "aspect-square" */
  aspectClass?: string
  fallback?: React.ReactNode
}

/**
 * Lightweight image wrapper:
 * - lazy loads by default
 * - shows skeleton while loading
 * - shows fallback on error
 * - uses decoding="async" + fetchpriority hint
 */
export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fallback,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (errored && fallback) {
    return <>{fallback}</>
  }

  return (
    <span className="relative block w-full h-full">
      {!loaded && (
        <span className="absolute inset-0 animate-pulse bg-muted rounded-[inherit]" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'low'}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    </span>
  )
}
