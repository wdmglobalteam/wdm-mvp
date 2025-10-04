// --- filename: app/api/auth/login/route.ts ---
/**
 * POST /api/auth/login
 * Authenticates user and creates session
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/server/authService';
import { SESSION_COOKIE_NAME, SESSION_DURATION } from '@/lib/server/sessionService';
import { checkRateLimit, RATE_LIMITS } from '@/lib/server/rateLimiter';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') ?? undefined;

    const rateLimit = checkRateLimit(`login:${ipAddress}`, RATE_LIMITS.LOGIN);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await authService.login({ email, password, ipAddress, userAgent });

    if (!result.success) {
      const status = result.needsVerification ? 403 : 401;
      return NextResponse.json(
        { error: result.error, needsVerification: result.needsVerification },
        { status }
      );
    }

    // Build a response and attach cookie to it explicitly
    const response = NextResponse.json({ success: true, userId: result.userId });

    if (result.sessionToken) {
      // Set cookie on the response (ensures browser receives Set-Cookie)
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: result.sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_DURATION / 1000,
      });
    }

    return response;
  } catch (err) {
    console.error('Login route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
