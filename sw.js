// Tombstone — not a real service worker.
//
// A service worker was briefly deployed here and is still registered in any
// browser that loaded the site while it was live. Simply deleting this file
// does NOT evict it: wrangler.jsonc sets not_found_handling to
// "single-page-application", so /sw.js answers 200 text/html (index.html)
// instead of 404, the browser's update check rejects it as a non-JS script,
// and the old worker stays installed indefinitely.
//
// This file exists only to replace that worker and unregister itself. It has no
// fetch handler, so it never touches a request. Safe to delete once enough time
// has passed for visitors to have loaded the site again (a few weeks is plenty).
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach((c) => c.navigate(c.url));   // drop the page out of SW control
  })());
});
