import { getCurrentUser } from '@/lib/db';
import { getNotifications, createNotification, deleteOldNotifications } from '@/lib/db';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await deleteOldNotifications();
    const notifications = await getNotifications(user.id);
    return Response.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, type, projectId, authorId, message } = await request.json();

    if (!userId || !type || !projectId || !authorId || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = await createNotification(userId, type, projectId, authorId, message);
    return Response.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
