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
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT projects_pipedrive_code_unique UNIQUE (pipedrive_code)
    )
  `;

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
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (displayName !== undefined) {
    updates.push(`display_name = $${paramCount}`);
    values.push(displayName);
    paramCount++;
  }
  if (role !== undefined) {
    updates.push(`role = $${paramCount}`);
    values.push(role);
    paramCount++;
  }

  if (updates.length === 0) return null;

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, display_name, role, updated_at`;
  const result = await sql(query, values);
  return result[0] || null;
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

export async function createProject(title: string, pipedriveCode: string, ownerId: number, status: 'planning' | 'in_progress' | 'waiting' | 'completed' = 'planning') {
  const sql = getDB();
  const result = await sql`
    INSERT INTO projects (title, pipedrive_code, owner_id, status)
    VALUES (${title}, ${pipedriveCode}, ${ownerId}, ${status})
    RETURNING *
  `;
  return result[0];
}

export async function updateProject(id: number, title?: string, status?: 'planning' | 'in_progress' | 'waiting' | 'completed') {
  const sql = getDB();
  const updates: any[] = [];

  if (title !== undefined) updates.push({ field: 'title', value: title });
  if (status !== undefined) updates.push({ field: 'status', value: status });

  if (updates.length === 0) return null;

  let query = 'UPDATE projects SET ';
  const values = [];
  const setParts = [];

  updates.forEach((u, i) => {
    setParts.push(`${u.field} = $${i + 1}`);
    values.push(u.value);
  });

  setParts.push(`updated_at = NOW()`);
  values.push(id);

  query += setParts.join(', ') + ` WHERE id = $${values.length} RETURNING *`;
  const result = await sql(query, values);
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
