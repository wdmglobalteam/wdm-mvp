// --- filename: app/api/checkpoint/complete/route.ts ---

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
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
			checkpointId: z.string().uuid(),
			answers: z.array(
				z.object({
					questionId: z.string(),
					selectedOption: z.string(),
					timestamp: z.string(),
				})
			),
		});

		const parsed = RequestSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
		}

		const { checkpointId, answers } = parsed.data;

		// Fetch checkpoint instance with explicit typing
		const { data: checkpointData, error: fetchError } = await supabase
			.from('user_checkpoints')
			.select('*')
			.eq('id', checkpointId)
			.eq('user_id', user.id)
			.single();

		if (fetchError || !checkpointData) {
			return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 });
		}

		// Cast to proper type
		const checkpoint = checkpointData as {
			id: string;
			user_id: string;
			expires_at: string;
			questions: unknown;
			status: string | null;
		};

		// Check if expired
		if (new Date(checkpoint.expires_at) < new Date()) {
			await supabase.from('user_checkpoints').update({ status: 'aborted' }).eq('id', checkpointId);
			return NextResponse.json({ error: 'Checkpoint expired' }, { status: 410 });
		}

		// Score answers
		const questions = checkpoint.questions as Array<{
			id: string;
			answer: string;
			stem: string;
			options: Array<{ id: string; text: string }>;
		}>;

		const results = questions.map((question) => {
			const userAnswer = answers.find((a) => a.questionId === question.id);
			const correct = userAnswer?.selectedOption === question.answer;

			return {
				questionId: question.id,
				correct,
				correctAnswer: question.answer,
				userAnswer: userAnswer?.selectedOption || null,
				questionStem: question.stem,
				options: question.options,
			};
		});

		const correctCount = results.filter((r) => r.correct).length;
		const mastery_percent = (correctCount / questions.length) * 100;
		const passed = mastery_percent >= 98;

		// Update checkpoint status
		await supabase
			.from('user_checkpoints')
			.update({
				status: 'completed',
				answers,
			})
			.eq('id', checkpointId);

		// Record checkpoint progress
		await supabase.from('user_progress').upsert(
			{
				user_id: user.id,
				target_type: 'lesson_checkpoint',
				target_id: checkpointId,
				mastery_percent,
				status: passed ? 'completed' : 'failed',
				attempts: 1,
				last_attempt_at: new Date().toISOString(),
				metadata: {
					checkpoint_id: checkpointId,
					results,
				},
			},
			{
				onConflict: 'user_id,target_type,target_id',
			}
		);

		return NextResponse.json({
			mastery_percent,
			passed,
			results,
		});
	} catch (error) {
		console.error('Checkpoint completion error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
