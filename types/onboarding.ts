// types/onboarding.ts

/**
 * Matches the `profiles` table in Supabase.
 */
export interface Profile {
  /** UUID from auth.users */
  id: string;

  full_name: string | null;
  display_name: string | null;

  matric_number: string | null;
  whatsapp_number: string | null;

  /** Age in years */
  age: number | null;

  /** Limited set of values */
  gender: "male" | "female" | "other" | null;

  /** FK to schools.id */
  school_id: string | null;

  /** Avatar image URL (Supabase Storage public URL) */
  avatar_url: string | null;

  /** Current step in onboarding (0 = start) */
  registration_step: number;

  /** Whether onboarding was fully completed */
  registration_completed: boolean;

  /** Payment status controlled by server */
  payment_status: "unpaid" | "paid" | "pending";

  /** Copied automatically from auth.users.email */
  email: string | null;
}
