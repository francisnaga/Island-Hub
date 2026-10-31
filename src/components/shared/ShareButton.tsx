'use client'

import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { getCanonicalUrl } from '@/lib/whatsapp'
import { toast } from 'sonner'

interface ShareButtonProps {
  path: string
  title: string
  shareText: string
  className?: string
  iconClassName?: string
  label?: string
}

export function ShareButton({
  path,
  title,
  shareText,
  className = 'ov r',
  iconClassName = 'w-4.5 h-4.5 stroke-[2]',
  label,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const fullUrl = getCanonicalUrl(path)
    const combinedMessage = `${shareText}\n${fullUrl}`

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Clipboard may require gesture permission
    }

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl,
        })
        return
      } catch (err: any) {
        if (err?.name === 'AbortError') return
      }
    }

    toast.success('Direct link copied! Opening WhatsApp to share…')
    window.open(
      `https://wa.me/?text=${encodeURIComponent(combinedMessage)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${title}`}
      title={`Share direct link to ${title}`}
      className={className}
    >
      {copied ? (
        <Check className={iconClassName} />
      ) : (
        <Share2 className={iconClassName} />
      )}
      {label && <span>{ copied ? 'Link copied!' : label }</span>}
    </button>
  )
}
