import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, savePushSubscription } from '@/lib/db';

/**
 * POST /api/notifications/subscribe
 * Save push notification subscription for current user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    const result = await savePushSubscription(user.id, subscription);

    return NextResponse.json(
      { success: true, subscriptionId: result.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
