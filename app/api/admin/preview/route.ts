// --- filename: app/api/admin/preview/route.ts ---

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { computeScore } from '@/lib/scoring';
import { InteractivityJsonSchema } from '@/types/lesson';
import { GradingJsonSchema, ArrangementSchema } from '@/types/grading';
import { validateGradingMatchesInteractivity } from '@/lib/admin/validation';

export async function POST(request: Request) {
	try {
		const supabase = createRouteClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: profileData } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		const profile = profileData as { role: string | null } | null;

		if (profile?.role !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const body = await request.json();

		// Validate schemas
		const interactivityResult = InteractivityJsonSchema.safeParse(body.interactivity_json);
		const gradingResult = GradingJsonSchema.safeParse(body.grading_json);
		const arrangementResult = ArrangementSchema.safeParse(body.arrangement);

		if (!interactivityResult.success || !gradingResult.success || !arrangementResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid JSON',
					details: {
						interactivity: interactivityResult.success ? null : interactivityResult.error.errors,
						grading: gradingResult.success ? null : gradingResult.error.errors,
						arrangement: arrangementResult.success ? null : arrangementResult.error.errors,
					},
				},
				{ status: 400 }
			);
		}

		// Cross-validate
		const validation = validateGradingMatchesInteractivity(
			interactivityResult.data,
			gradingResult.data
		);

		if (!validation.valid) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					details: validation.errors,
				},
				{ status: 400 }
			);
		}

		// Compute preview score
		const scoringResult = computeScore(gradingResult.data, arrangementResult.data);

		return NextResponse.json({
			valid: true,
			scoring: scoringResult,
		});
	} catch (error) {
		console.error('Admin preview error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
