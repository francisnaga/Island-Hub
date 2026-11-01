// Jetty PWA Service Worker — Offline Cache + Push Notifications
// Version: 3.0 — adds cache-first for static assets, network-first for pages

const CACHE_NAME = 'jetty-v3'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/jetty-icon-192.png',
  '/jetty-favicon.svg',
]

// Install: pre-cache critical shell
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {}) // don't fail install if assets missing
    )
  )
})

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      ),
    ])
  )
})

// Fetch strategy:
// - _next/static/* and images → cache-first (immutable assets)
// - Supabase/API calls → network-only (never cache)
// - Pages (navigation) → network-first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin API/auth calls
  if (request.method !== 'GET') return
  if (url.hostname.includes('supabase.co')) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/auth/')) return

  // Static Next.js chunks and image CDN → cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|ico|woff2|woff|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // Pages → network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request).then((c) => c || caches.match('/')))
    )
    return
  }
})

// Handle incoming push messages
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Jetty', body: event.data.text() } }
  const title = data.title || 'Jetty'
  const options = {
    body: data.body || '',
    icon: '/jetty-icon-192.png',
    badge: '/jetty-icon-192.png',
    data: { url: data.url || '/admin' },
    tag: data.tag || 'jetty-admin',
    renotify: true,
    requireInteraction: false,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/admin'
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        const existing = list.find((c) => c.url.includes(url) && 'focus' in c)
        if (existing) return existing.focus()
        return clients.openWindow(url)
      })
  )
})
