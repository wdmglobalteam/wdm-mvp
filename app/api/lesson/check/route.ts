// --- filename: app/api/lesson/check/route.ts ---

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { computeScore } from '@/lib/scoring';
import { processUnlocksAfterLessonPass } from '@/lib/unlock';
import { ArrangementSchema, GradingJsonSchema } from '@/types/grading';
import { z } from 'zod'; // FIX: Was 'od'

/**
 * POST /api/lesson/check
 * Server-authoritative lesson scoring and unlocking
 */
export async function POST(request: Request) {
	try {
		const supabase = createRouteClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const RequestSchema = z.object({
			lessonId: z.string().uuid(),
			arrangement: ArrangementSchema,
			attemptMetadata: z.record(z.unknown()).optional(),
		});

		const parsed = RequestSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: 'Invalid request', details: parsed.error.errors },
				{ status: 400 }
			);
		}

		const { lessonId, arrangement, attemptMetadata } = parsed.data;

		// Fetch lesson with explicit type
		const { data: lessonData, error: lessonError } = await supabase
			.from('lessons')
			.select('id, title, grading_json, required_mastery_percent, module_id')
			.eq('id', lessonId)
			.eq('published', true)
			.single();

		if (lessonError || !lessonData) {
			return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
		}

		// Cast to proper type
		const lesson = lessonData as {
			id: string;
			title: string;
			grading_json: unknown;
			required_mastery_percent: number | null;
			module_id: string | null;
		};

		// Validate grading JSON
		const gradingResult = GradingJsonSchema.safeParse(lesson.grading_json);
		if (!gradingResult.success) {
			console.error('Invalid grading JSON:', gradingResult.error);
			return NextResponse.json({ error: 'Invalid lesson grading configuration' }, { status: 500 });
		}

		const gradingJson = gradingResult.data;

		// Compute canonical score
		const scoringResult = computeScore(gradingJson, arrangement);

		// Get current progress record
		const { data: progressData } = await supabase
			.from('user_progress')
			.select('attempts')
			.eq('user_id', user.id)
			.eq('target_type', 'lesson')
			.eq('target_id', lessonId)
			.maybeSingle();

		// Cast progress data
		const currentProgress = progressData as { attempts: number | null } | null;
		const attempts = (currentProgress?.attempts || 0) + 1;

		// ✅ FIX: Ensure metadata is JSON-serializable (for Supabase Json type)
		const safeMetadata = JSON.parse(
			JSON.stringify({
				arrangement,
				grading_json_version: gradingJson.grading_json_version,
				computed_score: scoringResult.mastery_percent,
				validator_results: scoringResult.validatorResults,
				...attemptMetadata,
			})
		);

		// Upsert user progress
		const { error: progressError } = await supabase.from('user_progress').upsert(
			{
				user_id: user.id,
				target_type: 'lesson',
				target_id: lessonId,
				mastery_percent: scoringResult.mastery_percent,
				status: scoringResult.passed ? 'completed' : 'in_progress',
				attempts,
				last_attempt_at: new Date().toISOString(),
				metadata: safeMetadata, // ✅ fixed here
			},
			{
				onConflict: 'user_id,target_type,target_id',
			}
		);

		if (progressError) {
			console.error('Progress upsert error:', progressError);
			return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
		}

		// If passed, process unlocking cascade
		let unlockResult;
		if (scoringResult.passed) {
			unlockResult = await processUnlocksAfterLessonPass(user.id, lessonId);
		}

		return NextResponse.json({
			mastery_percent: scoringResult.mastery_percent,
			passed: scoringResult.passed,
			attempts,
			nextTarget: unlockResult?.nextTarget,
			unlocks: unlockResult?.unlocks || {},
			validatorResults: scoringResult.validatorResults,
		});
	} catch (error) {
		console.error('Lesson check error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
