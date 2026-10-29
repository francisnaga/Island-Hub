import React from 'react'

export interface NagaLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

export function NagaLogo({
  size = 18,
  className = '',
  color = 'currentColor',
  ...rest
}: NagaLogoProps) {
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 18

  return (
    <svg
      width={numericSize}
      height={numericSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Naga Logo"
      {...rest}
    >
      {/* Left Keel Pillar */}
      <path d="M16 16H38V48L58 74L42 84H16V16Z" fill={color} />
      {/* Right Keel Pillar */}
      <path d="M84 84H62V52L42 26L58 16H84V84Z" fill={color} />
    </svg>
  )
}

export default NagaLogo
