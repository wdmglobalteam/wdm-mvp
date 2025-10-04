// --- filename: middleware.ts ---
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that do not require authentication.
 * Users can access these paths whether logged in or not.
 */
const PUBLIC_PATHS = [
	'/',
	'/auth',
	'/forgot-password',
	'/reset-password',
	'/auth/verify',
	'/paywall', // Payment landing page
	'/paywall/success', // CRITICAL: Payment success page must be public
];

/**
 * Middleware for session-based authentication.
 *
 * FLOW:
 * 1. Check if path is public or API route → allow
 * 2. Check if wdm_session cookie exists → allow
 * 3. Otherwise → redirect to /auth
 *
 * CRITICAL FIXES:
 * - Added /paywall/success to public paths (users land here from Paystack redirect)
 * - API paywall routes remain public for webhook/verify access
 * - Only checks cookie existence (not validity) for performance
 */
export function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;

	// ===== STEP 1: Allow public paths =====
	// These paths are accessible without authentication
	if (PUBLIC_PATHS.some((publicPath) => path === publicPath || path.startsWith(publicPath))) {
		return NextResponse.next();
	}

	// ===== STEP 2: Allow all API routes =====
	// API routes handle their own auth logic
	if (path.startsWith('/api/')) {
		return NextResponse.next();
	}

	// ===== STEP 3: Allow static assets =====
	// Already handled by matcher config, but explicit check for safety
	if (
		path.startsWith('/_next/') ||
		path.startsWith('/static/') ||
		path.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
	) {
		return NextResponse.next();
	}

	// ===== STEP 4: Check for session cookie =====
	// If cookie exists, allow access (client-side will validate full session)
	const sessionCookie = req.cookies.get('wdm_session')?.value;

	if (!sessionCookie) {
		// No session → redirect to auth with return URL
		const returnUrl = encodeURIComponent(path + req.nextUrl.search);
		return NextResponse.redirect(new URL(`/auth?returnUrl=${returnUrl}`, req.url));
	}

	// ===== STEP 5: Session exists → allow =====
	// Client-side useAuth hook will fetch and validate full session
	return NextResponse.next();
}

/**
 * Matcher configuration
 * - Excludes Next.js internals (_next/static, _next/image)
 * - Excludes static assets (images, fonts, etc.)
 * - Includes all other routes for middleware processing
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico
		 * - public files with extensions (svg, png, jpg, etc.)
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
	],
};
