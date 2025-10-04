// --- filename: app/api/auth/forgot-password/route.ts ---
/**
 * POST /api/auth/forgot-password
 * Sends password reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/server/authService';
import { checkRateLimit, RATE_LIMITS } from '@/lib/server/rateLimiter';
import { validateEmail } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Rate limiting
    const rateLimit = checkRateLimit(`reset:${ipAddress}`, RATE_LIMITS.PASSWORD_RESET);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    await authService.requestPasswordReset({
      email,
      ipAddress,
      userAgent,
    });

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}