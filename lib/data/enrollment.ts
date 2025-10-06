// --- filename: lib/data/enrollment.ts ---

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { PathWithHierarchy, Enrollment } from '@/types/supabase';
import type { Database } from '@/types/supabase';

// Type helpers for better inference
type LessonRow = Database['public']['Tables']['lessons']['Row'];
type UserProgressRow = Database['public']['Tables']['user_progress']['Row'];

/**
 * Fetches the complete learning hierarchy for a given path
 * This single query gets everything needed for the dashboard
 * No client-side fetching = no flash
 */
export async function getPathHierarchy(
	pathSlug: string = 'frontend-development'
): Promise<PathWithHierarchy | null> {
	const supabase = getSupabaseAdmin();

	const { data, error } = await supabase
		.from('paths')
		.select(
			`
      id,
      name,
      slug,
      description,
      published,
      order_index,
      created_at,
      pillars!inner (
        id,
        name,
        description,
        order_index,
        published,
        realms!inner (
          id,
          name,
          description,
          order_index,
          published,
          modules!inner (
            id,
            name,
            description,
            order_index,
            published,
            lessons!inner (
              id,
              title,
              description,
              order_index,
              published,
              interactivity_json
            )
          )
        )
      )
    `
		)
		.eq('slug', pathSlug)
		.eq('published', true)
		.eq('pillars.published', true)
		.eq('pillars.realms.published', true)
		.eq('pillars.realms.modules.published', true)
		.eq('pillars.realms.modules.lessons.published', true)
		.order('order_index', { foreignTable: 'pillars' })
		.order('order_index', { foreignTable: 'pillars.realms' })
		.order('order_index', { foreignTable: 'pillars.realms.modules' })
		.order('order_index', { foreignTable: 'pillars.realms.modules.lessons' })
		.single();

	if (error) {
		console.error('Error fetching path hierarchy:', error);
		return null;
	}

	return data as PathWithHierarchy;
}

/**
 * Gets the active enrollment for the current user
 * Returns null if user is not enrolled
 */
export async function getUserEnrollment(userId: string): Promise<Enrollment | null> {
	const supabase = getSupabaseAdmin();

	const { data, error } = await supabase
		.from('enrollments')
		.select('*')
		.eq('user_id', userId)
		.eq('status', 'active')
		.maybeSingle();

	if (error) {
		console.error('Error fetching enrollment:', error);
		return null;
	}

	return data;
}

/**
 * Finds the next incomplete lesson for a user in a given module
 * Used to determine where to redirect when entering a module
 */
export async function getNextLessonInModule(
	userId: string,
	moduleId: string
): Promise<string | null> {
	const supabase = getSupabaseAdmin();

	// Get all lessons in this module ordered by order_index
	const { data: lessonsData, error: lessonsError } = await supabase
		.from('lessons')
		.select('id, order_index')
		.eq('module_id', moduleId)
		.eq('published', true)
		.order('order_index');

	if (lessonsError || !lessonsData || lessonsData.length === 0) {
		console.error('Error fetching lessons:', lessonsError);
		return null;
	}

	// Cast to proper type to fix TypeScript inference
	const lessons = lessonsData as Pick<LessonRow, 'id' | 'order_index'>[];

	// Get user progress for these lessons
	const { data: progressData, error: progressError } = await supabase
		.from('user_progress')
		.select('target_id, status')
		.eq('user_id', userId)
		.eq('module_id', moduleId)
		.eq('target_type', 'lesson')
		.in(
			'target_id',
			lessons.map((l) => l.id)
		);

	if (progressError) {
		console.error('Error fetching user progress:', progressError);
	}

	// Cast progress data and build completed set
	const progress = (progressData ?? []) as Pick<UserProgressRow, 'target_id' | 'status'>[];
	const completedLessonIds = new Set(
		progress
			.filter((p) => p.status === 'completed')
			.map((p) => p.target_id)
			.filter((id): id is string => id !== null)
	);

	// Find first incomplete lesson
	const nextLesson = lessons.find((lesson) => !completedLessonIds.has(lesson.id));

	return nextLesson?.id ?? lessons[0].id; // Fallback to first lesson if all completed
}
