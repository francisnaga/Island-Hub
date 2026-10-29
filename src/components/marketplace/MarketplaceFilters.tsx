'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react'
import { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MarketplaceFiltersProps {
  categories: Category[]
}

const CAMPUS_OPTIONS = [
  { id: 'all', label: 'All Campuses' },
  { id: 'Okerenkoko', label: 'Okerenkoko' },
  { id: 'Kurutie', label: 'Kurutie' },
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
  const [mobileOpen, setMobileOpen] = useState(false)

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
    setMobileOpen(false)
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
    setMobileOpen(false)
  }

  return (
    <div className="space-y-3 min-w-0 w-full">
      {/* Top Search + Sort + Mobile Filter Toggle */}
      <div className="flex flex-col md:flex-row gap-2.5 min-w-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          role="search"
          className="flex-1 flex gap-2 min-w-0"
        >
          <div className="relative flex-1 min-w-0">
            <label htmlFor="marketplace-search-input" className="sr-only">
              Search listings by name, category, size, or campus location
            </label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="marketplace-search-input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search boots, action rigs, calculators, size 43..."
              className="w-full h-10 sm:h-11 pl-10 pr-3 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>
          <button
            type="submit"
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-foreground text-background text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 min-w-0">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              applyFilters({ sort: e.target.value })
            }}
            aria-label="Sort listings"
            className="h-10 sm:h-11 px-3 rounded-xl border border-input bg-card text-xs font-medium text-foreground focus:border-foreground/40 focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-10 sm:h-11 px-3.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            Filters
          </button>
        </div>
      </div>

      {/* Campus Selector Bar (Clean Monochrome) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          Campus:
        </span>
        {CAMPUS_OPTIONS.map((c) => {
          const active = campus.toLowerCase() === c.id.toLowerCase()
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCampus(c.id)
                applyFilters({ campus: c.id })
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer',
                active
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
              )}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Category Pills Bar (Clean Monochrome Active States) */}
      <div className="w-full max-w-full overflow-x-auto no-scrollbar pb-1 border-t border-border/60 pt-2">
        <div className="flex items-center gap-1.5 w-max">
          <button
            type="button"
            onClick={() => {
              setCategory('all')
              applyFilters({ category: 'all' })
            }}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer',
              category === 'all'
                ? 'bg-foreground text-background border-foreground font-bold'
                : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
            )}
          >
            All Categories
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
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer',
                category === cat.slug
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
              )}
            >
              {cat.short_name || cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filter Bar (Price range, Condition, Availability) */}
      <div
        className={cn(
          'rounded-xl border border-border bg-card p-3.5 sm:p-4 grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 items-end',
          !mobileOpen && 'hidden md:grid'
        )}
      >
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Min Price (₦)
          </label>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g. 2000"
            className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:border-foreground/40 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Max Price (₦)
          </label>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 30000"
            className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:border-foreground/40 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Condition
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:border-foreground/40 focus:outline-none"
          >
            <option value="all">Any Condition</option>
            <option value="new">Brand New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good (Used)</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Availability
          </label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:border-foreground/40 focus:outline-none"
          >
            <option value="available_only">In Stock Only</option>
            <option value="all">Include Out of Stock</option>
          </select>
        </div>

        <div className="col-span-2 lg:col-span-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyFilters()}
            className="flex-1 h-9 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearAll}
            title="Reset all filters"
            className="h-9 px-2.5 rounded-lg border border-border text-muted-foreground hover:bg-muted text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
