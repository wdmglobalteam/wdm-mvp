// --- filename: app/api/enroll/route.ts ---

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Types for convenience
 */
type EnrollmentRow = Database['public']['Tables']['enrollments']['Row'];
type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert'];

/**
 * POST /api/enroll
 * Creates an enrollment record for the current user.
 * Assumes payment is already handled and uses server-side session cookies.
 */
export async function POST(request: Request) {
	try {
		// Use the existing wrapper but cast to a typed SupabaseClient<Database>.
		// This avoids changing lib/supabase/server.ts while giving us typed table operations.
		const supabase = createRouteClient() as unknown as SupabaseClient<Database>;

		// Get auth user from server-side cookie-backed session
		const { data: authData, error: authError } = await supabase.auth.getUser();

		// debug log — remove or lower verbosity in production
		console.log('ENROLL ROUTE AUTH', { authData, authError });

		const user = authData?.user;

		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Parse and validate request body
		const body = await request.json().catch(() => ({}));
		const { pathId } = (body ?? {}) as { pathId?: unknown };

		if (!pathId || typeof pathId !== 'string') {
			return NextResponse.json({ error: 'pathId is required' }, { status: 400 });
		}

		// Check idempotency: don't create duplicate enrollments
		const { data: existingEnrollmentRaw, error: fetchError } = await supabase
			.from('enrollments')
			.select('id')
			.eq('user_id', user.id)
			.eq('path_id', pathId)
			.maybeSingle();

		if (fetchError) {
			console.error('Error checking existing enrollment:', fetchError);
			return NextResponse.json({ error: 'Failed to check enrollment' }, { status: 500 });
		}

		const existingEnrollment = existingEnrollmentRaw as EnrollmentRow | null;

		if (existingEnrollment) {
			return NextResponse.json({
				success: true,
				enrollmentId: existingEnrollment.id,
				message: 'Already enrolled',
			});
		}

		// Build typed insert object
		const enrollmentInsert: EnrollmentInsert = {
			user_id: user.id,
			path_id: pathId,
			status: 'active',
			progress_percent: 0,
			started_at: new Date().toISOString(),
		};

		// Insert and return the created row
		const { data: newEnrollmentRaw, error: enrollError } = await supabase
			.from('enrollments')
			.insert(enrollmentInsert)
			.select()
			.single();

		if (enrollError) {
			console.error('Enrollment insert error:', enrollError);
			return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
		}

		const newEnrollment = newEnrollmentRaw as EnrollmentRow | null;
		if (!newEnrollment) {
			console.error('No enrollment returned after insert');
			return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			enrollmentId: newEnrollment.id,
		});
	} catch (error) {
		console.error('Unexpected error in enrollment:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
