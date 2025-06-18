// Service Worker for MenoWellness PWA
const CACHE_NAME = 'menowellness-v1';
const STATIC_CACHE = 'menowellness-static-v1';
const RUNTIME_CACHE = 'menowellness-runtime-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Add other critical static assets
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed and static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online, serve from network and update cache
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // If offline, serve from cache or offline page
          return caches.match(request)
            .then((response) => response || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Handle API requests with special strategy for health data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      handleAPIRequest(request)
    );
    return;
  }

  // Handle static assets
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }

  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Special handling for API requests (health data)
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Always try network first for health data
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, trying cache...');
    
    // For GET requests, try to serve from cache
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Add header to indicate this is cached data
        const headers = new Headers(cachedResponse.headers);
        headers.set('X-Cached-Data', 'true');
        
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers
        });
      }
    }
    
    // For write operations when offline, store in IndexedDB
    if (request.method === 'POST' || request.method === 'PUT') {
      await storeOfflineAction(request);
      return new Response(
        JSON.stringify({ 
          success: true, 
          offline: true, 
          message: 'Data saved offline and will sync when online' 
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    throw error;
  }
}

// Store offline actions in IndexedDB for later sync
async function storeOfflineAction(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: [...request.headers.entries()],
      body: await request.text(),
      timestamp: Date.now()
    };
    
    // Open IndexedDB and store the action
    const dbRequest = indexedDB.open('MenoWellnessOffline', 1);
    
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineActions')) {
        db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      store.add(requestData);
    };
  } catch (error) {
    console.error('Failed to store offline action:', error);
  }
}

// Listen for online event to sync offline actions
self.addEventListener('online', () => {
  console.log('Device is online, syncing offline actions...');
  syncOfflineActions();
});

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    const dbRequest = indexedDB.open('MenoWellnessOffline', 1);
    
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const offlineActions = getAllRequest.result;
        
        for (const action of offlineActions) {
          try {
            const request = new Request(action.url, {
              method: action.method,
              headers: new Headers(action.headers),
              body: action.body
            });
            
            const response = await fetch(request);
            
            if (response.ok) {
              // Delete successful sync
              store.delete(action.id);
              console.log('Synced offline action:', action.url);
            }
          } catch (error) {
            console.error('Failed to sync action:', error);
          }
        }
      };
    };
  } catch (error) {
    console.error('Failed to sync offline actions:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: [
      {
        action: 'track',
        title: 'Track Symptoms',
        icon: '/icons/track-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'track') {
    event.waitUntil(
      clients.openWindow('/track')
    );
  } else if (event.action !== 'dismiss') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineActions());
  }
});