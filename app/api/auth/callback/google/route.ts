// --- filename: app/api/auth/callback/google/route.ts ---
/**
 * GET /api/auth/callback/google
 * Google OAuth callback handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/server/authService';
import { sessionService } from '@/lib/server/sessionService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/auth?error=No authorization code', request.url)
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Handle OAuth callback
    const result = await authService.handleGoogleCallback({
      code,
      ipAddress,
      userAgent,
    });

    if (!result.success || !result.sessionToken) {
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(result.error || 'OAuth failed')}`, request.url)
      );
    }

    // Set session cookie
    sessionService.setSessionCookie(result.sessionToken);

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/auth?error=Internal server error', request.url)
    );
  }
}