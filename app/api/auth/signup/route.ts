// --- filename: app/api/auth/signup/route.ts ---
/**
 * POST /api/auth/signup
 * Creates new user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/server/authService';
import { checkRateLimit, RATE_LIMITS } from '@/lib/server/rateLimiter';
import { validateEmail, validatePassword } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Rate limiting
    const rateLimit = checkRateLimit(`signup:${ipAddress}`, RATE_LIMITS.SIGNUP);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          }
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    // Create account
    const result = await authService.signup({
      email,
      password,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      const status = result.error?.includes('already registered') ? 409 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        needsVerification: result.needsVerification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}