import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  className?: string
  size?: number
  variant?: 'blue' | 'gold'
  title?: string
}

/**
 * Twitter / Facebook (Meta) style scalloped verification badge with crisp white checkmark.
 */
export function VerifiedBadge({
  className,
  size = 16,
  variant = 'blue',
  title = 'Verified on Jetty',
}: VerifiedBadgeProps) {
  const fill = variant === 'gold' ? '#E8B84A' : '#1D9BF0'
  const checkStroke = variant === 'gold' ? '#0E1B1B' : '#FFFFFF'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={title}
      role="img"
      className={cn('inline-block shrink-0 select-none', className)}
    >
      <title>{title}</title>
      {/* 8-Scallop Rosette Seal (Twitter / Meta Verified shape) */}
      <path
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
        fill={fill}
      />
      {/* Crisp Center Checkmark */}
      <path
        d="M8.75 12.25L10.9 14.4L15.5 9.6"
        stroke={checkStroke}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
