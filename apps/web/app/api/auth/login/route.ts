import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/crypto';
import { checkLoginRateLimit, recordFailedLoginAttempt, clearLoginAttempts } from '@/lib/login-rate-limit';

import { getGatewayEngineUrl } from '@/lib/gateway-url';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
    }

    const rateLimit = checkLoginRateLimit(username);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many failed login attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    // Authenticate via Go Echo backend
    const gatewayUrl = getGatewayEngineUrl();
    const goRes = await fetch(`${gatewayUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await goRes.json();

    if (!goRes.ok || !data.success) {
      recordFailedLoginAttempt(username);
      return NextResponse.json(
        { success: false, message: data.message || 'Invalid credentials' },
        { status: goRes.status || 401 }
      );
    }

    clearLoginAttempts(username);

    const sessionToken = data.token;

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token: sessionToken,
      user: data.user,
    });

    response.cookies.set({
      name: 'session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, message: (err as Error)?.message || 'Authentication error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  try {
    const session = verifyJwt(sessionCookie.value);
    if (session && session.username && (session.role === 'superadmin' || session.role === 'admin')) {
      return NextResponse.json({ authenticated: true, username: session.username, role: session.role });
    }
  } catch {
    // JWT verification failed
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
