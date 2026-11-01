import { forwardRef } from 'react'
import type { LucideProps } from 'lucide-react'

/**
 * Clean Boot / Footwear icon compatible with LucideIcon signature for Boot & Shoe Care service.
 */
export const BootIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ color = 'currentColor', size = 24, strokeWidth = 1.75, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Cadet / Work Boot Silhouette */}
      <path d="M7 3h6v7c0 1.7 1.3 3 3 3h2a3 3 0 0 1 3 3v2H4v-5c0-1.1.9-2 2-2h1V3z" />
      <path d="M3 18h18v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" />
      <path d="M10 6h3" />
      <path d="M10 9h3" />
    </svg>
  )
)

BootIcon.displayName = 'BootIcon'
