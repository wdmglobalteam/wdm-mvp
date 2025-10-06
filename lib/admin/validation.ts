// --- filename: lib/admin/validation.ts ---

import { z } from 'zod';
import { InteractivityJsonSchema } from '@/types/lesson';
import { GradingJsonSchema } from '@/types/grading';
import { CheckpointPoolSchema } from '@/types/checkpoint';

/**
 * Admin-specific validation schemas
 */

export const LessonCreateSchema = z.object({
	module_id: z.string().uuid(),
	title: z.string().min(1).max(200),
	description: z.string().optional(),
	order_index: z.number().int().min(0),
	interactivity_json: InteractivityJsonSchema,
	grading_json: GradingJsonSchema,
	required_mastery_percent: z.number().min(0).max(100).default(98),
	published: z.boolean().default(false),
});

export const LessonUpdateSchema = LessonCreateSchema.partial().extend({
	id: z.string().uuid(),
});

export const CheckpointCreateSchema = z.object({
	lesson_id: z.string().uuid().optional(),
	module_id: z.string().uuid().optional(),
	question_pool: CheckpointPoolSchema,
	published: z.boolean().default(false),
});

export const CheckpointUpdateSchema = CheckpointCreateSchema.partial().extend({
	id: z.string().uuid(),
});

/**
 * Validate that grading validators match interactivity placeholders
 */
export function validateGradingMatchesInteractivity(
	interactivityJson: z.infer<typeof InteractivityJsonSchema>,
	gradingJson: z.infer<typeof GradingJsonSchema>
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	const placeholderIds = new Set(interactivityJson.placeholders.map((p) => p.id));

	// Check that all validator targets exist as placeholders
	for (const validator of gradingJson.validators) {
		if (!placeholderIds.has(validator.target)) {
			errors.push(`Validator ${validator.id} targets non-existent placeholder: ${validator.target}`);
		}
	}

	// Check that weights sum to ~1.0 (if normalize is false) or are reasonable
	const totalWeight = gradingJson.validators.reduce((sum, v) => sum + v.weight, 0);
	if (totalWeight === 0) {
		errors.push('Total validator weight cannot be zero');
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
