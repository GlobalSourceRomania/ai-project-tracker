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

    return NextResponse.json({ ok: true, message: 'Database initialized. Admin user: admin@example.com / password' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
