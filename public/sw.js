const CACHE_NAME = 'construacero-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/assets/logo.png',
  '/assets/instagram/profile.jpg',
  '/assets/instagram/post-1.jpg',
  '/assets/instagram/post-2.jpg',
  '/assets/instagram/post-3.jpg',
  '/assets/instagram/post-4.jpg',
  '/assets/instagram/post-5.jpg',
  '/assets/instagram/post-6.jpg',
  '/assets/instagram/post-7.jpg',
  '/assets/instagram/post-8.jpg',
  '/assets/instagram/post-9.jpg',
  '/assets/instagram/post-10.jpg',
  '/assets/instagram/post-11.jpg',
  '/assets/instagram/post-12.jpg',
  '/badge.png',
  '/favicon.ico'
];

// Install Event - Pre-cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching Core App Shell...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Removing Old Cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event - Caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Database Queries / REST API calls (Supabase) -> Network-First (with offline cache fallback)
  if (requestUrl.hostname.includes('supabase.co') && requestUrl.pathname.includes('/rest/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response and cache it for offline fallback
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
          return response;
        })
        .catch(() => {
          // If offline, attempt to serve last cached database response
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Offline: Serving cached Supabase query');
              return cachedResponse;
            }
            // Return an empty/error shape JSON if no cache is found
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // 2. Google Fonts or external CDN files -> Stale-While-Revalidate
  if (
    requestUrl.hostname.includes('fonts.googleapis.com') ||
    requestUrl.hostname.includes('fonts.gstatic.com') ||
    requestUrl.hostname.includes('cdn.jsdelivr.net')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. App Shell assets (CSS, JS, local images) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful local GET requests
          if (
            networkResponse.status === 200 &&
            event.request.method === 'GET' &&
            requestUrl.origin === self.location.origin
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback for index.html if request fails and is for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
