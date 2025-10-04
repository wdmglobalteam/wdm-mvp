// --- filename: middleware.ts ---
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/auth',
  '/forgot-password',
  '/reset-password',
  '/auth/verify',
];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public paths and API auth endpoints
  if (
    PUBLIC_PATHS.some(p => path.startsWith(p)) ||
    path.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = req.cookies.get('wdm_session')?.value;

  if (!sessionCookie) {
    // ❌ Only redirect if NO cookie
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // ✅ Cookie exists → allow
  // Client-side useAuth will fetch session & handle full auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
