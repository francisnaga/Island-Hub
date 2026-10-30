'use client'

import React from 'react'

interface WavyAvatarProps {
  name: string
  seed?: string
  size?: number
  className?: string
  alt?: string
  showInitials?: boolean
}

// 64-bit multi-round FNV-1a + Murmur3 bit-mix PRNG
function getDeterministicHashValues(str: string): [number, number, number, number] {
  let h1 = 0x811c9dc5
  let h2 = 0x27d4eb2f
  let h3 = 0x165667b1
  let h4 = 0x5e2d58d3

  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193)
    h2 = Math.imul(h2 ^ (c * 31), 0x5bd1e995)
    h3 = Math.imul(h3 ^ (c * 59), 0xcc9e2d51)
    h4 = Math.imul(h4 ^ (c * 97), 0x1b873593)
  }

  // Avalanche bit-mixing
  h1 ^= h1 >>> 16; h1 = Math.imul(h1, 0x85ebca6b); h1 ^= h1 >>> 13
  h2 ^= h2 >>> 16; h2 = Math.imul(h2, 0xc2b2ae35); h2 ^= h2 >>> 16
  h3 ^= h3 >>> 16; h3 = Math.imul(h3, 0x27d4eb2d); h3 ^= h3 >>> 15
  h4 ^= h4 >>> 16; h4 = Math.imul(h4, 0x165667b1); h4 ^= h4 >>> 16

  return [Math.abs(h1), Math.abs(h2), Math.abs(h3), Math.abs(h4)]
}

// 12 Curated Maritime & Sovereign Palettes
const MARITIME_PALETTES = [
  {
    name: 'Sovereign Deep Teal',
    bgStart: '#0A4F4F',
    bgEnd: '#042424',
    wave1: '#0F6E6E',
    wave2: '#17908D',
    accent: '#E8B84A', // Nautical Gold
  },
  {
    name: 'Escravos Midnight',
    bgStart: '#0A192F',
    bgEnd: '#020C1B',
    wave1: '#0284C7',
    wave2: '#38BDF8',
    accent: '#67E8F9', // Seafoam cyan
  },
  {
    name: 'Cadet Brass & Obsidian',
    bgStart: '#0F172A',
    bgEnd: '#020617',
    wave1: '#B45309',
    wave2: '#F59E0B',
    accent: '#FDE68A', // Polished brass
  },
  {
    name: 'Kurutie Creek Azure',
    bgStart: '#075985',
    bgEnd: '#082F49',
    wave1: '#0EA5E9',
    wave2: '#38BDF8',
    accent: '#E0F2FE', // Ice silver
  },
  {
    name: 'Okerenkoko Silt & Emerald',
    bgStart: '#064E3B',
    bgEnd: '#022C22',
    wave1: '#059669',
    wave2: '#10B981',
    accent: '#A7F3D0', // Mint seafoam
  },
  {
    name: 'Tidal Harbor Twilight',
    bgStart: '#1E1B4B',
    bgEnd: '#0F172A',
    wave1: '#0D9488',
    wave2: '#14B8A6',
    accent: '#5EEAD4', // Luminous turquoise
  },
  {
    name: 'Naval Ensign Royal',
    bgStart: '#1E3A8A',
    bgEnd: '#172554',
    wave1: '#2563EB',
    wave2: '#60A5FA',
    accent: '#FCD34D', // Gold crest
  },
  {
    name: 'Delta Mangrove Amber',
    bgStart: '#1C1917',
    bgEnd: '#0C0A09',
    wave1: '#D97706',
    wave2: '#F59E0B',
    accent: '#FEF3C7', // Warm brass
  },
  {
    name: 'Deep Abyss Cyan',
    bgStart: '#083344',
    bgEnd: '#02141C',
    wave1: '#0891B2',
    wave2: '#06B6D4',
    accent: '#A5F3FC', // Vibrant cyan
  },
  {
    name: 'Sovereign Slate & Seafoam',
    bgStart: '#1E293B',
    bgEnd: '#090D16',
    wave1: '#0D9488',
    wave2: '#2DD4BF',
    accent: '#99F6E4', // Clean seafoam
  },
  {
    name: 'Port Brass & Cobalt',
    bgStart: '#172554',
    bgEnd: '#080E21',
    wave1: '#D97706',
    wave2: '#FBBF24',
    accent: '#FDE68A', // Sovereign gold
  },
  {
    name: 'Creek Estuary Teal',
    bgStart: '#134E4A',
    bgEnd: '#042F2E',
    wave1: '#14B8A6',
    wave2: '#2DD4BF',
    accent: '#CCFBF1', // Bright aqua
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
  showInitials = true,
}: WavyAvatarProps) {
  const safeSeed = seed || name || 'jetty-vendor'
  const [h1, h2, h3, h4] = getDeterministicHashValues(safeSeed)

  // Deterministic palette selection
  const palette = MARITIME_PALETTES[h1 % MARITIME_PALETTES.length]
  const initials = extractInitials(name)

  // Deterministic gradient angle (15° to 345°)
  const angle = 15 + (h2 % 330)
  const angleRad = (angle * Math.PI) / 180
  const x1 = Math.round(50 - Math.cos(angleRad) * 50)
  const y1 = Math.round(50 - Math.sin(angleRad) * 50)
  const x2 = Math.round(50 + Math.cos(angleRad) * 50)
  const y2 = Math.round(50 + Math.sin(angleRad) * 50)

  // Wave 1 geometry (Mid-level flowing tidal current)
  const w1StartY = 38 + (h1 % 16)
  const w1CtrlX1 = 20 + (h2 % 25)
  const w1CtrlY1 = 16 + (h3 % 20)
  const w1CtrlX2 = 60 + (h4 % 25)
  const w1CtrlY2 = 44 + (h1 % 20)
  const w1EndY = 40 + (h2 % 16)

  // Wave 2 geometry (Lower deep water swell)
  const w2StartY = 56 + (h3 % 16)
  const w2CtrlX = 50 + (h1 % 30)
  const w2CtrlY = 38 + (h4 % 22)
  const w2EndY = 62 + (h2 % 16)

  // Nautical chart feature type (0: Depth soundings, 1: Navigation crosshair/ticks, 2: Radar echoes, 3: Dual tide lines)
  const chartFeature = h3 % 4

  // Unique SVG element IDs based on composite hash
  const uid = `${h1.toString(16)}-${h2.toString(16)}`
  const gradId = `jetty-av-bg-${uid}`
  const wave1Id = `jetty-av-w1-${uid}`
  const wave2Id = `jetty-av-w2-${uid}`
  const shadowId = `jetty-av-sh-${uid}`

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`rounded-full overflow-hidden select-none shrink-0 ${className}`}
      role="img"
      aria-label={alt || `${name} avatar`}
    >
      <defs>
        {/* Base Water Basin Gradient */}
        <linearGradient id={gradId} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
          <stop offset="0%" stopColor={palette.bgStart} />
          <stop offset="100%" stopColor={palette.bgEnd} />
        </linearGradient>

        {/* Wave Layer 1 Gradient */}
        <linearGradient id={wave1Id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.wave1} stopOpacity="0.88" />
          <stop offset="100%" stopColor={palette.wave1} stopOpacity="0.35" />
        </linearGradient>

        {/* Wave Layer 2 Gradient */}
        <linearGradient id={wave2Id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.wave2} stopOpacity="0.95" />
          <stop offset="100%" stopColor={palette.bgEnd} stopOpacity="0.98" />
        </linearGradient>

        {/* Crisp Monogram Text Drop Shadow */}
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      {/* Layer 1: Background Water Basin */}
      <rect width="100" height="100" fill={`url(#${gradId})`} />

      {/* Layer 2: Nautical Chart / Bathymetric Watermark */}
      {chartFeature === 0 && (
        <g opacity="0.12" stroke="#FFFFFF" fill="none" strokeWidth="0.8">
          <circle cx="50" cy="50" r="28" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
        </g>
      )}

      {chartFeature === 1 && (
        <g opacity="0.12" stroke={palette.accent} fill="none" strokeWidth="0.8">
          <line x1="50" y1="6" x2="50" y2="18" />
          <line x1="50" y1="82" x2="50" y2="94" />
          <line x1="6" y1="50" x2="18" y2="50" />
          <line x1="82" y1="50" x2="94" y2="50" />
        </g>
      )}

      {chartFeature === 2 && (
        <g opacity="0.10" stroke="#FFFFFF" fill="none" strokeWidth="0.75">
          <circle cx="50" cy="50" r="18" />
          <circle cx="50" cy="50" r="34" />
          <circle cx="50" cy="50" r="46" />
        </g>
      )}

      {chartFeature === 3 && (
        <g opacity="0.14" stroke={palette.accent} fill="none" strokeWidth="0.75">
          <path d="M 10,25 Q 50,15 90,25" />
          <path d="M 15,32 Q 50,22 85,32" strokeDasharray="2 3" />
        </g>
      )}

      {/* Layer 3: Mid Tidal Current Wave */}
      <path
        d={`M 0,${w1StartY} C ${w1CtrlX1},${w1CtrlY1} ${w1CtrlX2},${w1CtrlY2} 100,${w1EndY} L 100,100 L 0,100 Z`}
        fill={`url(#${wave1Id})`}
      />

      {/* Layer 4: Deep Water Swell Wave */}
      <path
        d={`M 0,${w2StartY} Q ${w2CtrlX},${w2CtrlY} 100,${w2EndY} L 100,100 L 0,100 Z`}
        fill={`url(#${wave2Id})`}
      />

      {/* Layer 5: Luminous Waterline Crest Stroke */}
      <path
        d={`M 0,${w1StartY} C ${w1CtrlX1},${w1CtrlY1} ${w1CtrlX2},${w1CtrlY2} 100,${w1EndY}`}
        fill="none"
        stroke={palette.accent}
        strokeWidth="1.25"
        strokeOpacity="0.65"
      />

      {/* Layer 6: Minted Sovereign Coin Rim */}
      <circle
        cx="50"
        cy="50"
        r="48.5"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5"
      />
      <circle
        cx="50"
        cy="50"
        r="46.5"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.75"
      />

      {/* Layer 7: Centered Crisp Sovereign Monogram */}
      {showInitials && (
        <text
          x="50"
          y="52"
          fill="#FFFFFF"
          fontSize="32"
          fontWeight="700"
          fontFamily="var(--font-bricolage), var(--font-space-grotesk), var(--font-inter), system-ui, -apple-system, sans-serif"
          letterSpacing="-0.03em"
          textAnchor="middle"
          dominantBaseline="central"
          filter={`url(#${shadowId})`}
        >
          {initials}
        </text>
      )}
    </svg>
  )
}
