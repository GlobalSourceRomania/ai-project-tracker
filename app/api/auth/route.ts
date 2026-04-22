import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, verifyPassword, getCurrentUser } from '@/lib/db';
import { generateToken, setAuthCookie, clearAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, displayName } = body;

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
      }

      const user = await getUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const passwordMatch = await verifyPassword(password, user.password_hash);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const token = generateToken(user.id, user.email, user.role);
      const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, displayName: user.display_name } });
      return setAuthCookie(response, token);
    }

    if (action === 'logout') {
      const response = NextResponse.json({ ok: true });
      return clearAuthCookie(response);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
