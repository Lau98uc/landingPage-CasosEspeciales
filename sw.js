const CACHE_NAME = 'castelasoft-v1.1.0';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-brands-400.woff2'
];

// Install event - cache all resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing CastelaSoft PWA...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files for offline use...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('Service Worker: Error caching files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating CastelaSoft PWA...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (request.destination === 'document') {
    // Handle navigation requests
    event.respondWith(
      caches.match('./index.html')
        .then(response => {
          return response || fetch(request);
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );
  } else if (request.destination === 'style' || request.destination === 'script') {
    // Handle CSS and JS requests
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then(response => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return fallback for CSS/JS
              if (request.destination === 'style') {
                return new Response('/* Fallback CSS */', {
                  headers: { 'Content-Type': 'text/css' }
                });
              }
              if (request.destination === 'script') {
                return new Response('// Fallback JS', {
                  headers: { 'Content-Type': 'application/javascript' }
                });
              }
            });
        })
    );
  } else if (request.destination === 'font') {
    // Handle font requests
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(response => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(request, responseToCache);
                  });
              }
              return response;
            });
        })
    );
  } else {
    // Handle other requests (images, etc.)
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(response => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return offline fallback for images
              if (request.destination === 'image') {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#999">Offline</text></svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              }
            });
        })
    );
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline form submissions or other background tasks
  return Promise.resolve();
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'CastelaSoft',
    body: 'Nueva actualización disponible',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxwYXRoIGQ9Ik05NiA0OEM3My45MDg2IDQ4IDU2IDY1LjkwODYgNTYgODhWMTQ0QzU2IDE2Ni4wOTEgNzMuOTA4NiAxODQgOTYgMTg0QzExOC4wOTEgMTg0IDEzNiAxNjYuMDkxIDEzNiAxNDRWODhDMTM2IDY1LjkwODYgMTE4LjA5MSA0OCA5NiA0OFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04OCA3MkgxMDRWMTM2SDg4VjcyWiIgZmlsbD0iIzI1NjNlYiIvPgo8cGF0aCBkPSJNODggMTQ0SDEwNFYxNjBIOThDOTIuNDc3MiAxNjAgODggMTU1LjUyMyA4OCAxNTBWMTQ0WiIgZmlsbD0iIzI1NjNlYiIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMTkyIiB5Mj0iMTkyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+',
    badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjcyIiByeD0iMTIiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxwYXRoIGQ9Ik0zNiAyNEMyOS4zNzI2IDI0IDI0IDI5LjM3MjYgMjQgMzZWMzRIMzZDMzYuNTUyMyAzNCAzNyAzNC40NDc3IDM3IDM1VjM2QzM3IDQyLjYyNzQgMzAuNjI3NCA0OSAyNCA0OUgyNEMxNy4zNzI2IDQ5IDEyIDQzLjYyNzQgMTIgMzZWMTJIMjRDMzAuNjI3NCAxMiAzNiAxNy4zNzI2IDM2IDI0WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTMzIDI3SDM5VjQ1SDMzVjI3WiIgZmlsbD0iIzI1NjNlYiIvPgo8cGF0aCBkPSJNMzMgNDVIMzlWNjBIMzZDMzQuMzQzMSA2MCAzMyA1OC42NTY5IDMzIDU3VjQ1WiIgZmlsbD0iIzI1NjNlYiIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iNzIiIHkyPSI3MiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNjY3ZWVhIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzc2NGJhMiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPg==',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: './'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver más',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4='
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDYuNDFMMTcuNTkgNUwxMiAxMC41OUw2LjQxIDVMNSA2LjQxTDEwLjU5IDEyTDUgMTcuNTlMNi40MSAxOUwxMiAxMy40MUwxNy41OSAxOUwxOSAxNy41OUwxMy40MSAxMkwxOSA2LjQxWiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4='
      }
    ],
    requireInteraction: false,
    silent: false
  };
  
  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      if (pushData.title) notificationData.title = pushData.title;
      if (pushData.body) notificationData.body = pushData.body;
      if (pushData.url) notificationData.data.url = pushData.url;
    } catch (e) {
      // If JSON parsing fails, use text
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || './')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Handle app install
self.addEventListener('appinstalled', event => {
  console.log('Service Worker: App was installed');
  // You can send analytics here
});

// Handle app update
self.addEventListener('appupdatefound', event => {
  console.log('Service Worker: App update found');
  // Notify the user about the update
}); 