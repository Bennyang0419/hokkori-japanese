// ほっこり日語 — Service Worker (PWA)
const CACHE_NAME = 'hokkori-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/flashcards',
  '/offline.html',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and API calls
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return

  // Cache-first for static assets
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/fonts') ||
    url.pathname.match(/\.(png|jpg|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached ?? fetch(request).then(res => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return res
        })
      )
    )
    return
  }

  // Network-first for pages, fallback to offline
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then(cached =>
        cached ?? caches.match('/offline.html')
      )
    )
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title ?? 'ほっこり日語'
  const options = {
    body: data.body ?? '今日も学習しましょう ☕',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'daily-reminder',
    renotify: true,
    data: { url: data.url ?? '/dashboard' },
    actions: [
      { action: 'open',    title: '開始學習' },
      { action: 'dismiss', title: '稍後提醒' },
    ],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url ?? '/dashboard'
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(clientList => {
      const existing = clientList.find(c => c.url.includes(url) && 'focus' in c)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
