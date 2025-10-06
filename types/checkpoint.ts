// --- filename: types/checkpoint.ts

import { z } from 'zod';

/**
 * Checkpoint question schema (MCQ with variants)
 */
export const CheckpointQuestionSchema = z.object({
	id: z.string(),
	type: z.literal('mcq'),
	stem: z.string(),
	options: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		})
	),
	answer: z.string(), // option id
	timerSeconds: z.number().default(20),
	variations: z
		.array(
			z.object({
				stem: z.string(),
				options: z.array(
					z.object({
						id: z.string(),
						text: z.string(),
					})
				),
				answer: z.string(),
			})
		)
		.default([]),
});

export const CheckpointPoolSchema = z.object({
	questions: z.array(CheckpointQuestionSchema),
});

export type CheckpointQuestion = z.infer<typeof CheckpointQuestionSchema>;
export type CheckpointPool = z.infer<typeof CheckpointPoolSchema>;

/**
 * User checkpoint instance
 */
export interface UserCheckpointInstance {
	id: string;
	user_id: string;
	module_id: string;
	lesson_id: string | null;
	questions: CheckpointQuestion[];
	current_index: number;
	answers: Array<{
		questionId: string;
		selectedOption: string;
		timestamp: string;
	}>;
	status: 'active' | 'completed' | 'aborted';
	created_at: string;
	expires_at: string;
	time_limit_seconds: number;
}
