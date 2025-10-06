// --- filename: lib/scoring.ts ---

import type { GradingJson, Arrangement, Validator } from '@/types/grading';

/**
 * Server-authoritative scoring engine
 * Computes mastery percentage from arrangement and grading rules
 */

interface ValidatorResult {
	validatorId: string;
	passed: boolean;
	weight: number;
}

interface ScoringResult {
	mastery_percent: number;
	passed: boolean;
	totalWeight: number;
	validatorResults: ValidatorResult[];
}

/**
 * Evaluate a single validator against the arrangement
 */
function evaluateValidator(validator: Validator, arrangement: Arrangement): boolean {
	const placedItem = arrangement.find((a) => a.placeholderId === validator.target);

	if (!placedItem) {
		return false; // Nothing placed in this slot
	}

	// ✅ Force type widening to include future-safe types
	const type = validator.type as 'equals' | 'contains' | 'regex' | 'order_match' | 'custom';

	switch (type) {
		case 'equals':
			// Exact match: draggableId or payload must be in expected array
			return (
				validator.expected.includes(placedItem.draggableId) ||
				(typeof placedItem.payload === 'string' && validator.expected.includes(placedItem.payload))
			);

		case 'contains':
			// Partial match: payload contains any expected string
			if (!placedItem.payload) return false;
			return validator.expected.some((exp) =>
				placedItem.payload!.toLowerCase().includes(exp.toLowerCase())
			);

		case 'order_match':
			// Placeholder: order correctness logic (future)
			return true;

		case 'regex':
			// Match against regex pattern
			if (!placedItem.payload) return false;
			try {
				const pattern = new RegExp(validator.expected[0]);
				return pattern.test(placedItem.payload);
			} catch {
				return false; // Invalid regex safeguard
			}

		case 'custom':
			// Custom validation hook (future)
			return false;

		default:
			return false;
	}
}

/**
 * Compute canonical score from grading JSON and arrangement
 * This is the ONLY source of truth for mastery percentage
 */
export function computeScore(gradingJson: GradingJson, arrangement: Arrangement): ScoringResult {
	const { validators, scoring_rules } = gradingJson;

	// Evaluate each validator
	const validatorResults: ValidatorResult[] = validators.map((validator) => ({
		validatorId: validator.id,
		passed: evaluateValidator(validator, arrangement),
		weight: validator.weight,
	}));

	// Calculate total weight (for normalization)
	const totalWeight = validators.reduce((sum, v) => sum + v.weight, 0);

	if (totalWeight === 0) {
		throw new Error('Total validator weight cannot be zero');
	}

	// Sum weights of passed validators
	const earnedWeight = validatorResults
		.filter((r) => r.passed)
		.reduce((sum, r) => sum + r.weight, 0);

	// Compute raw score
	let rawScore = earnedWeight;

	// Normalize if required
	if (scoring_rules.normalizeWeights) {
		rawScore = (earnedWeight / totalWeight) * 100;
	} else {
		rawScore = earnedWeight * 100; // Assume weights are fractions of 1.0
	}

	// Round to precision
	const mastery_percent = Number(rawScore.toFixed(scoring_rules.precision));

	// Check if passed
	const passed = mastery_percent >= scoring_rules.pass_threshold;

	return {
		mastery_percent,
		passed,
		totalWeight,
		validatorResults,
	};
}

/**
 * Unit tests for scoring logic
 */
export const scoringTests = {
	testEqualsValidator: () => {
		const grading: GradingJson = {
			validators: [
				{
					id: 'v1',
					type: 'equals',
					target: 'ph1',
					expected: ['<html>'],
					weight: 1.0,
				},
			],
			scoring_rules: { normalizeWeights: true, precision: 2, pass_threshold: 98.0 },
			grading_json_version: '1.0',
		};

		const correctArrangement: Arrangement = [
			{ placeholderId: 'ph1', draggableId: 'd1', payload: '<html>' },
		];

		const incorrectArrangement: Arrangement = [
			{ placeholderId: 'ph1', draggableId: 'd2', payload: '<body>' },
		];

		const correctResult = computeScore(grading, correctArrangement);
		const incorrectResult = computeScore(grading, incorrectArrangement);

		console.assert(correctResult.mastery_percent === 100, 'Correct should be 100%');
		console.assert(correctResult.passed === true, 'Should pass');
		console.assert(incorrectResult.mastery_percent === 0, 'Incorrect should be 0%');
		console.assert(incorrectResult.passed === false, 'Should not pass');
	},

	testWeightNormalization: () => {
		const grading: GradingJson = {
			validators: [
				{ id: 'v1', type: 'equals', target: 'ph1', expected: ['A'], weight: 0.3 },
				{ id: 'v2', type: 'equals', target: 'ph2', expected: ['B'], weight: 0.7 },
			],
			scoring_rules: { normalizeWeights: true, precision: 2, pass_threshold: 98.0 },
			grading_json_version: '1.0',
		};

		const partialArrangement: Arrangement = [
			{ placeholderId: 'ph1', draggableId: 'd1', payload: 'A' },
		];

		const result = computeScore(grading, partialArrangement);

		// Only v1 passed (0.3 weight), total weight 1.0
		// Score = (0.3 / 1.0) * 100 = 30%
		console.assert(result.mastery_percent === 30, 'Should be 30%');
		console.assert(result.passed === false, 'Should not pass 98% threshold');
	},
};
