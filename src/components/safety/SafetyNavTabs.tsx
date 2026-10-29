'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'ordering-flow', label: 'How Ordering Works' },
  { id: 'meeting-points', label: 'Campus Meeting Spots' },
  { id: 'seller-standards', label: 'Seller & Photo Standards' },
  { id: 'privacy-policy', label: 'Privacy & Data' },
  { id: 'terms-of-use', label: 'Terms of Service' },
  { id: 'reporting-desk', label: 'Grievance & Reports' },
]

export function SafetyNavTabs() {
  const [activeTab, setActiveTab] = useState<string>('overview')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140

      for (let i = TABS.length - 1; i >= 0; i--) {
        const el = document.getElementById(TABS[i].id)
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(TABS[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 80
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      setActiveTab(id)
    }
  }

  return (
    <div className="sticky top-14 md:top-16 z-30 -mx-4 px-4 py-2.5 bg-background/90 backdrop-blur-md border-b border-border/80">
      <div className="container mx-auto max-w-5xl flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className={cn(
                'whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                isActive
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
