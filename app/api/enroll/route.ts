// --- filename: app/api/enroll/route.ts ---

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sessionService } from '@/lib/server/sessionService';
import type { Database } from '@/types/supabase';

// type EnrollmentRow = Database['public']['Tables']['enrollments']['Row'];
type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert'];

/**
 * POST /api/enroll
 * Creates an enrollment record for the current user.
 * Uses custom session system (sessionService) for authentication.
 */
export async function POST(request: Request) {
	try {
		// Get current user from custom session system
		const currentUser = await sessionService.getCurrentUser();

		if (!currentUser?.userId) {
			return NextResponse.json({ error: 'Unauthorized - Please sign in to enroll' }, { status: 401 });
		}

		const userId = currentUser.userId;

		// Parse request body
		const body = await request.json().catch(() => ({}));
		const { pathId } = (body ?? {}) as { pathId?: unknown };

		if (!pathId || typeof pathId !== 'string') {
			return NextResponse.json({ error: 'pathId is required' }, { status: 400 });
		}

		// Use admin client for database operations
		const supabase = getSupabaseAdmin();

		// Check for existing enrollment (idempotency)
		const { data: existingEnrollment, error: fetchError } = await supabase
			.from('enrollments')
			.select('id')
			.eq('user_id', userId)
			.eq('path_id', pathId)
			.maybeSingle();

		if (fetchError) {
			console.error('Error checking existing enrollment:', fetchError);
			return NextResponse.json({ error: 'Failed to check enrollment' }, { status: 500 });
		}

		if (existingEnrollment) {
			return NextResponse.json({
				success: true,
				enrollmentId: existingEnrollment.id,
				message: 'Already enrolled',
			});
		}

		// Create new enrollment
		const enrollmentInsert: EnrollmentInsert = {
			user_id: userId,
			path_id: pathId,
			status: 'active',
			progress_percent: 0,
			started_at: new Date().toISOString(),
		};

		const { data: newEnrollment, error: enrollError } = await supabase
			.from('enrollments')
			.insert(enrollmentInsert)
			.select()
			.single();

		if (enrollError || !newEnrollment) {
			console.error('Enrollment insert error:', enrollError);
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
