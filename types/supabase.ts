export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '13.0.4';
	};
	public: {
		Tables: {
			audit_logs: {
				Row: {
					created_at: string | null;
					event_metadata: Json | null;
					event_type: string;
					id: string;
					ip_address: string | null;
					user_agent: string | null;
					user_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					event_metadata?: Json | null;
					event_type: string;
					id?: string;
					ip_address?: string | null;
					user_agent?: string | null;
					user_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					event_metadata?: Json | null;
					event_type?: string;
					id?: string;
					ip_address?: string | null;
					user_agent?: string | null;
					user_id?: string | null;
				};
				Relationships: [];
			};
			auth_sessions: {
				Row: {
					created_at: string | null;
					expires_at: string;
					id: string;
					ip_address: string | null;
					last_used_at: string | null;
					token_hash: string;
					user_agent: string | null;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					expires_at: string;
					id?: string;
					ip_address?: string | null;
					last_used_at?: string | null;
					token_hash: string;
					user_agent?: string | null;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					expires_at?: string;
					id?: string;
					ip_address?: string | null;
					last_used_at?: string | null;
					token_hash?: string;
					user_agent?: string | null;
					user_id?: string;
				};
				Relationships: [];
			};
			capstone_submissions: {
				Row: {
					capstone_id: string;
					graded_at: string | null;
					grader_feedback: string | null;
					id: string;
					mastery_percent: number | null;
					status: string | null;
					submission_data: Json;
					submitted_at: string | null;
					user_id: string;
				};
				Insert: {
					capstone_id: string;
					graded_at?: string | null;
					grader_feedback?: string | null;
					id?: string;
					mastery_percent?: number | null;
					status?: string | null;
					submission_data?: Json;
					submitted_at?: string | null;
					user_id: string;
				};
				Update: {
					capstone_id?: string;
					graded_at?: string | null;
					grader_feedback?: string | null;
					id?: string;
					mastery_percent?: number | null;
					status?: string | null;
					submission_data?: Json;
					submitted_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'capstone_submissions_capstone_id_fkey';
						columns: ['capstone_id'];
						isOneToOne: false;
						referencedRelation: 'capstones';
						referencedColumns: ['id'];
					},
				];
			};
			capstones: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					description: string | null;
					grading_criteria: Json | null;
					id: string;
					instructions: string | null;
					module_id: string;
					order_index: number;
					published: boolean | null;
					required_mastery_percent: number | null;
					submission_type: string | null;
					title: string;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					grading_criteria?: Json | null;
					id?: string;
					instructions?: string | null;
					module_id: string;
					order_index?: number;
					published?: boolean | null;
					required_mastery_percent?: number | null;
					submission_type?: string | null;
					title: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					grading_criteria?: Json | null;
					id?: string;
					instructions?: string | null;
					module_id?: string;
					order_index?: number;
					published?: boolean | null;
					required_mastery_percent?: number | null;
					submission_type?: string | null;
					title?: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'capstones_module_id_fkey';
						columns: ['module_id'];
						isOneToOne: false;
						referencedRelation: 'modules';
						referencedColumns: ['id'];
					},
				];
			};
			enrollments: {
				Row: {
					completed_at: string | null;
					id: string;
					path_id: string | null;
					progress_percent: number | null;
					started_at: string | null;
					status: string | null;
					user_id: string | null;
				};
				Insert: {
					completed_at?: string | null;
					id?: string;
					path_id?: string | null;
					progress_percent?: number | null;
					started_at?: string | null;
					status?: string | null;
					user_id?: string | null;
				};
				Update: {
					completed_at?: string | null;
					id?: string;
					path_id?: string | null;
					progress_percent?: number | null;
					started_at?: string | null;
					status?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'enrollments_path_id_fkey';
						columns: ['path_id'];
						isOneToOne: false;
						referencedRelation: 'paths';
						referencedColumns: ['id'];
					},
				];
			};
			journeys: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					description: string | null;
					id: string;
					name: string;
					order_index: number;
					published: boolean | null;
					slug: string;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					name: string;
					order_index?: number;
					published?: boolean | null;
					slug: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					name?: string;
					order_index?: number;
					published?: boolean | null;
					slug?: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [];
			};
			lesson_checkpoints: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					id: string;
					lesson_id: string | null;
					module_id: string | null;
					published: boolean | null;
					question_pool: Json;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					id?: string;
					lesson_id?: string | null;
					module_id?: string | null;
					published?: boolean | null;
					question_pool?: Json;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					id?: string;
					lesson_id?: string | null;
					module_id?: string | null;
					published?: boolean | null;
					question_pool?: Json;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'lesson_checkpoints_lesson_id_fkey';
						columns: ['lesson_id'];
						isOneToOne: false;
						referencedRelation: 'lessons';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'lesson_checkpoints_module_id_fkey';
						columns: ['module_id'];
						isOneToOne: false;
						referencedRelation: 'modules';
						referencedColumns: ['id'];
					},
				];
			};
			lessons: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					description: string | null;
					grading_json: Json;
					id: string;
					interactivity_json: Json;
					json_schema_version: string | null;
					last_published_at: string | null;
					module_id: string | null;
					order_index: number;
					published: boolean | null;
					required_mastery_percent: number | null;
					title: string;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					grading_json?: Json;
					id?: string;
					interactivity_json?: Json;
					json_schema_version?: string | null;
					last_published_at?: string | null;
					module_id?: string | null;
					order_index: number;
					published?: boolean | null;
					required_mastery_percent?: number | null;
					title: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					grading_json?: Json;
					id?: string;
					interactivity_json?: Json;
					json_schema_version?: string | null;
					last_published_at?: string | null;
					module_id?: string | null;
					order_index?: number;
					published?: boolean | null;
					required_mastery_percent?: number | null;
					title?: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'lessons_module_id_fkey';
						columns: ['module_id'];
						isOneToOne: false;
						referencedRelation: 'modules';
						referencedColumns: ['id'];
					},
				];
			};
			modules: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					description: string | null;
					id: string;
					name: string;
					order_index: number;
					published: boolean | null;
					realm_id: string | null;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					name: string;
					order_index: number;
					published?: boolean | null;
					realm_id?: string | null;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					name?: string;
					order_index?: number;
					published?: boolean | null;
					realm_id?: string | null;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'modules_realm_id_fkey';
						columns: ['realm_id'];
						isOneToOne: false;
						referencedRelation: 'realms';
						referencedColumns: ['id'];
					},
				];
			};
			onboarding_progress: {
				Row: {
					created_at: string | null;
					data: Json | null;
					id: string;
					step: number;
					updated_at: string | null;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					data?: Json | null;
					id?: string;
					step?: number;
					updated_at?: string | null;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					data?: Json | null;
					id?: string;
					step?: number;
					updated_at?: string | null;
					user_id?: string;
				};
				Relationships: [];
			};
			paths: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					description: string | null;
					id: string;
					journey_id: string | null;
					name: string;
					order_index: number;
					published: boolean | null;
					slug: string;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					journey_id?: string | null;
					name: string;
					order_index: number;
					published?: boolean | null;
					slug: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					journey_id?: string | null;
					name?: string;
					order_index?: number;
					published?: boolean | null;
					slug?: string;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'paths_journey_id_fkey';
						columns: ['journey_id'];
						isOneToOne: false;
						referencedRelation: 'journeys';
						referencedColumns: ['id'];
					},
				];
			};
			payments: {
				Row: {
					amount: number | null;
					created_at: string | null;
					currency: string | null;
					id: string;
					metadata: Json | null;
					provider: string;
					provider_payment_id: string | null;
					status: string | null;
					user_id: string;
				};
				Insert: {
					amount?: number | null;
					created_at?: string | null;
					currency?: string | null;
					id?: string;
					metadata?: Json | null;
					provider: string;
					provider_payment_id?: string | null;
					status?: string | null;
					user_id: string;
				};
				Update: {
					amount?: number | null;
					created_at?: string | null;
					currency?: string | null;
					id?: string;
					metadata?: Json | null;
					provider?: string;
					provider_payment_id?: string | null;
					status?: string | null;
					user_id?: string;
				};
				Relationships: [];
			};
			pillars: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					description: string | null;
					id: string;
					name: string;
					order_index: number;
					path_id: string | null;
					published: boolean | null;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					name: string;
					order_index: number;
					path_id?: string | null;
					published?: boolean | null;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					name?: string;
					order_index?: number;
					path_id?: string | null;
					published?: boolean | null;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'pillars_path_id_fkey';
						columns: ['path_id'];
						isOneToOne: false;
						referencedRelation: 'paths';
						referencedColumns: ['id'];
					},
				];
			};
			profiles: {
				Row: {
					age: number | null;
					avatar_url: string | null;
					bio: string | null;
					created_at: string | null;
					display_name: string | null;
					email: string | null;
					email_verified: boolean | null;
					email_verified_at: string | null;
					full_name: string | null;
					gender: string | null;
					id: string;
					locale: string | null;
					matric_number: string | null;
					payment_status: string | null;
					registration_completed: boolean | null;
					registration_step: number | null;
					role: string | null;
					school_id: string | null;
					timezone: string | null;
					updated_at: string | null;
					whatsapp_number: string | null;
				};
				Insert: {
					age?: number | null;
					avatar_url?: string | null;
					bio?: string | null;
					created_at?: string | null;
					display_name?: string | null;
					email?: string | null;
					email_verified?: boolean | null;
					email_verified_at?: string | null;
					full_name?: string | null;
					gender?: string | null;
					id: string;
					locale?: string | null;
					matric_number?: string | null;
					payment_status?: string | null;
					registration_completed?: boolean | null;
					registration_step?: number | null;
					role?: string | null;
					school_id?: string | null;
					timezone?: string | null;
					updated_at?: string | null;
					whatsapp_number?: string | null;
				};
				Update: {
					age?: number | null;
					avatar_url?: string | null;
					bio?: string | null;
					created_at?: string | null;
					display_name?: string | null;
					email?: string | null;
					email_verified?: boolean | null;
					email_verified_at?: string | null;
					full_name?: string | null;
					gender?: string | null;
					id?: string;
					locale?: string | null;
					matric_number?: string | null;
					payment_status?: string | null;
					registration_completed?: boolean | null;
					registration_step?: number | null;
					role?: string | null;
					school_id?: string | null;
					timezone?: string | null;
					updated_at?: string | null;
					whatsapp_number?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'profiles_school_fk';
						columns: ['school_id'];
						isOneToOne: false;
						referencedRelation: 'schools';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'profiles_school_id_fkey';
						columns: ['school_id'];
						isOneToOne: false;
						referencedRelation: 'schools';
						referencedColumns: ['id'];
					},
				];
			};
			realms: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					description: string | null;
					id: string;
					name: string;
					order_index: number;
					pillar_id: string | null;
					published: boolean | null;
					updated_at: string | null;
					updated_by: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					name: string;
					order_index: number;
					pillar_id?: string | null;
					published?: boolean | null;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					name?: string;
					order_index?: number;
					pillar_id?: string | null;
					published?: boolean | null;
					updated_at?: string | null;
					updated_by?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'realms_pillar_id_fkey';
						columns: ['pillar_id'];
						isOneToOne: false;
						referencedRelation: 'pillars';
						referencedColumns: ['id'];
					},
				];
			};
			reset_tokens: {
				Row: {
					created_at: string | null;
					expires_at: string;
					id: string;
					ip_address: string | null;
					token_hash: string;
					token_type: string;
					used_at: string | null;
					user_agent: string | null;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					expires_at: string;
					id?: string;
					ip_address?: string | null;
					token_hash: string;
					token_type: string;
					used_at?: string | null;
					user_agent?: string | null;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					expires_at?: string;
					id?: string;
					ip_address?: string | null;
					token_hash?: string;
					token_type?: string;
					used_at?: string | null;
					user_agent?: string | null;
					user_id?: string;
				};
				Relationships: [];
			};
			schools: {
				Row: {
					created_at: string | null;
					id: string;
					name: string;
					updated_at: string | null;
					whatsapp_group_link: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					name: string;
					updated_at?: string | null;
					whatsapp_group_link?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					name?: string;
					updated_at?: string | null;
					whatsapp_group_link?: string | null;
				};
				Relationships: [];
			};
			user_checkpoints: {
				Row: {
					answers: Json | null;
					created_at: string | null;
					current_index: number | null;
					expires_at: string;
					id: string;
					lesson_id: string | null;
					module_id: string;
					questions: Json;
					status: string | null;
					time_limit_seconds: number;
					user_id: string;
				};
				Insert: {
					answers?: Json | null;
					created_at?: string | null;
					current_index?: number | null;
					expires_at: string;
					id?: string;
					lesson_id?: string | null;
					module_id: string;
					questions?: Json;
					status?: string | null;
					time_limit_seconds: number;
					user_id: string;
				};
				Update: {
					answers?: Json | null;
					created_at?: string | null;
					current_index?: number | null;
					expires_at?: string;
					id?: string;
					lesson_id?: string | null;
					module_id?: string;
					questions?: Json;
					status?: string | null;
					time_limit_seconds?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_checkpoints_lesson_id_fkey';
						columns: ['lesson_id'];
						isOneToOne: false;
						referencedRelation: 'lessons';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'user_checkpoints_module_id_fkey';
						columns: ['module_id'];
						isOneToOne: false;
						referencedRelation: 'modules';
						referencedColumns: ['id'];
					},
				];
			};
			user_progress: {
				Row: {
					attempts: number | null;
					created_at: string | null;
					id: string;
					last_attempt_at: string | null;
					mastery_percent: number | null;
					metadata: Json | null;
					module_id: string | null;
					status: string | null;
					target_id: string | null;
					target_type: string | null;
					updated_at: string | null;
					user_id: string | null;
				};
				Insert: {
					attempts?: number | null;
					created_at?: string | null;
					id?: string;
					last_attempt_at?: string | null;
					mastery_percent?: number | null;
					metadata?: Json | null;
					module_id?: string | null;
					status?: string | null;
					target_id?: string | null;
					target_type?: string | null;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Update: {
					attempts?: number | null;
					created_at?: string | null;
					id?: string;
					last_attempt_at?: string | null;
					mastery_percent?: number | null;
					metadata?: Json | null;
					module_id?: string | null;
					status?: string | null;
					target_id?: string | null;
					target_type?: string | null;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'user_progress_module_id_fkey';
						columns: ['module_id'];
						isOneToOne: false;
						referencedRelation: 'modules';
						referencedColumns: ['id'];
					},
				];
			};
			user_roles: {
				Row: {
					created_at: string | null;
					id: string;
					role: string;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					role: string;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					role?: string;
					user_id?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			cleanup_expired_auth_data: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;

// Convenience types for nested hierarchy
export type PathWithHierarchy = Database['public']['Tables']['paths']['Row'] & {
	pillars: (Database['public']['Tables']['pillars']['Row'] & {
		realms: (Database['public']['Tables']['realms']['Row'] & {
			modules: (Database['public']['Tables']['modules']['Row'] & {
				lessons: Database['public']['Tables']['lessons']['Row'][];
			})[];
		})[];
	})[];
};

export type Enrollment = Database['public']['Tables']['enrollments']['Row'];
