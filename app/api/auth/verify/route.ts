// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/server/authService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Verification token is required' }, { status: 400 });
    }

    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    const result = await authService.verifyEmail({
      token,
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Verification failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify route error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
