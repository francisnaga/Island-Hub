import { forwardRef } from 'react'
import type { LucideProps } from 'lucide-react'

export const HappyManIcon = forwardRef<SVGSVGElement, LucideProps>(
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
      {/* Outer head contour */}
      <circle cx="12" cy="12" r="9.5" />
      {/* Short neat styled parted hair */}
      <path d="M5 9c2-2.8 5-3.5 7-3.5s5 .7 7 3.5" strokeWidth="1.8" />
      {/* Joyful happy curved squinting eyes (^ ^) */}
      <path d="M8.5 11.5c.7-.9 1.8-.9 2.5 0" strokeWidth="2.2" />
      <path d="M13 11.5c.7-.9 1.8-.9 2.5 0" strokeWidth="2.2" />
      {/* Big joyful smiling open mouth */}
      <path d="M8 15c1 2 2.5 2.8 4 2.8s3-.8 4-2.8" strokeWidth="2" />
      {/* Cheerful smile dimples */}
      <path d="M7 14.5c.3.5.5.8.8 1" strokeWidth="1.5" />
      <path d="M17 14.5c-.3.5-.5.8-.8 1" strokeWidth="1.5" />
    </svg>
  )
)

HappyManIcon.displayName = 'HappyManIcon'
