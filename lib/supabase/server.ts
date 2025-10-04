// --- filename: lib/supabase/server.ts ---
// /**
//  * Server Supabase helpers for Next.js App Router
//  *
//  * Important:
//  * - Do NOT call `cookies()` at module initialization time.
//  * - Pass the cookies *function* (not its result) into the auth-helpers so
//  *   they can call it in the correct request context.
//  *
//  * Exports:
//  * - createServerClient()  -> use in Server Components (app/*/page.tsx, layout.tsx)
//  * - createRouteClient()   -> use in Route Handlers (app/api/*/route.ts)
//  */

import {
  createServerComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import { cookies as nextCookies } from "next/headers";

/**
 * Create a Supabase client for Server Components.
 *
 * @param options.cookies Optional cookies function to use (defaults to next/headers cookies)
 */
export function createServerClient(options?: { cookies?: typeof nextCookies }) {
  const cookiesFn = options?.cookies ?? nextCookies;
  return createServerComponentClient<Database>({
    cookies: cookiesFn,
  });
}

/**
 * Create a Supabase client for Route Handlers (API route handlers).
 *
 * @param options.cookies Optional cookies function to use (defaults to next/headers cookies)
 */
export function createRouteClient(options?: { cookies?: typeof nextCookies }) {
  const cookiesFn = options?.cookies ?? nextCookies;
  return createRouteHandlerClient<Database>({
    cookies: cookiesFn,
  });
}
