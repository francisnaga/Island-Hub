'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check,
  ShoppingBag,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KitItem {
  id: string
  name: string
  note: string
  searchQuery: string
}

export interface KitSection {
  title: string
  priority: boolean
  note?: string
  items: KitItem[]
}

interface FresherKitClientProps {
  sections: KitSection[]
}

const STORAGE_KEY = 'jetty_fresher_kit_checked_v1'

export function FresherKitClient({ sections }: FresherKitClientProps) {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  const allItems = sections.flatMap((s) => s.items)
  const totalCount = allItems.length

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setCheckedIds(JSON.parse(saved))
      }
    } catch {
      // Ignore localStorage errors in private browsing
    }
    setMounted(true)
  }, [])

  const toggleItem = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setCheckedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage errors
      }
      return next
    })
  }

  const handleReset = () => {
    if (window.confirm('Reset your checklist?')) {
      setCheckedIds({})
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore
      }
    }
  }

  const completedCount = mounted
    ? allItems.filter((item) => Boolean(checkedIds[item.id])).length
    : 0

  const progressPercent = Math.round((completedCount / totalCount) * 100) || 0

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      {/* Interactive Progress Bar Card */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-foreground">
                {completedCount} of {totalCount} items ready
              </span>
              <span className="text-xs font-bold text-primary">
                ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap the circles as you acquire each item. Saved automatically to your browser.
            </p>
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Reset checklist"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Sections & Interactive Checklist Items */}
      <div className="space-y-6 sm:space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {section.title}
              </h2>
              {section.priority && (
                <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Day 1 Priority
                </span>
              )}
              {section.note && (
                <span className="text-xs text-muted-foreground">
                  {section.note}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
              {section.items.map((item) => {
                const isChecked = mounted && Boolean(checkedIds[item.id])

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'group flex items-center justify-between gap-3 px-3.5 sm:px-5 py-3.5 transition-colors cursor-pointer select-none',
                      isChecked
                        ? 'bg-muted/30 opacity-75'
                        : 'hover:bg-muted/40'
                    )}
                    onClick={() => toggleItem(item.id)}
                  >
                    {/* Checkbox Button */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        aria-label={`Mark ${item.name} as ${isChecked ? 'not ready' : 'ready'}`}
                        onClick={(e) => toggleItem(item.id, e)}
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all mt-0.5 cursor-pointer',
                          isChecked
                            ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                            : 'border-border bg-background hover:border-primary/60'
                        )}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-xs sm:text-sm font-semibold transition-colors leading-snug',
                            isChecked
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          )}
                        >
                          {item.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                          {item.note}
                        </p>
                      </div>
                    </div>

                    {/* Find on Jetty Link */}
                    <Link
                      href={`/marketplace?q=${encodeURIComponent(item.searchQuery)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-2 py-1 rounded-md hover:bg-accent/50 transition-colors"
                      title={`Find ${item.name} on Jetty`}
                    >
                      <span className="hidden sm:inline">Find on Jetty</span>
                      <span className="sm:hidden">Find</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
