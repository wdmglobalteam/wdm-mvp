import { createServerClient } from '@/lib/supabase/server';
import type { PathWithHierarchy, Enrollment } from '@/types/supabase';

/**
 * Fetches the complete learning hierarchy for a given path
 * This single query gets everything needed for the dashboard
 * No client-side fetching = no flash
 */
export async function getPathHierarchy(pathSlug: string = 'frontend-development'): Promise<PathWithHierarchy | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('paths')
    .select(`
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
    `)
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
  const supabase = createServerClient();
  
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
export async function getNextLessonInModule(userId: string, moduleId: string): Promise<string | null> {
  const supabase = createServerClient();
  
  // Get all lessons in this module ordered by order_index
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, order_index')
    .eq('module_id', moduleId)
    .eq('published', true)
    .order('order_index');

  if (!lessons || lessons.length === 0) return null;

  // Get user progress for these lessons
  const { data: progress } = await supabase
    .from('user_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .in('lesson_id', lessons.map(l => l.id));

  const completedLessonIds = new Set(
    progress?.filter(p => p.completed).map(p => p.lesson_id) ?? []
  );

  // Find first incomplete lesson
  const nextLesson = lessons.find(lesson => !completedLessonIds.has(lesson.id));
  
  return nextLesson?.id ?? lessons[0].id; // Fallback to first lesson if all completed
}