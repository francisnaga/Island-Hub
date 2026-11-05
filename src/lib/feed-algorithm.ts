/**
 * IslandHub Feed Ranking Algorithm
 *
 * Goals:
 *  1. Featured (paid) items always rank near the top
 *  2. Verified vendors rank above unverified
 *  3. Freshly confirmed listings (vendor recently updated price/stock) rank higher
 *  4. Recently created listings get a small boost that decays over 30 days
 *  5. Vendor diversity cap — no single vendor floods the top of the feed
 *  6. Daily rotating jitter — the feed looks different every day and varies
 *     by category, so returning users always discover something new
 *  7. Out-of-stock items are pushed to the bottom
 */

import type { Product } from './types'

const ONE_DAY_MS = 86_400_000
const ONE_WEEK_MS = 7 * ONE_DAY_MS
const ONE_MONTH_MS = 30 * ONE_DAY_MS

// ---------------------------------------------------------------------------
// Seeded PRNG (LCG) — fast, deterministic, no deps
// ---------------------------------------------------------------------------
function seededRng(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = Math.imul(s, 1664525) + 1013904223
    return (s >>> 0) / 0xffffffff
  }
}

/**
 * Compute a daily rotating seed that is different per category.
 * - Changes every UTC day → feed looks different tomorrow
 * - Mixed with category slug hash → browsing "Electronics" shuffles
 *   differently than browsing "Safety Boots"
 * - Mixed with userSeed (optional, e.g. hashed user-id) → two users
 *   see different orderings on the same day
 */
export function getDailySeed(category?: string, userSeed?: number): number {
  const dayBucket = Math.floor(Date.now() / ONE_DAY_MS) // changes each UTC day
  let catHash = 0
  if (category) {
    for (let i = 0; i < category.length; i++) {
      catHash = Math.imul(catHash * 31, 1) + category.charCodeAt(i)
    }
  }
  return ((dayBucket * 2654435761) ^ catHash ^ (userSeed || 0)) >>> 0
}

/**
 * Compute a simple, stable integer hash from a string (e.g. user ID).
 * Returns a 32-bit unsigned integer.
 */
export function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

/** Freshness decay that returns 1.0 when age=0 and 0.0 when age >= maxAgeMs */
function decayScore(ageMs: number, maxAgeMs: number): number {
  return Math.max(0, 1 - ageMs / maxAgeMs)
}

function scoreProduct(
  p: Product,
  now: number,
  rand: () => number
): number {
  let score = 0

  // --- Tier 1: Featured (paid boost) ----------------------------------------
  // Both vendor AND product featured → highest possible tier
  if (p.is_featured && p.vendor?.is_featured) score += 120
  else if (p.is_featured) score += 70        // product boosted
  else if (p.vendor?.is_featured) score += 45 // vendor boosted, product normal

  // --- Tier 2: Verification badge -------------------------------------------
  if (p.vendor?.verification_status === 'verified') score += 30

  // --- Tier 3: Stock status -------------------------------------------------
  // Available = full points; low_stock = partial; out_of_stock = penalty
  if (p.stock_status === 'available') score += 20
  else if (p.stock_status === 'low_stock') score += 8
  else score -= 40 // push out-of-stock to bottom

  // --- Tier 4: Listing freshness --------------------------------------------
  // last_confirmed_at: vendor explicitly re-confirmed price/stock recently
  // This rewards active vendors who keep their shop up-to-date
  if (p.last_confirmed_at) {
    const confirmedAgeMs = now - new Date(p.last_confirmed_at).getTime()
    score += decayScore(confirmedAgeMs, ONE_WEEK_MS) * 25
  }

  // --- Tier 5: Recency (created_at) -----------------------------------------
  // Newly listed products get a boost that fully decays after 30 days
  const createdAgeMs = now - new Date(p.created_at).getTime()
  score += decayScore(createdAgeMs, ONE_MONTH_MS) * 12

  // --- Tier 6: Daily rotating jitter ----------------------------------------
  // Makes the feed look different each day and between categories.
  // Keeps score influence small so it only reorders items in the same tier.
  score += rand() * 18

  return score
}

// ---------------------------------------------------------------------------
// Main ranking function
// ---------------------------------------------------------------------------

export interface RankFeedOptions {
  /** Category slug being browsed (used for per-category daily seed) */
  category?: string
  /** Hashed user identifier for per-user variation (use hashString(userId)) */
  userSeed?: number
  /**
   * Max products from the same vendor that may appear in the first `topSlots`
   * positions. Excess products are pushed below position `topSlots`.
   * Default: 2
   */
  vendorDiversityCap?: number
  /**
   * How many "prime" positions are subject to the diversity cap.
   * Default: 12  (first page above the fold on mobile)
   */
  topSlots?: number
}

/**
 * Rank a flat list of approved products using IslandHub's feed algorithm.
 *
 * Input:  products already filtered to status='approved', correct campus, etc.
 * Output: same products, re-ordered for feed display.
 */
export function rankFeed(
  products: Product[],
  options: RankFeedOptions = {}
): Product[] {
  if (products.length === 0) return products

  const {
    category,
    userSeed,
    vendorDiversityCap = 2,
    topSlots = 12,
  } = options

  const seed = getDailySeed(category, userSeed)
  const rand = seededRng(seed)
  const now = Date.now()

  // 1. Score every product
  const scored = products.map((p) => ({
    p,
    score: scoreProduct(p, now, rand),
  }))

  // 2. Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // 3. Vendor diversity cap
  //    Walk the sorted list; a vendor can fill at most `vendorDiversityCap`
  //    of the first `topSlots` positions. Extras are deferred to overflow.
  const vendorCount: Record<string, number> = {}
  const top: Array<{ p: Product; score: number }> = []
  const overflow: Array<{ p: Product; score: number }> = []

  for (const item of scored) {
    const vid = item.p.vendor_id
    const filled = top.length

    if (filled < topSlots) {
      const count = vendorCount[vid] || 0
      if (count < vendorDiversityCap) {
        top.push(item)
        vendorCount[vid] = count + 1
        continue
      }
    }
    overflow.push(item)
  }

  // 4. Merge: diverse top first, then overflow (still sorted by score)
  return [...top, ...overflow].map((s) => s.p)
}
