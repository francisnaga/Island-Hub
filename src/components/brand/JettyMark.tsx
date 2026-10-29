import React, { useId } from 'react'

export interface JettyMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export function JettyMark({
  size = 32,
  className = '',
  ...rest
}: JettyMarkProps) {
  const uid = useId().replace(/:/g, '')
  const gradId = `jetty-g-${uid}`
  const clipId = `jetty-c-${uid}`
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 32

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      width={numericSize}
      height={numericSize}
      role="img"
      aria-label="Jetty"
      className={className}
      {...rest}
    >
      <title>Jetty</title>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#17908D" />
          <stop offset="1" stopColor="#0A4F4F" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect width="96" height="96" rx="24" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="96" height="96" fill={`url(#${gradId})`} />
        <path
          d="M24 26 L70 26"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M52 26 L52 54 Q52 72 38 72 Q26 72 26 60"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M0 58 q12 -8 24 0 t24 0 t24 0 t24 0 V96 H0 Z"
          fill="#0A4F4F"
          fillOpacity="0.6"
        />
        <path
          d="M0 58 q12 -8 24 0 t24 0 t24 0 t24 0"
          fill="none"
          stroke="#E8B84A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export default JettyMark
