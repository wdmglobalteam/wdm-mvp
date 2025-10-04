// lib/onboarding.ts
import type { Profile } from "@/types/onboarding";

/**
 * Fields the client can patch during onboarding.
 * Server enforces school_id, email, payment_status, etc.
 */
export type OnboardingPatch = Partial<
  Pick<
    Profile,
    | "full_name"
    | "display_name"
    | "matric_number"
    | "whatsapp_number"
    | "avatar_url"
    | "gender"
    | "age"
    | "registration_step"
    | "registration_completed"
  >
>;

/**
 * Save onboarding progress to server.
 */
export async function saveStepToServer(
  accessToken: string,
  profilePatch: OnboardingPatch
): Promise<{ ok: boolean; error?: string }> {
  const resp = await fetch("/api/onboarding/save-step", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ profile: profilePatch }),
  });

  if (!resp.ok) {
    const body = (await resp.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: body?.error ?? "network" };
  }

  return { ok: true };
}

/**
 * Check if matric number or WhatsApp already belongs to another user.
 */
export async function checkConflictServer(
  accessToken: string,
  payload: {
    matric_number?: string;
    whatsapp_number?: string;
    userId?: string | null;
  }
): Promise<{ conflict: boolean; field?: string; userId?: string | null }> {
  const resp = await fetch("/api/onboarding/check-conflict", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return (await resp.json()) as {
    conflict: boolean;
    field?: string;
    userId?: string | null;
  };
}

/**
 * Upload avatar to bucket via server route.
 */
export async function uploadAvatarServer(
  accessToken: string,
  filename: string,
  contentType: string,
  base64: string
): Promise<{ url?: string; error?: string }> {
  const resp = await fetch("/api/onboarding/upload-avatar", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ filename, contentType, base64 }),
  });

  return (await resp.json()) as { url?: string; error?: string };
}
