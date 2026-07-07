// Speedly PWA Service Worker — Offline Sync + Background Sync + Live Reload
var CACHE_NAME = 'speedly-v3';
var OFFLINE_QUEUE = 'speedly-offline-queue';

self.addEventListener('install', function() {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME && k !== OFFLINE_QUEUE; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

// Skip non-HTTP(S) requests (chrome-extension://, etc.)
function isCacheable(request) {
    var url = request.url;
    return url.startsWith('http://') || url.startsWith('https://');
}

self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url;

    try { url = new URL(request.url); } catch(e) { return; }

    // Only handle HTTP(S) requests
    if (!isCacheable(request)) return;

    // API writes — queue offline
    if (url.pathname.startsWith('/api/') && ['POST','PUT','DELETE','PATCH'].indexOf(request.method) !== -1) {
        event.respondWith(
            fetch(request.clone()).catch(function() {
                return serializeRequest(request).then(function(serialized) {
                    return storeOfflineRequest(serialized).then(function() {
                        notifyClients({ type: 'QUEUED', url: request.url, method: request.method });
                        return new Response(
                            JSON.stringify({ success: false, message: 'You are offline. This will process when you reconnect.', queued: true }),
                            { status: 503, headers: { 'Content-Type': 'application/json' } }
                        );
                    });
                });
            })
        );
        return;
    }

    // API reads (GET) — network-only, no cache (prevents stale data)
    if (url.pathname.startsWith('/api/') && request.method === 'GET') {
        event.respondWith(fetch(request).catch(function() {
            return new Response(
                JSON.stringify({ success: false, message: 'You are offline. Please check your connection.' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
        }));
        return;
    }

    // Everything else (assets, pages) — network-first, cache fallback
    event.respondWith(
        fetch(request).then(function(response) {
            if (response.ok && response.status === 200 && response.type === 'basic') {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) { cache.put(request, clone); });
            }
            return response;
        }).catch(function() {
            return caches.match(request).then(function(cached) {
                if (cached) return cached;
                if (request.headers.get('Accept') && request.headers.get('Accept').indexOf('text/html') !== -1) {
                    return new Response(
                        '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Speedly Offline</title><style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;color:#333}.card{text-align:center;padding:40px;max-width:360px}.card h2{color:#ff5e00;font-size:24px}.card p{color:#888;font-size:14px}</style></head><body><div class="card"><h2>Speedly</h2><p>You are offline. Please check your connection and try again.</p></div></body></html>',
                        { status: 503, headers: { 'Content-Type': 'text/html' } }
                    );
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

self.addEventListener('sync', function(event) {
    if (event.tag === 'speedly-sync') {
        event.waitUntil(replayOfflineQueue());
    }
});

self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
    if (event.data && event.data.type === 'SYNC_NOW') event.waitUntil(replayOfflineQueue());
});

function serializeRequest(request) {
    var headers = {};
    request.headers.forEach(function(value, key) { headers[key] = value; });
    var bodyPromise = (request.method !== 'GET' && request.method !== 'HEAD')
        ? request.clone().text()
        : Promise.resolve(null);
    return bodyPromise.then(function(body) {
        return { url: request.url, method: request.method, headers: headers, body: body, timestamp: Date.now() };
    });
}

function storeOfflineRequest(serialized) {
    return caches.open(OFFLINE_QUEUE).then(function(cache) {
        var key = 'req-' + serialized.timestamp + '-' + Math.random().toString(36).slice(2, 8);
        return cache.put(key, new Response(JSON.stringify(serialized)));
    });
}

function replayOfflineQueue() {
    var results = { success: 0, failed: 0 };
    return caches.open(OFFLINE_QUEUE).then(function(cache) {
        return cache.keys().then(function(keys) {
            function processNext(index) {
                if (index >= keys.length) {
                    notifyClients({ type: 'SYNC_COMPLETE', success: results.success, failed: results.failed });
                    return;
                }
                var request = keys[index];
                return cache.match(request).then(function(response) {
                    if (!response) { results.failed++; return processNext(index + 1); }
                    return response.json().then(function(serialized) {
                        var opts = { method: serialized.method, headers: serialized.headers };
                        if (serialized.body) opts.body = serialized.body;
                        return fetch(serialized.url, opts).then(function(netResp) {
                            if (netResp.ok) {
                                return cache.delete(request).then(function() {
                                    results.success++;
                                    notifyClients({ type: 'SYNCED', url: serialized.url, method: serialized.method });
                                    return processNext(index + 1);
                                });
                            }
                            results.failed++;
                            return processNext(index + 1);
                        });
                    });
                }).catch(function() {
                    results.failed++;
                    return processNext(index + 1);
                });
            }
            return processNext(0);
        });
    });
}

function notifyClients(data) {
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) { client.postMessage(data); });
    });
}
