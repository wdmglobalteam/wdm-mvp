// --- filename: lib/checkpointScheduler.ts ---

import { createServerClient } from '@/lib/supabase/server';
import type { CheckpointQuestion } from '@/types/checkpoint';
import { createHash } from 'crypto';

interface CheckpointDecision {
	shouldSpawn: boolean;
	probability: number;
	reason: string;
}

function deterministicRandom(seed: string): number {
	const hash = createHash('sha256').update(seed).digest('hex');
	const num = parseInt(hash.substring(0, 8), 16);
	return num / 0xffffffff;
}

export async function decideSpawnCheckpoint(
	userId: string,
	moduleId: string,
	_lessonId: string // Prefixed with _ to indicate intentionally unused
): Promise<CheckpointDecision> {
	const supabase = createServerClient();

	let probability = 0.12;
	let reason = 'Base probability';

	// Get user's recent lesson attempts
	const { data: recentProgressData } = await supabase
		.from('user_progress')
		.select('mastery_percent, target_type')
		.eq('user_id', userId)
		.eq('target_type', 'lesson')
		.order('last_attempt_at', { ascending: false })
		.limit(5);

	// Cast to proper type
	const recentProgress = recentProgressData as Array<{
		mastery_percent: number | null;
		target_type: string | null;
	}> | null;

	if (recentProgress) {
		const failureRate =
			recentProgress.filter((p) => (p.mastery_percent ?? 0) < 98).length / recentProgress.length;
		if (failureRate > 0.4) {
			probability += 0.15;
			reason = 'High failure rate detected';
		}
	}

	// Check if user had a recent checkpoint
	const { data: recentCheckpointData } = await supabase
		.from('user_checkpoints')
		.select('created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	const recentCheckpoint = recentCheckpointData as { created_at: string } | null;

	if (recentCheckpoint) {
		const timeSinceLastCheckpoint = Date.now() - new Date(recentCheckpoint.created_at).getTime();
		const hoursSince = timeSinceLastCheckpoint / (1000 * 60 * 60);

		if (hoursSince < 2) {
			probability -= 0.08;
			reason = 'Recent checkpoint cooldown';
		}
	}

	// Deterministic seeding
	const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60));
	const seed = `${userId}-${moduleId}-${hourBucket}`;
	const random = deterministicRandom(seed);

	const shouldSpawn = random < probability;

	return {
		shouldSpawn,
		probability,
		reason,
	};
}

export async function selectCheckpointQuestions(
	lessonId: string,
	count: number = 3
): Promise<CheckpointQuestion[]> {
	const supabase = createServerClient();

	// Get question pool for this lesson
	const { data: checkpointData } = await supabase
		.from('lesson_checkpoints')
		.select('question_pool')
		.eq('lesson_id', lessonId)
		.eq('published', true)
		.maybeSingle();

	const checkpoint = checkpointData as { question_pool: unknown } | null;

	if (!checkpoint || !checkpoint.question_pool) {
		return [];
	}

	const pool = checkpoint.question_pool as { questions: CheckpointQuestion[] };
	const questions = pool.questions || [];

	// Select random questions
	const selected: CheckpointQuestion[] = [];
	const availableIndices = [...Array(questions.length).keys()];

	for (let i = 0; i < Math.min(count, questions.length); i++) {
		const randomIndex = Math.floor(Math.random() * availableIndices.length);
		const questionIndex = availableIndices[randomIndex];
		availableIndices.splice(randomIndex, 1);

		const question = questions[questionIndex];

		// Randomly pick a variant if available
		if (question.variations && question.variations.length > 0) {
			const useVariant = Math.random() < 0.5;
			if (useVariant) {
				const variantIndex = Math.floor(Math.random() * question.variations.length);
				const variant = question.variations[variantIndex];
				selected.push({
					...question,
					stem: variant.stem,
					options: variant.options,
					answer: variant.answer,
				});
				continue;
			}
		}

		selected.push(question);
	}

	return selected;
}
