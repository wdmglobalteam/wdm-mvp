// --- filename: types/supabase-helpers.ts ---
// Helper types for better query type inference

import type { Database } from './supabase';

// Lesson with module relationship
export type LessonWithModule = Database['public']['Tables']['lessons']['Row'] & {
	module: {
		id: string;
		name: string;
		realm_id: string | null;
		order_index: number;
	} | null;
};

// Profile with role
export type ProfileWithRole = Database['public']['Tables']['profiles']['Row'];

// User Progress with proper types
export type UserProgressRow = Database['public']['Tables']['user_progress']['Row'];

// User Checkpoint with proper types
export type UserCheckpointRow = Database['public']['Tables']['user_checkpoints']['Row'];

// Lesson Checkpoint with proper types
export type LessonCheckpointRow = Database['public']['Tables']['lesson_checkpoints']['Row'];

// Path with full hierarchy (for admin)
export type PathWithHierarchyAdmin = Database['public']['Tables']['paths']['Row'] & {
	pillars: Array<
		Database['public']['Tables']['pillars']['Row'] & {
			realms: Array<
				Database['public']['Tables']['realms']['Row'] & {
					modules: Array<
						Database['public']['Tables']['modules']['Row'] & {
							lessons: Database['public']['Tables']['lessons']['Row'][];
						}
					>;
				}
			>;
		}
	>;
};
