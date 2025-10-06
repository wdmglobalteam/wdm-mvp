// --- filename: app/api/checkpoint/spawn/route.ts ---

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { decideSpawnCheckpoint, selectCheckpointQuestions } from '@/lib/checkpointScheduler';
import { z } from 'zod';

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
			moduleId: z.string().uuid(),
			lessonId: z.string().uuid(),
		});

		const parsed = RequestSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
		}

		const { moduleId, lessonId } = parsed.data;

		// Decide whether to spawn checkpoint
		const decision = await decideSpawnCheckpoint(user.id, moduleId, lessonId);

		if (!decision.shouldSpawn) {
			return NextResponse.json({
				spawned: false,
				probability: decision.probability,
				reason: decision.reason,
			});
		}

		// Select questions from pool
		const questions = await selectCheckpointQuestions(lessonId, 4);

		if (questions.length === 0) {
			return NextResponse.json({
				spawned: false,
				reason: 'No checkpoint questions available',
			});
		}

		// Calculate total time
		const totalSeconds = questions.reduce((sum, q) => sum + q.timerSeconds, 0);
		const bufferSeconds = 30;
		const expiresAt = new Date(Date.now() + (totalSeconds + bufferSeconds) * 1000);

		// Create checkpoint instance
		const { data: checkpoint, error: createError } = await supabase
			.from('user_checkpoints')
			.insert({
				user_id: user.id,
				module_id: moduleId,
				lesson_id: lessonId,
				questions,
				current_index: 0,
				answers: [],
				status: 'active',
				expires_at: expiresAt.toISOString(),
				time_limit_seconds: totalSeconds + bufferSeconds,
			})
			.select()
			.single();

		if (createError) {
			console.error('Checkpoint creation error:', createError);
			return NextResponse.json({ error: 'Failed to create checkpoint' }, { status: 500 });
		}

		return NextResponse.json({
			spawned: true,
			checkpoint,
		});
	} catch (error) {
		console.error('Checkpoint spawn error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
