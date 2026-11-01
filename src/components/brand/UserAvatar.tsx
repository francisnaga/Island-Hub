'use client'

/**
 * UserAvatar — universal high-performance avatar component for Jetty
 *
 * Rules:
 *  1. If a user or vendor HAS a profile photo (custom uploaded or pulled from Gmail),
 *     their real photo is displayed directly across the entire platform.
 *  2. The generic monogram (WavyAvatar) is STRICTLY reserved for users who do NOT
 *     have any photo yet, or in the rare event of a network failure loading the photo.
 *  3. Uses referrerPolicy="no-referrer" to ensure Google User Content avatars (lh3.googleusercontent.com)
 *     are never blocked by cross-origin referrer restrictions.
 *  4. Instant hydration detection: verifies img.complete so cached avatars render in 0ms without delay.
 */
import { useState, useEffect, useRef } from 'react'
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
  const imgRef = useRef<HTMLImageElement | null>(null)

  const effectiveSeed = seed || name || 'jetty'
  const trimmedSrc = typeof src === 'string' ? src.trim() : null
  const hasValidPhoto = Boolean(trimmedSrc && !imgError && trimmedSrc.length > 0)

  // Ensure Google avatars request crisp resolution (e.g. 192px max for avatars)
  let optimizedSrc = trimmedSrc
  if (optimizedSrc && optimizedSrc.includes('googleusercontent.com')) {
    const targetSize = Math.max(size * 2, 192)
    if (/=s\d+(-c)?$/.test(optimizedSrc)) {
      optimizedSrc = optimizedSrc.replace(/=s\d+(-c)?$/, `=s${targetSize}-c`)
    } else if (!optimizedSrc.includes('=')) {
      optimizedSrc = `${optimizedSrc}=s${targetSize}-c`
    }
  }

  // Handle immediate cached completion on mount & src change
  useEffect(() => {
    setImgError(false)
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [optimizedSrc])

  const style = { width: size, height: size, minWidth: size }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden shrink-0 select-none bg-[#E6F2F2] dark:bg-[#0A4F4F]',
        className
      )}
      style={style}
    >
      {!hasValidPhoto ? (
        /* Monogram ONLY rendered when user has NO photo (or image fails) */
        <WavyAvatar
          name={name}
          seed={effectiveSeed}
          size={size}
          className="absolute inset-0 w-full h-full"
          alt={alt || name}
          showInitials
        />
      ) : (
        /* Real profile photo overlay */
        <>
          {!loaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-[#E6F2F2] to-[#D5E5E5] dark:from-[#0A4F4F] dark:to-[#042424] animate-pulse z-0"
            />
          )}
          <img
            ref={imgRef}
            src={optimizedSrc!}
            alt={alt || name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setImgError(true)
              setLoaded(false)
            }}
            className={cn(
              'absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-200',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </>
      )}
    </div>
  )
}
