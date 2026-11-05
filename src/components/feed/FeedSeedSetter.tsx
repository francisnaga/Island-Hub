'use client'

/**
 * FeedSeedSetter — invisible component, mounts once per browser.
 *
 * Sets a `jetty_feed_seed` cookie with a random value the first time a
 * visitor lands on the site. The server reads this cookie to give each
 * browser a slightly different feed ordering via the feed-algorithm.
 *
 * The cookie persists for 1 year and doesn't store any personal data —
 * it's just a random number used as a ranking seed.
 */
import { useEffect } from 'react'

export function FeedSeedSetter() {
  useEffect(() => {
    // Only set if not already stamped
    if (document.cookie.includes('jetty_feed_seed=')) return
    // Generate a random 9-digit seed
    const seed = Math.floor(Math.random() * 1_000_000_000).toString()
    // SameSite=Lax, 1-year TTL, no Secure flag needed (not sensitive data)
    const maxAge = 60 * 60 * 24 * 365
    document.cookie = `jetty_feed_seed=${seed}; path=/; max-age=${maxAge}; SameSite=Lax`
  }, [])

  return null
}
