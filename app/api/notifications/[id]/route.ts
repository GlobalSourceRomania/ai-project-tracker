import { getCurrentUser } from '@/lib/db';
import { markNotificationAsRead, deleteNotification } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { action } = await request.json();
    const resolvedParams = await params;
    const notificationId = parseInt(resolvedParams.id);

    if (!notificationId) {
      return Response.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    if (action === 'mark-read') {
      const notification = await markNotificationAsRead(notificationId);
      return Response.json({ notification });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return Response.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const notificationId = parseInt(resolvedParams.id);

    if (!notificationId) {
      return Response.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    await deleteNotification(notificationId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return Response.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
