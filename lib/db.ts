import { neon } from '@neondatabase/serverless';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export function getDB() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
  return neon(process.env.DATABASE_URL);
}

export async function getCurrentUser(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split('; ').reduce((acc: any, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies.token;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await getUserById(payload.userId);
    return user || null;
  } catch {
    return null;
  }
}

export async function initDB() {
  const sql = getDB();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT users_email_unique UNIQUE (email)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      pipedrive_code TEXT NOT NULL,
      owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT CHECK (status IN ('planning', 'in_progress', 'waiting', 'completed')) DEFAULT 'planning',
      description TEXT,
      bottleneck TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT projects_pipedrive_code_unique UNIQUE (pipedrive_code)
    )
  `;

  // Migration: add new columns to existing projects table
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS bottleneck TEXT`;

  // Migration: expand status check constraint to include 'bottleneck'
  await sql`ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check`;
  await sql`ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('planning', 'in_progress', 'waiting', 'completed', 'bottleneck'))`;

  await sql`
    CREATE TABLE IF NOT EXISTS project_updates (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      what_done TEXT,
      what_waiting TEXT,
      next_steps TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS project_tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      is_done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function getUserById(id: number) {
  const sql = getDB();
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result[0] || null;
}

export async function getUserByEmail(email: string) {
  const sql = getDB();
  const result = await sql`SELECT * FROM users WHERE email = ${email}`;
  return result[0] || null;
}

export async function getAllUsers() {
  const sql = getDB();
  return sql`SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC`;
}

export async function createUser(email: string, password: string, displayName: string, role: 'admin' | 'editor' | 'viewer' = 'viewer') {
  const sql = getDB();
  const passwordHash = await bcryptjs.hash(password, 10);
  const result = await sql`INSERT INTO users (email, password_hash, display_name, role) VALUES (${email}, ${passwordHash}, ${displayName}, ${role}) RETURNING id, email, display_name, role, created_at`;
  return result[0];
}

export async function updateUser(id: number, displayName?: string, role?: 'admin' | 'editor' | 'viewer') {
  const sql = getDB();

  if (displayName !== undefined && role !== undefined) {
    const result = await sql`UPDATE users SET display_name = ${displayName}, role = ${role}, updated_at = NOW() WHERE id = ${id} RETURNING id, email, display_name, role, updated_at`;
    return result[0] || null;
  }

  if (displayName !== undefined) {
    const result = await sql`UPDATE users SET display_name = ${displayName}, updated_at = NOW() WHERE id = ${id} RETURNING id, email, display_name, role, updated_at`;
    return result[0] || null;
  }

  if (role !== undefined) {
    const result = await sql`UPDATE users SET role = ${role}, updated_at = NOW() WHERE id = ${id} RETURNING id, email, display_name, role, updated_at`;
    return result[0] || null;
  }

  return null;
}

export async function deleteUser(id: number) {
  const sql = getDB();
  await sql`DELETE FROM users WHERE id = ${id}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function getProjectById(id: number) {
  const sql = getDB();
  const result = await sql`
    SELECT p.*, u.display_name as owner_name
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.id = ${id}
  `;
  return result[0] || null;
}

export async function getAllProjects() {
  const sql = getDB();
  return sql`
    SELECT p.*, u.display_name as owner_name
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    ORDER BY p.created_at DESC
  `;
}

export async function getProjectsByUserId(userId: number) {
  const sql = getDB();
  return sql`
    SELECT p.*, u.display_name as owner_name
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.owner_id = ${userId}
    ORDER BY p.created_at DESC
  `;
}

export async function createProject(
  title: string,
  pipedriveCode: string,
  ownerId: number,
  status: 'planning' | 'in_progress' | 'waiting' | 'completed' = 'planning',
  description?: string,
  bottleneck?: string,
) {
  const sql = getDB();
  const result = await sql`
    INSERT INTO projects (title, pipedrive_code, owner_id, status, description, bottleneck)
    VALUES (${title}, ${pipedriveCode}, ${ownerId}, ${status}, ${description || null}, ${bottleneck || null})
    RETURNING *
  `;
  return result[0];
}

export async function updateProject(
  id: number,
  title: string,
  status: string,
  description: string | null,
  bottleneck: string | null,
) {
  const sql = getDB();
  const result = await sql`
    UPDATE projects
    SET title = ${title}, status = ${status}, description = ${description}, bottleneck = ${bottleneck}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

export async function deleteProject(id: number) {
  const sql = getDB();
  await sql`DELETE FROM projects WHERE id = ${id}`;
}

export async function getProjectUpdates(projectId: number) {
  const sql = getDB();
  return sql`
    SELECT pu.*, u.display_name as author_name
    FROM project_updates pu
    LEFT JOIN users u ON pu.author_id = u.id
    WHERE pu.project_id = ${projectId}
    ORDER BY pu.created_at DESC
  `;
}

export async function createProjectUpdate(projectId: number, authorId: number, whatDone?: string, whatWaiting?: string, nextSteps?: string) {
  const sql = getDB();
  const result = await sql`
    INSERT INTO project_updates (project_id, author_id, what_done, what_waiting, next_steps)
    VALUES (${projectId}, ${authorId}, ${whatDone || null}, ${whatWaiting || null}, ${nextSteps || null})
    RETURNING *
  `;
  return result[0];
}

export async function deleteProjectUpdate(id: number) {
  const sql = getDB();
  await sql`DELETE FROM project_updates WHERE id = ${id}`;
}

export async function getProjectTasks(projectId: number) {
  const sql = getDB();
  return sql`SELECT * FROM project_tasks WHERE project_id = ${projectId} ORDER BY created_at ASC`;
}

export async function createProjectTask(projectId: number, title: string) {
  const sql = getDB();
  const result = await sql`
    INSERT INTO project_tasks (project_id, title) VALUES (${projectId}, ${title}) RETURNING *
  `;
  return result[0];
}

export async function toggleProjectTask(id: number, isDone: boolean) {
  const sql = getDB();
  const result = await sql`UPDATE project_tasks SET is_done = ${isDone} WHERE id = ${id} RETURNING *`;
  return result[0] || null;
}

export async function deleteProjectTask(id: number) {
  const sql = getDB();
  await sql`DELETE FROM project_tasks WHERE id = ${id}`;
}

export async function savePushSubscription(
  userId: number,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
) {
  const sql = getDB();
  const result = await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (${userId}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
    ON CONFLICT (endpoint) DO UPDATE SET user_id = ${userId}
    RETURNING id, user_id, endpoint, created_at
  `;
  return result[0];
}

export async function getPushSubscriptionsExcept(userId: number) {
  const sql = getDB();
  return sql`
    SELECT id, user_id, endpoint, p256dh, auth FROM push_subscriptions
    WHERE user_id != ${userId}
    ORDER BY created_at DESC
  `;
}

export async function deletePushSubscription(endpoint: string) {
  const sql = getDB();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
}
