'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function DarkModeToggle({ className = '' }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Switch colour theme"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground ${className}`}
      >
        <Sun className="h-4 w-4" />
      </button>
    )
  }

  const isDark = (resolvedTheme || theme) === 'dark'

  const toggleTheme = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? 'light' : 'dark'

    // If View Transitions API is not supported or reduced motion is preferred, switch directly
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!('startViewTransition' in document) || isReducedMotion) {
      setTheme(nextTheme)
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = (document as any).startViewTransition
      ? (document as any).startViewTransition(() => {
          setTheme(nextTheme)
        })
      : null

    if (!transition) {
      setTheme(nextTheme)
      return
    }

    try {
      await transition.ready
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 720,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    } catch {
      // Fallback
    }
  }

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E6E] cursor-pointer ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
