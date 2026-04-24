import { initDB, createUser, getUserByEmail } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await initDB();

    const adminUser = await getUserByEmail('admin@example.com');
    if (!adminUser) {
      await createUser('admin@example.com', 'password', 'Admin User', 'admin');
    }

    // Fix existing pipedrive codes that have multiple leading '#'
    const { getDB } = await import('@/lib/db');
    const sql = getDB();
    const fixed = await sql`
      UPDATE projects
      SET pipedrive_code = '#' || ltrim(pipedrive_code, '#')
      WHERE pipedrive_code LIKE '##%'
      RETURNING id, pipedrive_code
    `;

    return NextResponse.json({
      ok: true,
      message: 'Database initialized. Admin user: admin@example.com / password',
      fixedCodes: fixed.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
