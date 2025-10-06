// --- filename: lib/supabase/server.ts ---
import {
	createServerComponentClient,
	createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { cookies as nextCookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a typed Supabase client for Server Components.
 * We assert the factory result to SupabaseClient<Database> because
 * @supabase/auth-helpers-nextjs' factory can lose the Database generic in TS inference,
 * which leads to table types resolving to `never` in downstream code.
 */
export function createServerClient(options?: {
	cookies?: typeof nextCookies;
}): SupabaseClient<Database> {
	const cookiesFn = options?.cookies ?? nextCookies;
	// NOTE: the `as unknown as SupabaseClient<Database>` cast is intentional and safe.
	return createServerComponentClient({ cookies: cookiesFn }) as unknown as SupabaseClient<Database>;
}

/**
 * Create a typed Supabase client for Route Handlers (API route handlers).
 */
export function createRouteClient(options?: {
	cookies?: typeof nextCookies;
}): SupabaseClient<Database> {
	const cookiesFn = options?.cookies ?? nextCookies;
	return createRouteHandlerClient({ cookies: cookiesFn }) as unknown as SupabaseClient<Database>;
}
