// --- filename: app/api/auth/logout/route.ts ---
/**
 * POST /api/auth/logout
 * Revokes session and clears cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionService, SESSION_COOKIE_NAME } from '@/lib/server/sessionService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
    if (token) {
      try {
        await sessionService.revokeSession(token);
      } catch (err) {
        console.error('Error revoking session during logout:', err);
        // proceed to clear cookie regardless
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (err) {
    console.error('Logout route error:', err);
    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}
