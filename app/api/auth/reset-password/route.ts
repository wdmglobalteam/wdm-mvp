// --- filename: app/api/auth/reset-password/route.ts ---
/**
 * POST /api/auth/reset-password
 * Completes password reset
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/server/authService';
import { validatePassword } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    const result = await authService.resetPassword({
      token,
      newPassword: password,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      const status = result.error?.includes('expired') ? 410 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}