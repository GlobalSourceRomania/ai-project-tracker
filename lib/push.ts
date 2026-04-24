import webpush from 'web-push';
import { getDB, getPushSubscriptionsExcept } from './db';

function getVapidConfig() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@globalsource-ai-tracking.com';
  return { vapidPublicKey, vapidPrivateKey, vapidSubject };
}

/** Send a push notification to a specific user (by userId) */
export async function sendPushToUser(userId: number, title: string, body: string, data: object = {}) {
  const { vapidPublicKey, vapidPrivateKey, vapidSubject } = getVapidConfig();
  if (!vapidPublicKey || !vapidPrivateKey) return;

  const sql = getDB();
  const subs = await sql`SELECT * FROM push_subscriptions WHERE user_id = ${userId}`;
  if (subs.length === 0) return;

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const payload = JSON.stringify({
    title,
    body,
    icon: '/logo-512x512.png',
    badge: '/favicon-32x32.png',
    tag: 'ai-tracker',
    ...data,
  });

  for (const sub of subs) {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    ).catch(() => {}); // ignore expired/invalid subscriptions silently
  }
}

/** Send a push notification to ALL users EXCEPT the one making the change */
export async function sendPushToAllExcept(excludeUserId: number, title: string, body: string, data: object = {}) {
  const { vapidPublicKey, vapidPrivateKey, vapidSubject } = getVapidConfig();
  if (!vapidPublicKey || !vapidPrivateKey) return;

  const subs = await getPushSubscriptionsExcept(excludeUserId);
  if (subs.length === 0) return;

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const payload = JSON.stringify({
    title,
    body,
    icon: '/logo-512x512.png',
    badge: '/favicon-32x32.png',
    tag: 'ai-tracker',
    ...data,
  });

  await Promise.all(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch(() => {})
    )
  );
}
