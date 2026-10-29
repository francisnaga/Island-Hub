'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MarketplaceFiltersProps {
  categories: Category[]
}

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
  const [mobileOpen, setMobileOpen] = useState(false)

  const applyFilters = (overrides?: Partial<Record<string, string>>) => {
    const params = new URLSearchParams()
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
    setMobileOpen(false)
  }

  const clearAll = () => {
    setQ('')
    setCategory('all')
    setCondition('all')
    setAvailability('available_only')
    setMinPrice('')
    setMaxPrice('')
    setSort('newest')
    router.push('/marketplace')
    setMobileOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Top Search + Sort + Mobile Filter Toggle */}
      <div className="flex flex-col md:flex-row gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          className="flex-1 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search safety boots, action rigs, calculators, fans..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0F6E6E] focus:outline-none focus:ring-2 focus:ring-[#0F6E6E]/15"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-5 rounded-xl bg-[#0F6E6E] text-white text-sm font-semibold hover:bg-[#0A4F4F] transition-colors shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              applyFilters({ sort: e.target.value })
            }}
            aria-label="Sort listings"
            className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 focus:border-[#0F6E6E] focus:outline-none"
          >
            <option value="newest">Sort: Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="relevance">Relevance</option>
          </select>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex md:hidden items-center gap-1.5 h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#0F6E6E]" />
            Filters
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => {
            setCategory('all')
            applyFilters({ category: 'all' })
          }}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer',
            category === 'all'
              ? 'bg-[#0F6E6E] text-white border-[#0F6E6E]'
              : 'bg-white text-slate-700 border-slate-200 hover:border-[#0F6E6E]/40'
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
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer',
              category === cat.slug
                ? 'bg-[#0F6E6E] text-white border-[#0F6E6E]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-[#0F6E6E]/40'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Secondary Filter Bar (Price range, Condition, Availability) */}
      <div
        className={cn(
          'rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end',
          !mobileOpen && 'hidden md:grid'
        )}
      >
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Min Price (₦)
          </label>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g. 2000"
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Max Price (₦)
          </label>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 30000"
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Condition
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
          >
            <option value="all">Any Condition</option>
            <option value="new">Brand New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good (Used)</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Availability
          </label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#0F6E6E] focus:outline-none"
          >
            <option value="available_only">In Stock Only</option>
            <option value="all">Include Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyFilters()}
            className="flex-1 h-9 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-[#0A4F4F] transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearAll}
            title="Reset all filters"
            className="h-9 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
