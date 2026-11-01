'use client'

/**
 * UserAvatar — universal avatar component for Jetty
 *
 * Priority order:
 *  1. Real photo (`src` prop / logo_url / avatar_url)
 *  2. Unique maritime WavyAvatar seeded by `seed` (user ID / vendor ID)
 *     — each user gets a deterministically unique pattern, never duplicated
 *
 * Usage:
 *   <UserAvatar src={vendor.logo_url} seed={vendor.id} name={vendor.shop_name} size={48} />
 *   <UserAvatar src={profile.avatar_url} seed={user.id} name={profile.full_name} size={40} />
 */
import { useState } from 'react'
import { WavyAvatar } from '@/components/brand/WavyAvatar'

interface UserAvatarProps {
  /** Real photo URL (logo_url / avatar_url / Google profile picture) */
  src?: string | null
  /** Unique seed for deterministic avatar generation — use userId or vendorId */
  seed: string
  /** Display name — used for initials fallback inside WavyAvatar */
  name: string
  /** Pixel size of the avatar (width and height) */
  size?: number
  /** Extra CSS class names for the wrapper */
  className?: string
  /** Alt text for accessibility */
  alt?: string
}

export function UserAvatar({
  src,
  seed,
  name,
  size = 48,
  className = '',
  alt,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const showReal = src && !imgError

  const rounded = `rounded-full overflow-hidden shrink-0 bg-muted`
  const style = { width: size, height: size, minWidth: size }

  if (showReal) {
    return (
      <div className={`${rounded} ${className}`} style={style}>
        <img
          src={src}
          alt={alt || name}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }

  // No photo (or failed to load) → unique WavyAvatar seeded by user/vendor ID
  return (
    <WavyAvatar
      name={name}
      seed={seed}
      size={size}
      className={`rounded-full shrink-0 ${className}`}
      alt={alt || name}
      showInitials
    />
  )
}
