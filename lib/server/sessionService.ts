// --- filename: lib/server/sessionService.ts ---
/**
 * Session Management Service
 * Handles server-side session creation, validation, and revocation
 * Uses secure HttpOnly cookies with hashed tokens
 *
 * NOTE: This service manages DB-side sessions and helpers.
 * Routes are responsible for adding/deleting the actual Set-Cookie header
 * on the response (see login/logout route updates).
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createHash, randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'wdm_session';
export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export interface CreateSessionParams {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ValidateSessionResult {
  valid: boolean;
  userId?: string;
  sessionId?: string;
}

class SessionService {
  private supabase = getSupabaseAdmin();

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create a DB session and return the raw session token (not stored)
   */
  async createSession(params: CreateSessionParams): Promise<string> {
    const { userId, ipAddress, userAgent } = params;
    const sessionToken = this.generateToken();
    const tokenHash = this.hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    const { error } = await this.supabase
      .from('auth_sessions')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      throw new Error('Failed to create session');
    }

    return sessionToken;
  }

  /**
   * Validate raw token against DB (returns user id if valid)
   */
  async validateSession(token: string): Promise<ValidateSessionResult> {
    if (!token) return { valid: false };

    try {
      const tokenHash = this.hashToken(token);
      const { data: session, error } = await this.supabase
        .from('auth_sessions')
        .select('id, user_id, expires_at')
        .eq('token_hash', tokenHash)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !session) return { valid: false };

      // update last used
      await this.supabase
        .from('auth_sessions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', session.id);

      return { valid: true, userId: session.user_id, sessionId: session.id };
    } catch (err) {
      console.error('Session validation error:', err);
      return { valid: false };
    }
  }

  async revokeSession(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.supabase.from('auth_sessions').delete().eq('token_hash', tokenHash);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.supabase.from('auth_sessions').delete().eq('user_id', userId);
  }

  /**
   * NOTE: these cookie helpers use next/headers cookies() which is useful
   * in server components / route handlers — but to ensure Set-Cookie header
   * is attached to the route response, prefer setting cookies on the
   * NextResponse inside the route (see login/logout routes below).
   *
   * These helpers are still helpful for server-side contexts where cookies()
   * is appropriate (e.g. server components).
   */
  async setSessionCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_DURATION / 1000,
    });
  }

  async getSessionToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    return cookie?.value ?? null;
  }

  async clearSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  /**
   * Helper used in server routes (server runtime).
   * Reads cookie from the server request (via cookies()) and validates.
   */
  async getCurrentUser(): Promise<{ userId: string } | null> {
    const token = await this.getSessionToken();
    if (!token) return null;

    const result = await this.validateSession(token);
    if (!result.valid || !result.userId) return null;

    return { userId: result.userId };
  }
}

export const sessionService = new SessionService();
