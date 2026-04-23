import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getPushSubscriptionsExcept } from '@/lib/db';
import webpush from 'web-push';

/**
 * POST /api/notifications/send
 * Send push notification to all users except the one who made the change
 * Only for admin/editor roles
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Unauthorized - editor/admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, action, projectName, changedBy } = body;

    if (!projectId || !action || !projectName) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, action, projectName' },
        { status: 400 }
      );
    }

    // Get all subscriptions except current user
    const subscriptions = await getPushSubscriptionsExcept(user.id);

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { success: true, notificationsSent: 0 },
        { status: 200 }
      );
    }

    // Configure webpush with VAPID keys
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@globalsource-ai-tracking.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured - skipping push notifications');
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Notification payload
    const payload = JSON.stringify({
      title: `Project ${action === 'created' ? 'Created' : 'Updated'}`,
      body: `${changedBy} ${action === 'created' ? 'created' : 'updated'} "${projectName}"`,
      icon: '/logo-512x512.png',
      badge: '/favicon-32x32.png',
      projectId,
      action,
      projectName,
      changedBy,
    });

    // Send to all subscriptions
    let sent = 0;
    let failed = 0;

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        sent++;
      } catch (error: any) {
        console.error('Failed to send push notification:', error.message);

        // If subscription is invalid (410 Gone), skip logging as error
        if (error.statusCode === 410) {
          console.log('Subscription endpoint expired, will be cleaned up');
        }

        failed++;
      }
    });

    await Promise.all(promises);

    return NextResponse.json(
      {
        success: true,
        notificationsSent: sent,
        notificationsFailed: failed,
        message: `Sent ${sent} notifications${failed > 0 ? `, ${failed} failed` : ''}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Push notification send error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
