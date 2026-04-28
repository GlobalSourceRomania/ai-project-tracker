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

    const { getDB } = await import('@/lib/db');
    const sql = getDB();

    // Fix existing pipedrive codes that have multiple leading '#'
    const fixed = await sql`
      UPDATE projects
      SET pipedrive_code = '#' || ltrim(pipedrive_code, '#')
      WHERE pipedrive_code LIKE '##%'
      RETURNING id, pipedrive_code
    `;

    // Migration: make pipedrive_code nullable
    await sql`ALTER TABLE projects ALTER COLUMN pipedrive_code DROP NOT NULL`.catch(() => {});

    // Migration: drop old unique constraint and add new one (only for non-NULL values)
    await sql`ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_pipedrive_code_unique`.catch(() => {});
    await sql`DROP INDEX IF EXISTS projects_pipedrive_code_unique_non_null`.catch(() => {});
    await sql`CREATE UNIQUE INDEX projects_pipedrive_code_unique_non_null ON projects (LOWER(pipedrive_code)) WHERE pipedrive_code IS NOT NULL`.catch(() => {});

    // Migration: update status constraint — remove 'waiting', add 'demo'
    await sql`ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check`.catch(() => {});
    await sql`
      ALTER TABLE projects ADD CONSTRAINT projects_status_check
      CHECK (status IN ('planning', 'demo', 'in_progress', 'bottleneck', 'completed'))
    `.catch(() => {});

    // Migration: move any existing 'waiting' projects to 'in_progress'
    const migratedWaiting = await sql`
      UPDATE projects
      SET status = 'in_progress'
      WHERE status = 'waiting'
      RETURNING id, title
    `;

    return NextResponse.json({
      ok: true,
      message: 'Database initialized. Admin user: admin@example.com / password',
      fixedCodes: fixed.length,
      migratedWaiting: migratedWaiting.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
