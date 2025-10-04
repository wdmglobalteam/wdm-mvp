// --- filename: lib/server/onboardingService.ts ---
/**
 * Onboarding Service
 * Handles multi-step onboarding persistence and validation
 */

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  normalizePhone,
  normalizeMatric,
  isValidMatric,
} from "@/lib/validators";
import { Json } from "@/types/supabase";

export interface SaveStepParams {
  userId: string;
  step: number;
  data: Record<string, unknown>;
}

export interface ConflictCheckParams {
  matricNumber?: string;
  whatsappNumber?: string;
  userId: string;
}

export interface ConflictCheckResult {
  conflict: boolean;
  field?: "matric" | "whatsapp";
}

class OnboardingService {
  private supabase = getSupabaseAdmin();

  /**
   * Check for duplicate matric or whatsapp
   */
  async checkConflict(
    params: ConflictCheckParams
  ): Promise<ConflictCheckResult> {
    const { matricNumber, whatsappNumber, userId } = params;

    try {
      // Check matric number
      if (matricNumber) {
        const normalized = normalizeMatric(matricNumber);

        if (!isValidMatric(normalized)) {
          return { conflict: false };
        }

        const { data: matricConflict } = await this.supabase
          .from("profiles")
          .select("id")
          .eq("matric_number", normalized)
          .neq("id", userId)
          .single();

        if (matricConflict) {
          return { conflict: true, field: "matric" };
        }
      }

      // Check whatsapp number
      if (whatsappNumber) {
        const normalized = normalizePhone(whatsappNumber);

        if (!normalized) {
          return { conflict: false };
        }

        const { data: whatsappConflict } = await this.supabase
          .from("profiles")
          .select("id")
          .eq("whatsapp_number", normalized)
          .neq("id", userId)
          .single();

        if (whatsappConflict) {
          return { conflict: true, field: "whatsapp" };
        }
      }

      return { conflict: false };
    } catch (error) {
      console.error("Conflict check error:", error);
      return { conflict: false };
    }
  }

  /**
   * Save onboarding step
   */
  async saveStep(
    params: SaveStepParams
  ): Promise<{ success: boolean; error?: string }> {
    const { userId, step, data } = params;

    try {
      // Normalize phone if present
      if (data.whatsapp_number && typeof data.whatsapp_number === "string") {
        const normalized = normalizePhone(data.whatsapp_number);
        if (!normalized) {
          return { success: false, error: "Invalid phone number format" };
        }
        data.whatsapp_number = normalized;
      }

      // Normalize matric if present
      if (data.matric_number && typeof data.matric_number === "string") {
        const normalized = normalizeMatric(data.matric_number);
        if (!isValidMatric(normalized)) {
          return { success: false, error: "Invalid matric number format" };
        }
        data.matric_number = normalized;
      }

      // Update profiles table
      const profileUpdate: Record<string, unknown> = {
        registration_step: step,
        ...data,
      };

      const { error: profileError } = await this.supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", userId);

      if (profileError) {
        console.error("Profile update error:", profileError);
        return { success: false, error: "Failed to save profile" };
      }

      // Update onboarding_progress table
      // FIXED: Cast data to unknown then to Json to satisfy TypeScript
      const { error: progressError } = await this.supabase
        .from("onboarding_progress")
        .upsert(
          {
            user_id: userId,
            step,
            data: data as unknown as Json, // Cast to satisfy Supabase Json type
          },
          {
            onConflict: "user_id",
          }
        );

      if (progressError) {
        console.error("Progress update error:", progressError);
        return { success: false, error: "Failed to save progress" };
      }

      return { success: true };
    } catch (error) {
      console.error("Save step error:", error);
      return { success: false, error: "Internal server error" };
    }
  }

  /**
   * Get onboarding progress
   */
  async getProgress(userId: string): Promise<{
    step: number;
    data: Record<string, unknown>;
  } | null> {
    try {
      const { data: progress } = await this.supabase
        .from("onboarding_progress")
        .select("step, data")
        .eq("user_id", userId)
        .single();

      if (!progress) {
        return { step: 0, data: {} };
      }

      return {
        step: progress.step || 0,
        data: (progress.data as Record<string, unknown>) || {},
      };
    } catch (error) {
      console.error("Get progress error:", error);
      return null;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from("profiles")
        .update({
          registration_completed: true,
        })
        .eq("id", userId);

      if (error) {
        return { success: false, error: "Failed to complete onboarding" };
      }

      return { success: true };
    } catch (error) {
      console.error("Complete onboarding error:", error);
      return { success: false, error: "Internal server error" };
    }
  }
}

export const onboardingService = new OnboardingService();