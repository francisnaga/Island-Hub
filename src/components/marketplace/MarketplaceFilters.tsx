'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, MapPin, Check } from 'lucide-react'
import { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MarketplaceFiltersProps {
  categories: Category[]
}

const CAMPUS_OPTIONS = [
  { id: 'all', label: 'Both campuses' },
  { id: 'Okerenkoko', label: 'Okerenkoko' },
  { id: 'Kurutie', label: 'Kurutie' },
]

const CONDITION_OPTIONS = [
  { id: 'all', label: 'Any Condition' },
  { id: 'new', label: 'Brand New' },
  { id: 'like_new', label: 'Like New' },
  { id: 'good', label: 'Good (Used)' },
  { id: 'fair', label: 'Fair' },
]

export function MarketplaceFilters({ categories }: MarketplaceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [campus, setCampus] = useState(searchParams.get('campus') || 'all')
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all')
  const [availability, setAvailability] = useState(
    searchParams.get('availability') || 'available_only'
  )
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')

  // Bottom Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)

  // Keep state in sync if search params change externally
  useEffect(() => {
    setQ(searchParams.get('q') || '')
    setCategory(searchParams.get('category') || 'all')
    setCampus(searchParams.get('campus') || 'all')
    setCondition(searchParams.get('condition') || 'all')
    setAvailability(searchParams.get('availability') || 'available_only')
    setMinPrice(searchParams.get('minPrice') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
    setSort(searchParams.get('sort') || 'newest')
  }, [searchParams])

  // Disable background body scroll when bottom sheet is open
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

  // Close sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sheetOpen) {
        setSheetOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sheetOpen])

  // Count active non-default filters
  const activeFilterCount = [
    campus !== 'all',
    condition !== 'all',
    availability !== 'available_only',
    Boolean(minPrice.trim()),
    Boolean(maxPrice.trim()),
    sort !== 'newest',
  ].filter(Boolean).length

  const applyFilters = (overrides?: Partial<Record<string, string>>) => {
    const params = new URLSearchParams()
    const nextQ = overrides?.q !== undefined ? overrides.q : q
    const nextCategory = overrides?.category !== undefined ? overrides.category : category
    const nextCampus = overrides?.campus !== undefined ? overrides.campus : campus
    const nextCondition = overrides?.condition !== undefined ? overrides.condition : condition
    const nextAvailability =
      overrides?.availability !== undefined ? overrides.availability : availability
    const nextMinPrice = overrides?.minPrice !== undefined ? overrides.minPrice : minPrice
    const nextMaxPrice = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice
    const nextSort = overrides?.sort !== undefined ? overrides.sort : sort

    if (nextQ.trim()) params.set('q', nextQ.trim())
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory)
    if (nextCampus && nextCampus !== 'all') params.set('campus', nextCampus)
    if (nextCondition && nextCondition !== 'all') params.set('condition', nextCondition)
    if (nextAvailability && nextAvailability !== 'available_only') {
      params.set('availability', nextAvailability)
    }
    if (nextMinPrice.trim()) params.set('minPrice', nextMinPrice.trim())
    if (nextMaxPrice.trim()) params.set('maxPrice', nextMaxPrice.trim())
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort)

    router.push(`/marketplace?${params.toString()}`)
    setSheetOpen(false)
  }

  const clearAll = () => {
    setQ('')
    setCategory('all')
    setCampus('all')
    setCondition('all')
    setAvailability('available_only')
    setMinPrice('')
    setMaxPrice('')
    setSort('newest')
    router.push('/marketplace')
    setSheetOpen(false)
  }

  return (
    <div className="space-y-3 min-w-0 w-full">
      {/* 1. Clean Top Search Bar with Integrated Filter Trigger */}
      <div className="flex items-center gap-2 min-w-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          role="search"
          className="flex-1 relative min-w-0"
        >
          <label htmlFor="marketplace-search-input" className="sr-only">
            Search listings by name, category, or size
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="marketplace-search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search boots, fans, calculators..."
            className="w-full h-11 pl-10 pr-9 rounded-xl border border-input bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0F6E6E] focus:outline-none focus:ring-1 focus:ring-[#0F6E6E]/20 transition-all"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('')
                applyFilters({ q: '' })
              }}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Dedicated Filter Trigger Button */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Open filter options"
          className={cn(
            'relative h-11 px-3.5 sm:px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs',
            activeFilterCount > 0
              ? 'bg-[#0F6E6E] text-white border-[#0F6E6E] dark:bg-[#14B8A6] dark:border-[#14B8A6]'
              : 'bg-card text-foreground border-border hover:bg-muted'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="h-4 min-w-[16px] px-1 rounded-full bg-white text-[#0F6E6E] dark:bg-[#0A4F4F] dark:text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Horizontal Category Pills Rail */}
      <div className="w-full max-w-full overflow-x-auto no-scrollbar pb-1 pt-1">
        <div className="flex items-center gap-2 w-max">
          <button
            type="button"
            onClick={() => {
              setCategory('all')
              applyFilters({ category: 'all' })
            }}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none',
              category === 'all'
                ? 'bg-[#0E1B1B] text-white dark:bg-[#E6F2F2] dark:text-[#0E1B1B] shadow-2xs'
                : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                setCategory(cat.slug)
                applyFilters({ category: cat.slug })
              }}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none',
                category === cat.slug
                  ? 'bg-[#0E1B1B] text-white dark:bg-[#E6F2F2] dark:text-[#0E1B1B] shadow-2xs'
                  : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {cat.short_name || cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Bottom Sheet Filter Modal */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSheetOpen(false)}
          />

          {/* Modal / Bottom Sheet Box */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter listings"
            className="relative z-50 w-full max-w-lg bg-card rounded-t-[28px] md:rounded-[24px] border border-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 md:zoom-in-95"
          >
            {/* Mobile Drag Indicator */}
            <div className="pt-3 pb-1 flex justify-center md:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/70">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground font-sans">
                  Filter listings
                </h2>
                <p className="text-xs text-muted-foreground">
                  Find exactly what you need near campus
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Scrollable Body */}
            <div className="p-5 space-y-5 overflow-y-auto overscroll-contain flex-1">
              {/* Campus Zone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Campus Zone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CAMPUS_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCampus(c.id)}
                      className={cn(
                        'h-10 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center truncate',
                        campus === c.id
                          ? 'bg-[#0F6E6E] text-white border-[#0F6E6E] dark:bg-[#14B8A6] dark:border-[#14B8A6] shadow-2xs'
                          : 'bg-background text-foreground border-border hover:bg-muted'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONDITION_OPTIONS.map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setCondition(cond.id)}
                      className={cn(
                        'h-9 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center truncate',
                        condition === cond.id
                          ? 'bg-[#0E1B1B] text-white dark:bg-white dark:text-[#0E1B1B] border-transparent font-semibold shadow-2xs'
                          : 'bg-background text-foreground border-border hover:bg-muted'
                      )}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Price Range (₦)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-1">Minimum (₦)</span>
                    <input
                      type="number"
                      min={0}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="e.g. 1,000"
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-1">Maximum (₦)</span>
                    <input
                      type="number"
                      min={0}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="e.g. 25,000"
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sort Order
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Sheet Sticky Footer Actions */}
            <div className="p-4 border-t border-border bg-card flex items-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="h-11 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="flex-1 h-11 px-5 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Apply filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
