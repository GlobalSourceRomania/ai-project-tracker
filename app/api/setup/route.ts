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

    const steps: Record<string, string> = {};

    // Step 1: make pipedrive_code nullable
    try {
      await sql`ALTER TABLE projects ALTER COLUMN pipedrive_code DROP NOT NULL`;
      steps.nullable = 'ok';
    } catch (e) { steps.nullable = String(e); }

    // Step 2: drop old unique constraint
    try {
      await sql`ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_pipedrive_code_unique`;
      steps.dropOldConstraint = 'ok';
    } catch (e) { steps.dropOldConstraint = String(e); }

    // Step 3: drop old index if any
    try {
      await sql`DROP INDEX IF EXISTS projects_pipedrive_code_unique_non_null`;
      steps.dropOldIndex = 'ok';
    } catch (e) { steps.dropOldIndex = String(e); }

    // Step 4: create new partial unique index (no LOWER to avoid syntax issues)
    try {
      await sql`CREATE UNIQUE INDEX projects_pipedrive_code_unique_non_null ON projects (pipedrive_code) WHERE pipedrive_code IS NOT NULL`;
      steps.createIndex = 'ok';
    } catch (e) { steps.createIndex = String(e); }

    // Step 5: drop old status constraint
    try {
      await sql`ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check`;
      steps.dropStatusConstraint = 'ok';
    } catch (e) { steps.dropStatusConstraint = String(e); }

    // Step 6: add new status constraint
    try {
      await sql`ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('planning', 'demo', 'in_progress', 'bottleneck', 'completed'))`;
      steps.addStatusConstraint = 'ok';
    } catch (e) { steps.addStatusConstraint = String(e); }

    // Step 7: migrate 'waiting' projects → 'in_progress'
    let migratedWaiting = 0;
    try {
      const result = await sql`UPDATE projects SET status = 'in_progress' WHERE status = 'waiting' RETURNING id`;
      migratedWaiting = result.length;
      steps.migrateWaiting = `ok (${migratedWaiting} rows)`;
    } catch (e) { steps.migrateWaiting = String(e); }

    return NextResponse.json({
      ok: true,
      message: 'Database initialized.',
      fixedCodes: fixed.length,
      migratedWaiting,
      steps,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
