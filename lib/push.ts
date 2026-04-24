import webpush from 'web-push';
import { getDB, getPushSubscriptionsExcept } from './db';

function getVapidConfig() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@globalsource-ai-tracking.com';
  return { vapidPublicKey, vapidPrivateKey, vapidSubject };
}

function buildPayload(title: string, body: string, data: object, badgeCount?: number) {
  return JSON.stringify({
    title,
    body,
    icon: '/logo-512x512.png',
    badge: '/favicon-32x32.png',
    tag: 'ai-tracker',
    badgeCount,   // tells sw.js what number to set on the app icon
    ...data,
  });
}

/** Send push to a specific user + include their current unread count as badge number */
export async function sendPushToUser(userId: number, title: string, body: string, data: object = {}) {
  const { vapidPublicKey, vapidPrivateKey, vapidSubject } = getVapidConfig();
  if (!vapidPublicKey || !vapidPrivateKey) return;

  const sql = getDB();
  const [subs, countRow] = await Promise.all([
    sql`SELECT * FROM push_subscriptions WHERE user_id = ${userId}`,
    sql`SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = ${userId} AND is_read = FALSE`,
  ]);
  if (subs.length === 0) return;

  const badgeCount = (countRow[0]?.c ?? 0) + 1; // +1 for the notification being sent right now
  const payload = buildPayload(title, body, data, badgeCount);

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  for (const sub of subs) {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    ).catch(() => {});
  }
}

/** Send push to ALL users EXCEPT the one making the change */
export async function sendPushToAllExcept(excludeUserId: number, title: string, body: string, data: object = {}) {
  const { vapidPublicKey, vapidPrivateKey, vapidSubject } = getVapidConfig();
  if (!vapidPublicKey || !vapidPrivateKey) return;

  const subs = await getPushSubscriptionsExcept(excludeUserId);
  if (subs.length === 0) return;

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  // Get unread counts per user so each gets the right badge number
  const sql = getDB();
  const counts = await sql`
    SELECT user_id, COUNT(*)::int AS c
    FROM notifications
    WHERE user_id = ANY(${subs.map((s: any) => s.user_id)})
      AND is_read = FALSE
    GROUP BY user_id
  `;
  const countMap = Object.fromEntries(counts.map((r: any) => [r.user_id, r.c]));

  await Promise.all(
    subs.map((sub: any) => {
      const badgeCount = (countMap[sub.user_id] ?? 0) + 1;
      const payload = buildPayload(title, body, data, badgeCount);
      return webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch(() => {});
    })
  );
}
