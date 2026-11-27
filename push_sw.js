// Firebase-Free W3C Web Push Service Worker (push_sw.js)
// Deliberately avoids asset/fetch caching so Flutter deployments never serve stale bundles.

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  let payload = {
    title: 'Wise Landlord Alert',
    body: 'New actionable property or CashFlow alert received.',
    route: '/notifications'
  };
  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = Object.assign(payload, parsed);
    } catch (_) {
      payload.body = event.data.text() || payload.body;
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: 'icons/Icon-192.png',
      badge: 'icons/Icon-192.png',
      data: { route: payload.route || '/notifications' }
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetRoute = (event.notification.data && event.notification.data.route) || '/notifications';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'WISE_LANDLORD_DEEP_LINK', route: targetRoute });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetRoute);
      }
    })
  );
});
