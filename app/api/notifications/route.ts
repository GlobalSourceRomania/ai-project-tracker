import { getCurrentUser, getUserByEmail } from '@/lib/db';
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
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, type, projectId, authorId, message, mentionedEmail, field, excerpt, projectName } = await request.json();

    // Case 1: Direct notification (admin creating)
    if (userId && type && projectId && authorId && message) {
      const notification = await createNotification(userId, type, projectId, authorId, message);
      return Response.json({ notification }, { status: 201 });
    }

    // Case 2: Mention notification (any user mentioning someone)
    if (mentionedEmail && projectId && field && excerpt) {
      console.log(`[MENTION] Processing mention for ${mentionedEmail} in project ${projectId} by user ${user.id}`);
      const mentionedUser = await getUserByEmail(mentionedEmail);
      if (!mentionedUser) {
        console.log(`[MENTION] User not found for email: ${mentionedEmail}`);
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      console.log(`[MENTION] Found user: ${mentionedUser.id} (${mentionedUser.email})`);

      // Don't notify if mentioning yourself
      if (mentionedUser.id === user.id) {
        console.log(`[MENTION] Self-mention, skipping notification`);
        return Response.json({ success: true }, { status: 201 });
      }

      const mentionMsg = `mentioned you in ${projectName || 'a project'} (${field}): "${excerpt.substring(0, 50)}${excerpt.length > 50 ? '...' : ''}"`;
      console.log(`[MENTION] Creating notification with message: ${mentionMsg}`);
      const notification = await createNotification(mentionedUser.id, 'mention', projectId, user.id, mentionMsg);
      console.log(`[MENTION] Notification created: ${JSON.stringify(notification)}`);
      return Response.json({ notification }, { status: 201 });
    }

    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
