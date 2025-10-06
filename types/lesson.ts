// --- filename: types/lesson.ts

import { z } from 'zod';

/**
 * Interactivity JSON schema for drag-drop lessons
 */
export const PlaceholderSchema = z.object({
	id: z.string(),
	slotIndex: z.number(),
	indentLevel: z.number().default(0),
	acceptTypes: z.array(z.string()).optional(),
});

export const DraggableSchema = z.object({
	id: z.string(),
	label: z.string(),
	payload: z.string(),
	meta: z
		.object({
			languageSnippet: z.string().optional(),
			formattedHtml: z.string().optional(),
		})
		.optional(),
});

export const InteractivityJsonSchema = z.object({
	type: z.literal('drag_drop'),
	title: z.string(),
	explanation: z.string(),
	placeholders: z.array(PlaceholderSchema),
	draggables: z.array(DraggableSchema),
	uiHints: z.object({
		maxColumns: z.number().default(3),
		keyboardSupport: z.boolean().default(true),
		placeholderSize: z.string().default('medium'),
	}),
	tips: z.array(z.string()).default([]),
	meta: z
		.object({
			estimated_duration_seconds: z.number().optional(),
			difficulty: z.string().optional(),
		})
		.optional(),
});

// --- filename: types/lesson.ts ---
export interface LessonRendererProps {
	lessonId: string;
	currentModuleId: string;
	interactivityJson: InteractivityJson;
	onCheckpointComplete?: (lessonId: string) => void; // optional
}

export interface CheckpointModalProps {
	moduleId: string;
	onClose: () => void;
	lessonId?: string; // optional if needed
}

export type InteractivityJson = z.infer<typeof InteractivityJsonSchema>;
export type Placeholder = z.infer<typeof PlaceholderSchema>;
export type Draggable = z.infer<typeof DraggableSchema>;
