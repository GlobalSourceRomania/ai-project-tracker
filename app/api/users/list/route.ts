import { getCurrentUser, getAllUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Any authenticated user can see the list for mentions
    const users = await getAllUsers();
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
