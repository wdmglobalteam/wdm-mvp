// --- filename: lib/supabase/serverSession.ts ---
import { createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the Supabase-authenticated user for the current server request (if any).
 * Use only in server components / server-side routes.
 */
export async function getServerUser(): Promise<User | null> {
  // createServerClient will use next/headers' cookies() internally.
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    // Log but return null so pages can continue to render
    console.error("getServerUser: supabase.auth.getSession error:", error);
  }

  return data?.session?.user ?? null;
}
