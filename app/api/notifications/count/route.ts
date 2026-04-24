import { getCurrentUser, getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return Response.json({ count: 0 });

    const sql = getDB();
    const result = await sql`
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE user_id = ${user.id}
        AND is_read = FALSE
        AND created_at > NOW() - INTERVAL '30 days'
    `;
    return Response.json({ count: result[0]?.count ?? 0 });
  } catch {
    return Response.json({ count: 0 });
  }
}
