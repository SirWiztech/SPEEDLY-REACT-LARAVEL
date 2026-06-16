// Speedly PWA Service Worker v2 — Offline Sync + Background Sync + Live Reload
const CACHE_NAME = 'speedly-v3';
const OFFLINE_QUEUE = 'speedly-offline-queue';

// ========== Install — pre-cache critical shell ==========
self.addEventListener('install', () => {
  (self as any).skipWaiting();
});

// ========== Activate — clean old caches, claim clients ==========
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== OFFLINE_QUEUE).map((k) => caches.delete(k)))
    )
  );
  (self as any).clients.claim();
});

// ========== Fetch — network-first with offline fallback ==========
self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  const url = new URL(request.url);

  // API POST/PUT/DELETE — attempt network; if offline, queue for background sync
  if (
    url.pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  ) {
    event.respondWith(
      fetch(request.clone()).catch(() => {
        // Store the request for later replay
        return serializeRequest(request).then((serialized: any) => {
          return storeOfflineRequest(serialized).then(() => {
            // Notify client that request was queued
            notifyClients({
              type: 'QUEUED',
              url: request.url,
              method: request.method,
            });
            return new Response(
              JSON.stringify({
                success: false,
                message: 'You are offline. This action will be processed when you reconnect.',
                queued: true,
              }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        });
      })
    );
    return;
  }

  // Build assets and pages — network-first, cache on success
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached: any) => {
          if (cached) return cached;
          // Return offline fallback page for HTML requests
          if (request.headers.get('Accept')?.includes('text/html')) {
            return new Response(
              `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Speedly — Offline</title><style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;color:#333}.card{text-align:center;padding:40px;max-width:360px}.card h2{color:#ff5e00;font-size:24px}.card p{color:#888;font-size:14px;line-height:1.6}</style></head><body><div class='card'><h2>⚡ Speedly</h2><p>You are offline. Please check your internet connection and try again.</p></div></body></html>`,
              { status: 503, headers: { 'Content-Type': 'text/html' } }
            );
          }
          return new Response('Offline', { status: 503 });
        })
      )
  );
});

// ========== Background Sync — replay queued requests when back online ==========
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'speedly-sync') {
    event.waitUntil(replayOfflineQueue());
  }
});

// Periodically check for connectivity and sync
self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  }
  if (event.data && event.data.type === 'SYNC_NOW') {
    event.waitUntil(replayOfflineQueue());
  }
});

// ========== Helpers ==========

async function serializeRequest(request: Request): Promise<any> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.clone().text()
    : null;
  return {
    url: request.url,
    method: request.method,
    headers,
    body,
    timestamp: Date.now(),
  };
}

async function storeOfflineRequest(serialized: any): Promise<void> {
  const cache = await caches.open(OFFLINE_QUEUE);
  const key = `req-${serialized.timestamp}-${Math.random().toString(36).slice(2, 8)}`;
  await cache.put(key, new Response(JSON.stringify(serialized)));
}

async function replayOfflineQueue(): Promise<void> {
  const cache = await caches.open(OFFLINE_QUEUE);
  const keys = await cache.keys();

  const results: { success: number; failed: number } = { success: 0, failed: 0 };

  for (const request of keys) {
    try {
      const response = await cache.match(request);
      if (!response) continue;

      const serialized = await response.json();
      const fetchOptions: RequestInit = {
        method: serialized.method,
        headers: serialized.headers,
      };
      if (serialized.body) {
        fetchOptions.body = serialized.body;
      }

      const networkResponse = await fetch(serialized.url, fetchOptions);

      if (networkResponse.ok) {
        await cache.delete(request);
        results.success++;
        notifyClients({ type: 'SYNCED', url: serialized.url, method: serialized.method });
      } else {
        results.failed++;
      }
    } catch {
      // Still offline — leave in queue
      results.failed++;
      break; // Stop trying if network is gone
    }
  }

  // Notify client of sync results
  notifyClients({ type: 'SYNC_COMPLETE', ...results });
}

function notifyClients(data: any): void {
  (self as any).clients.matchAll({ type: 'window' }).then((clients: any[]) => {
    clients.forEach((client: any) => client.postMessage(data));
  });
}
