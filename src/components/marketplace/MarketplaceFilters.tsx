'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronRight } from 'lucide-react'
import { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MarketplaceFiltersProps {
  categories: Category[]
}

const CONDITION_OPTIONS = [
  { id: 'all', label: 'Any' },
  { id: 'new', label: 'New' },
  { id: 'like_new', label: 'Like New' },
  { id: 'good', label: 'Good (Used)' },
  { id: 'fair', label: 'Fair' },
]

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
]

export function MarketplaceFilters({ categories }: MarketplaceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
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

  // Count active non-default filters (campus is NOT part of this filter modal)
  const activeFilterCount = [
    condition !== 'all',
    availability !== 'available_only',
    Boolean(minPrice.trim()),
    Boolean(maxPrice.trim()),
    sort !== 'newest',
  ].filter(Boolean).length

  const applyFilters = (overrides?: Partial<Record<string, string>>) => {
    const params = new URLSearchParams()
    // Retain existing campus query param from header top nav
    const existingCampus = searchParams.get('campus')
    if (existingCampus && existingCampus !== 'all') {
      params.set('campus', existingCampus)
    }

    const nextQ = overrides?.q !== undefined ? overrides.q : q
    const nextCategory = overrides?.category !== undefined ? overrides.category : category
    const nextCondition = overrides?.condition !== undefined ? overrides.condition : condition
    const nextAvailability =
      overrides?.availability !== undefined ? overrides.availability : availability
    const nextMinPrice = overrides?.minPrice !== undefined ? overrides.minPrice : minPrice
    const nextMaxPrice = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice
    const nextSort = overrides?.sort !== undefined ? overrides.sort : sort

    if (nextQ.trim()) params.set('q', nextQ.trim())
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory)
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
    setCondition('all')
    setAvailability('available_only')
    setMinPrice('')
    setMaxPrice('')
    setSort('newest')

    const params = new URLSearchParams()
    const existingCampus = searchParams.get('campus')
    if (existingCampus && existingCampus !== 'all') {
      params.set('campus', existingCampus)
    }
    const queryStr = params.toString()
    router.push(queryStr ? `/marketplace?${queryStr}` : '/marketplace')
    setSheetOpen(false)
  }

  const selectedCategoryLabel =
    category === 'all'
      ? 'All'
      : categories.find((c) => c.slug === category)?.short_name ||
        categories.find((c) => c.slug === category)?.name ||
        'All'

  const selectedConditionLabel =
    CONDITION_OPTIONS.find((c) => c.id === condition)?.label || 'Any'

  const selectedSortLabel =
    SORT_OPTIONS.find((s) => s.id === sort)?.label || 'Newest first'

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

      {/* 3. Bottom Sheet Filter Modal (z-[70] so it completely sits above bottom nav z-50) */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSheetOpen(false)}
          />

          {/* Modal / Bottom Sheet Box (Solid bg-card, clear safe padding) */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter listings"
            className="relative z-[71] w-full max-w-lg bg-card rounded-t-[28px] md:rounded-[24px] border border-border shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-300 md:zoom-in-95 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
          >
            {/* Mobile Drag Indicator */}
            <div className="pt-3 pb-1 flex justify-center md:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground font-sans">
                  Filter listings
                </h2>
                <p className="text-xs text-muted-foreground">
                  Refine items by category, condition, and price
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

            {/* Sheet Scrollable Body with Clean Row-Based Structure (Matching Image 1) */}
            <div className="px-5 py-2 overflow-y-auto overscroll-contain flex-1 divide-y divide-border/60">
              {/* Row 1: Condition (Left: Condition label, Right: Current selection with native picker) */}
              <div className="relative flex items-center justify-between py-4 group">
                <span className="text-[15px] text-muted-foreground font-normal">Condition</span>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[15px] font-semibold text-foreground">
                    {selectedConditionLabel}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                {/* Native Accessible Select overlaying the row */}
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  aria-label="Condition"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                >
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Category (Left: Category label, Right: Current category with native picker) */}
              <div className="relative flex items-center justify-between py-4 group">
                <span className="text-[15px] text-muted-foreground font-normal">Category</span>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[15px] font-semibold text-foreground">
                    {selectedCategoryLabel}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                {/* Native Accessible Select overlaying the row */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Category"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: Sort Order (Left: Sort order label, Right: Selected option) */}
              <div className="relative flex items-center justify-between py-4 group">
                <span className="text-[15px] text-muted-foreground font-normal">Sort by</span>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[15px] font-semibold text-foreground">
                    {selectedSortLabel}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                {/* Native Accessible Select overlaying the row */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort by"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: Price Range Inputs */}
              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] text-muted-foreground font-normal">Price Range</span>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {minPrice || maxPrice
                      ? `₦${minPrice || '0'} – ₦${maxPrice || 'Any'}`
                      : 'Any price'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      Min Price (₦)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="e.g. 1,000"
                      className="w-full h-10 px-3 rounded-xl border border-input bg-muted/40 text-xs sm:text-sm text-foreground focus:bg-card focus:border-[#0F6E6E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      Max Price (₦)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="e.g. 25,000"
                      className="w-full h-10 px-3 rounded-xl border border-input bg-muted/40 text-xs sm:text-sm text-foreground focus:bg-card focus:border-[#0F6E6E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sheet Sticky Footer Actions (Generous spacing above bottom nav) */}
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
