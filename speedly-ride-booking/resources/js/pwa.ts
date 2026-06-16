/**
 * Speedly PWA Registration
 * - Registers the service worker
 * - Handles live reload (update prompt when new sw is available)
 * - Handles offline queue status
 * - Triggers background sync
 */
export function registerPWA() {
  if (!('serviceWorker' in navigator)) return;

  // Live reload — listen for SW updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  // Listen for messages from service worker (offline queue, sync results)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (!event.data) return;

    // Sync completed notification
    if (event.data.type === 'SYNC_COMPLETE') {
      const { success, failed } = event.data;
      if (success > 0) {
        console.log(`[PWA] ${success} offline request(s) synced successfully.`);
      }
      if (failed > 0) {
        console.warn(`[PWA] ${failed} offline request(s) failed to sync.`);
      }
    }

    // Individual request synced
    if (event.data.type === 'SYNCED') {
      console.log(`[PWA] Synced ${event.data.method} ${event.data.url}`);
    }

    // Request was queued while offline
    if (event.data.type === 'QUEUED') {
      console.log(`[PWA] Queued ${event.data.method} ${event.data.url} for sync`);
    }
  });

  // Register the service worker
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('[PWA] Service Worker registered:', registration.scope);

      // Check for updated service worker
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (
            installingWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New version available — prompt user
            const updateNow = confirm(
              'A new version of Speedly is available. Update now?'
            );
            if (updateNow) {
              installingWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        });
      });

      // Register background sync
      if ('SyncManager' in (window as any)) {
        registration.sync
          .register('speedly-sync')
          .then(() => console.log('[PWA] Background sync registered'))
          .catch(() => {});
      } else {
        // Fallback: periodically try to sync when online
        window.addEventListener('online', () => {
          console.log('[PWA] Online — triggering sync');
          if (registration.active) {
            registration.active.postMessage({ type: 'SYNC_NOW' });
          }
        });
      }

      // Detect first install
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA] Running in standalone mode (installed)');
      }
    })
    .catch((error) => {
      console.warn('[PWA] Service Worker registration failed:', error);
    });
}

export function unregisterPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
