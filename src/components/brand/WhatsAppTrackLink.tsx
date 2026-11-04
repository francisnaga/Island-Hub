'use client'

import React from 'react'
import { trackFlyerEvent } from '@/lib/analytics'

interface WhatsAppTrackLinkProps {
  href: string
  className?: string
  children: React.ReactNode
  ariaLabel?: string
}

export function WhatsAppTrackLink({
  href,
  className,
  children,
  ariaLabel,
}: WhatsAppTrackLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={() => trackFlyerEvent('whatsapp_tap')}
      className={className}
    >
      {children}
    </a>
  )
}
