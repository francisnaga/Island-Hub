'use client'

import React from 'react'

interface WavyAvatarProps {
  name: string
  seed?: string
  size?: number
  className?: string
  alt?: string
}

// 32-bit FNV-1a / DJB2 deterministic string hash
function getDeterministicHash(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

// Curated nautical / sovereign palette presets
const NAUTICAL_THEMES = [
  {
    bgStart: '#0891B2', // Cyan 600
    bgEnd: '#0F172A',   // Slate 900
    wave1: '#06B6D4',   // Cyan 500
    wave2: '#22D3EE',   // Cyan 400
    accent: '#67E8F9',
  },
  {
    bgStart: '#0E7490', // Cyan 700
    bgEnd: '#0B1220',   // Deep Maritime
    wave1: '#0EA5B7',   // Jetty Teal
    wave2: '#38BDF8',   // Sky 400
    accent: '#A5F3FC',
  },
  {
    bgStart: '#0D9488', // Teal 600
    bgEnd: '#134E4A',   // Teal 900
    wave1: '#14B8A6',   // Teal 500
    wave2: '#2DD4BF',   // Teal 400
    accent: '#99F6E4',
  },
  {
    bgStart: '#1D4ED8', // Blue 700
    bgEnd: '#0F172A',   // Slate 900
    wave1: '#2563EB',   // Blue 600
    wave2: '#60A5FA',   // Blue 400
    accent: '#93C5FD',
  },
  {
    bgStart: '#312E81', // Indigo 900
    bgEnd: '#0B1220',   // Deep Maritime
    wave1: '#0891B2',   // Cyan 600
    wave2: '#38BDF8',   // Sky 400
    accent: '#BAE6FD',
  },
  {
    bgStart: '#1E293B', // Slate 800
    bgEnd: '#090D16',   // Obsidian
    wave1: '#D97706',   // Amber 600
    wave2: '#F59E0B',   // Amber 500 (Golden brass)
    accent: '#FDE68A',
  },
  {
    bgStart: '#065F46', // Emerald 800
    bgEnd: '#0B1220',   // Deep Navy
    wave1: '#059669',   // Emerald 600
    wave2: '#34D399',   // Emerald 400
    accent: '#A7F3D0',
  },
  {
    bgStart: '#1E1B4B', // Indigo 950
    bgEnd: '#0369A1',   // Sky 700
    wave1: '#0284C7',   // Sky 600
    wave2: '#38BDF8',   // Sky 400
    accent: '#E0F2FE',
  },
]

export function extractInitials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return 'JT'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function WavyAvatar({
  name,
  seed,
  size,
  className = '',
  alt,
}: WavyAvatarProps) {
  const safeSeed = seed || name || 'jetty-vendor'
  const hash = getDeterministicHash(safeSeed)
  const theme = NAUTICAL_THEMES[hash % NAUTICAL_THEMES.length]
  const initials = extractInitials(name)

  // Deterministic wave geometry
  const y1 = 40 + (hash % 16)
  const ctrlX1 = 25 + ((hash >> 2) % 30)
  const ctrlY1 = 15 + ((hash >> 4) % 25)
  const ctrlX2 = 65 + ((hash >> 6) % 30)
  const ctrlY2 = 55 + ((hash >> 8) % 25)
  const y2 = 45 + ((hash >> 3) % 20)

  const y3 = 60 + ((hash >> 5) % 15)
  const ctrlX3 = 50 + ((hash >> 7) % 25)
  const ctrlY3 = 35 + ((hash >> 9) % 20)
  const y4 = 65 + ((hash >> 10) % 15)

  const gradId = `wavy-grad-${hash}`
  const wave1Id = `wavy-w1-${hash}`
  const wave2Id = `wavy-w2-${hash}`

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`rounded-full overflow-hidden select-none ${className}`}
      role="img"
      aria-label={alt || `${name} avatar`}
    >
      <defs>
        {/* Background Radial/Linear gradient */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.bgStart} />
          <stop offset="100%" stopColor={theme.bgEnd} />
        </linearGradient>

        <linearGradient id={wave1Id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.wave1} stopOpacity="0.85" />
          <stop offset="100%" stopColor={theme.wave1} stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id={wave2Id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.wave2} stopOpacity="0.9" />
          <stop offset="100%" stopColor={theme.bgEnd} stopOpacity="0.95" />
        </linearGradient>

        {/* Drop shadow for monogram text */}
        <filter id={`shadow-${hash}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Base Canvas */}
      <rect width="100" height="100" fill={`url(#${gradId})`} />

      {/* Wave Ripple Layer 1 */}
      <path
        d={`M 0,${y1} C ${ctrlX1},${ctrlY1} ${ctrlX2},${ctrlY2} 100,${y2} L 100,100 L 0,100 Z`}
        fill={`url(#${wave1Id})`}
      />

      {/* Wave Ripple Layer 2 */}
      <path
        d={`M 0,${y3} Q ${ctrlX3},${ctrlY3} 100,${y4} L 100,100 L 0,100 Z`}
        fill={`url(#${wave2Id})`}
      />

      {/* Subtle fine wave contour line */}
      <path
        d={`M 0,${y1} C ${ctrlX1},${ctrlY1} ${ctrlX2},${ctrlY2} 100,${y2}`}
        fill="none"
        stroke={theme.accent}
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />

      {/* Subtle Inner Nautical Border */}
      <circle
        cx="50"
        cy="50"
        r="48.5"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />

      {/* Monogram Initials */}
      <text
        x="50"
        y="52"
        fill="#FFFFFF"
        fontSize="34"
        fontWeight="800"
        fontFamily="var(--font-space-grotesk), system-ui, -apple-system, sans-serif"
        letterSpacing="-0.04em"
        textAnchor="middle"
        dominantBaseline="central"
        filter={`url(#shadow-${hash})`}
      >
        {initials}
      </text>
    </svg>
  )
}
