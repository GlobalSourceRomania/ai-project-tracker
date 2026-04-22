import jwt from 'jsonwebtoken';
import { getUserById } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export function generateToken(userId: number, email: string, role: 'admin' | 'editor' | 'viewer'): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
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

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await getUserById(payload.userId);
  return user || null;
}

export function setAuthCookie(response: Response, token: string) {
  response.headers.set(
    'Set-Cookie',
    `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
  );
  return response;
}

export function clearAuthCookie(response: Response) {
  response.headers.set(
    'Set-Cookie',
    'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  );
  return response;
}
