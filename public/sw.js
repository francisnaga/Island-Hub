// Jetty PWA Service Worker — Push Notification Support
// Version: 2.0 — replaces self-unregistering stub

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// Handle incoming push messages
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Jetty', body: event.data.text() }
  }

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

// Handle notification clicks — open or focus the admin URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/admin'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        // If admin tab already open, focus it
        const existing = list.find((c) => c.url.includes(url) && 'focus' in c)
        if (existing) return existing.focus()
        // Otherwise open a new tab
        return clients.openWindow(url)
      })
  )
})
