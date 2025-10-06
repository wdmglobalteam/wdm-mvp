// --- filename: types/grading.ts ---
// Add this export that was missing

import { z } from 'zod';

// Export Placeholder type for ValidatorsEditor
export interface Placeholder {
	id: string;
	slotIndex: number;
	indentLevel: number;
}

export interface Validator {
	id: string;
	type: 'equals' | 'contains' | 'regex';
	target: string;
	expected: string[];
	weight: number;
}

export interface ScoringRules {
	normalizeWeights: boolean;
	precision: number;
	pass_threshold: number;
}

export interface GradingJson {
	validators: Validator[];
	scoring_rules: ScoringRules;
	grading_json_version: string;
}

export interface ArrangementItem {
	placeholderId: string;
	draggableId: string;
	payload: string;
}

export type Arrangement = ArrangementItem[];

// Zod schemas for validation
export const ValidatorSchema = z.object({
	id: z.string(),
	type: z.enum(['equals', 'contains', 'regex']),
	target: z.string(),
	expected: z.array(z.string()),
	weight: z.number().min(0).max(1),
});

export const ScoringRulesSchema = z.object({
	normalizeWeights: z.boolean(),
	precision: z.number().int().min(0).max(10),
	pass_threshold: z.number().min(0).max(100),
});

export const GradingJsonSchema = z.object({
	validators: z.array(ValidatorSchema),
	scoring_rules: ScoringRulesSchema,
	grading_json_version: z.string(),
});

export const ArrangementItemSchema = z.object({
	placeholderId: z.string(),
	draggableId: z.string(),
	payload: z.string(),
});

export const ArrangementSchema = z.array(ArrangementItemSchema);
