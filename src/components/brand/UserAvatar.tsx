'use client'

/**
 * UserAvatar — universal high-performance avatar component for Jetty
 *
 * Performance Architecture (Zero-Latency for Poor Networks):
 *  1. Base Layer: Unique maritime WavyAvatar rendered deterministically in 0ms (no network delay).
 *  2. Overlay Layer: Real photo (logo_url / avatar_url / Google) fades in seamlessly once downloaded.
 *  3. Fallback: If network drops, times out, or fails, the user ALWAYS sees their handsome monogram.
 *     Never leaves an empty box, white hole, or hanging placeholder.
 */
import { useState } from 'react'
import { WavyAvatar } from '@/components/brand/WavyAvatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  /** Real photo URL (logo_url / avatar_url / Google profile picture) */
  src?: string | null
  /** Unique seed for deterministic avatar generation — use userId, vendorId, or name */
  seed?: string
  /** Display name — used for initials fallback inside WavyAvatar */
  name: string
  /** Pixel size of the avatar (width and height) */
  size?: number
  /** Extra CSS class names for the wrapper */
  className?: string
  /** Alt text for accessibility */
  alt?: string
  /** Whether to prioritize loading for above-the-fold avatars */
  priority?: boolean
}

export function UserAvatar({
  src,
  seed,
  name,
  size = 48,
  className = '',
  alt,
  priority = false,
}: UserAvatarProps) {
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const effectiveSeed = seed || name || 'jetty'
  const hasValidPhoto = Boolean(src && !imgError && src.trim().length > 0)

  // Ensure Google avatars request reasonable mobile size instead of 2MB full captures
  const optimizedSrc =
    src && src.includes('googleusercontent.com') && !src.includes('=s')
      ? `${src}=s${Math.min(size * 2, 192)}-c`
      : src

  const style = { width: size, height: size, minWidth: size }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden shrink-0 select-none bg-[#E6F2F2] dark:bg-[#0A4F4F]',
        className
      )}
      style={style}
    >
      {/* 1. Instant deterministic base layer: 0ms render, visible immediately with text */}
      <WavyAvatar
        name={name}
        seed={effectiveSeed}
        size={size}
        className="absolute inset-0 w-full h-full"
        alt={alt || name}
        showInitials
      />

      {/* 2. Photo overlays smoothly on top once downloaded */}
      {hasValidPhoto && (
        <img
          src={optimizedSrc!}
          alt={alt || name}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setImgError(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-1',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  )
}
