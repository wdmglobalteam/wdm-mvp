// --- filename: lib/supabaseAdmin.ts ---
/**
 * Server-side Supabase Admin Client
 * Uses service role key for privileged operations
 * NEVER expose this to the client
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Admin client with service role privileges
 * - Bypasses RLS
 * - Can perform privileged operations
 * - Must ONLY be used server-side
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Type-safe helper to get admin client
 * Enforces server-side usage via runtime check
 */
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin can only be used server-side');
  }
  return supabaseAdmin;
}