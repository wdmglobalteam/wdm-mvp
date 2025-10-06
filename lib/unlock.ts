// --- filename: lib/unlock.ts ---

import { createServerClient } from '@/lib/supabase/server';

interface UnlockResult {
	nextTarget?: {
		type: 'lesson' | 'module' | 'realm' | 'pillar';
		id: string;
	};
	unlocks: {
		lessonId?: string;
		moduleId?: string;
		realmId?: string;
		pillarId?: string;
	};
}

export async function processUnlocksAfterLessonPass(
	userId: string,
	lessonId: string
): Promise<UnlockResult> {
	const supabase = createServerClient();

	const result: UnlockResult = {
		unlocks: {},
	};

	// Step 1: Get current lesson details
	const { data: lessonData } = await supabase
		.from('lessons')
		.select('id, module_id, order_index, module:modules(id, realm_id, order_index)')
		.eq('id', lessonId)
		.single();

	if (!lessonData) {
		throw new Error('Lesson not found');
	}

	// Cast to proper type
	const lesson = lessonData as {
		id: string;
		module_id: string | null;
		order_index: number;
		module: {
			id: string;
			realm_id: string | null;
			order_index: number;
		} | null;
	};

	const moduleId = lesson.module_id;
	if (!moduleId) return result;

	const currentLessonOrder = lesson.order_index;

	// Step 2: Find next lesson in same module
	const { data: nextLessonData } = await supabase
		.from('lessons')
		.select('id')
		.eq('module_id', moduleId)
		.eq('published', true)
		.gt('order_index', currentLessonOrder)
		.order('order_index', { ascending: true })
		.limit(1)
		.maybeSingle();

	const nextLesson = nextLessonData as { id: string } | null;

	if (nextLesson) {
		// Unlock next lesson
		await supabase.from('user_progress').upsert(
			{
				user_id: userId,
				target_type: 'lesson',
				target_id: nextLesson.id,
				status: 'in_progress',
				mastery_percent: 0,
				attempts: 0,
			},
			{
				onConflict: 'user_id,target_type,target_id',
			}
		);

		result.nextTarget = { type: 'lesson', id: nextLesson.id };
		result.unlocks.lessonId = nextLesson.id;
		return result;
	}

	// Step 3: No next lesson → mark module complete
	await supabase.from('user_progress').upsert(
		{
			user_id: userId,
			target_type: 'module',
			target_id: moduleId,
			status: 'completed',
			mastery_percent: 100,
			attempts: 1,
			last_attempt_at: new Date().toISOString(),
		},
		{
			onConflict: 'user_id,target_type,target_id',
		}
	);

	// Step 4: Find next module in same realm
	const realmId = lesson.module?.realm_id;
	if (!realmId) return result;

	const { data: nextModuleData } = await supabase
		.from('modules')
		.select('id')
		.eq('realm_id', realmId)
		.eq('published', true)
		.gt('order_index', lesson.module?.order_index || 0)
		.order('order_index', { ascending: true })
		.limit(1)
		.maybeSingle();

	const nextModule = nextModuleData as { id: string } | null;

	if (nextModule) {
		// Unlock next module
		await supabase.from('user_progress').upsert(
			{
				user_id: userId,
				target_type: 'module',
				target_id: nextModule.id,
				status: 'in_progress',
				mastery_percent: 0,
				attempts: 0,
			},
			{
				onConflict: 'user_id,target_type,target_id',
			}
		);

		// Find first lesson in next module
		const { data: firstLessonData } = await supabase
			.from('lessons')
			.select('id')
			.eq('module_id', nextModule.id)
			.eq('published', true)
			.order('order_index', { ascending: true })
			.limit(1)
			.single();

		const firstLesson = firstLessonData as { id: string } | null;

		if (firstLesson) {
			await supabase.from('user_progress').upsert(
				{
					user_id: userId,
					target_type: 'lesson',
					target_id: firstLesson.id,
					status: 'in_progress',
					mastery_percent: 0,
					attempts: 0,
				},
				{
					onConflict: 'user_id,target_type,target_id',
				}
			);

			result.nextTarget = { type: 'lesson', id: firstLesson.id };
			result.unlocks.moduleId = nextModule.id;
			result.unlocks.lessonId = firstLesson.id;
			return result;
		}
	}

	return result;
}
