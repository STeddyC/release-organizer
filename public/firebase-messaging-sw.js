// Give the service worker access to Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBYculaKvwuScLjDA0OrDAqYBP_CiVA5Gg',
  authDomain: 'release-organize.firebaseapp.com',
  projectId: 'release-organize',
  storageBucket: 'release-organize.firebasestorage.app',
  messagingSenderId: '517728550807',
  appId: '1:517728550807:web:f0ab81880b7e263a990ed2',
  databaseURL: 'https://release-organize-default-rtdb.europe-west1.firebasedatabase.app'
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.icon || '/logo-square.png',
    badge: '/logo-square.png',
    tag: payload.data?.type || 'default',
    data: {
      url: getNotificationUrl(payload.data?.type, payload.data),
      ...payload.data
    },
    actions: getNotificationActions(payload.data?.type)
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // If a window client is available, focus it
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window client is available, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

function getNotificationUrl(type, data) {
  switch (type) {
    case 'release':
      return `/releases`;
    case 'submission':
      return `/submissions`;
    case 'answer':
      return `/submissions`;
    case 'social':
      return `/social`;
    default:
      return '/';
  }
}

function getNotificationActions(type) {
  switch (type) {
    case 'release':
      return [
        { action: 'view', title: 'View Release' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    case 'submission':
    case 'answer':
      return [
        { action: 'view', title: 'View Submission' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    case 'social':
      return [
        { action: 'view', title: 'View Post' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    default:
      return [];
  }
}