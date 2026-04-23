'use client';

/**
 * Service Worker Registration & Push Notification Setup
 */

export interface PushNotificationPayload {
  projectId: number;
  action: 'created' | 'updated' | 'deleted';
  projectName: string;
  changedBy: string;
}

/**
 * Register service worker and setup push notifications
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('✅ Service Worker registered:', registration);

    // Setup push notification listener
    if ('Notification' in window && Notification.permission === 'granted') {
      setupPushNotifications();
    }

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
}

/**
 * Request push notification permission and subscribe
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    setupPushNotifications();
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    setupPushNotifications();
    return true;
  }

  return false;
}

/**
 * Setup push notifications after subscription
 */
async function setupPushNotifications() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;

  try {
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key not configured');
        return;
      }

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        console.log('✅ Push subscription saved');
      } else {
        console.error('Failed to save subscription');
      }
    }
  } catch (error) {
    console.error('❌ Push notification setup failed:', error);
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray as BufferSource;
}

/**
 * Setup listener for push messages from service worker
 */
export function setupNotificationListener(
  onNotification: (payload: PushNotificationPayload) => void
) {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'PUSH_RECEIVED') {
      onNotification(event.data.payload);
    }
  });
}
