// --- filename: lib/server/authService.ts ---
/**
 * Core Authentication Service
 * Handles signup, login, verification, password reset
 * All operations use Supabase Auth + custom token management
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { validateEmail, validatePassword } from '@/lib/validators';
import { createHash, randomBytes } from 'crypto';
import { emailService } from './emailService';
import { sessionService } from './sessionService';
import { auditLog } from './auditService';

type AuthUpdatePayload = {
  email?: string;
  password?: string;
  email_confirm?: boolean; // ✅ snake_case, matches DB
  email_confirmed_at?: string;
};


export interface SignupParams {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SignupResult {
  success: boolean;
  userId?: string;
  error?: string;
  needsVerification?: boolean;
}

export interface LoginParams {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  success: boolean;
  sessionToken?: string;
  userId?: string;
  error?: string;
  needsVerification?: boolean;
}

export interface VerifyEmailParams {
  token: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ResetPasswordParams {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ResetPasswordCompleteParams {
  token: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string;
}

class AuthService {
  private supabase = getSupabaseAdmin();

  /**
   * Hash a token using SHA-256
   * We store only hashes, never raw tokens
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Sign up a new user
   * Creates Supabase Auth user + profile + sends verification email
   */
  async signup(params: SignupParams): Promise<SignupResult> {
    const { email, password, ipAddress, userAgent } = params;

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error };
    }

    try {
      // Check if email already exists
      const { data: existingUser } = await this.supabase.auth.admin.listUsers();
      const emailExists = existingUser?.users?.some(u => u.email === email.trim().toLowerCase());

      if (emailExists) {
        await auditLog({
          eventType: 'signup_failed_duplicate',
          metadata: { email: email.trim().toLowerCase(), reason: 'email_exists' },
          ipAddress,
          userAgent,
        });
        return { success: false, error: 'Email already registered' };
      }

      // Create Supabase Auth user
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: false, // We'll handle verification with our own tokens
        user_metadata: {
          email_verified: false,
        },
      });

      if (authError || !authData.user) {
        await auditLog({
          eventType: 'signup_failed',
          metadata: { email: email.trim().toLowerCase(), error: authError?.message },
          ipAddress,
          userAgent,
        });
        return { success: false, error: authError?.message || 'Failed to create account' };
      }

      const userId = authData.user.id;

      // Create profile record
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email.trim().toLowerCase(),
          email_verified: false,
          registration_step: 0,
          registration_completed: false,
          payment_status: 'unpaid',
        });

      if (profileError) {
        // Rollback: delete auth user
        await this.supabase.auth.admin.deleteUser(userId);
        return { success: false, error: 'Failed to create profile' };
      }

      // Generate verification token
      const verifyToken = this.generateToken();
      const tokenHash = this.hashToken(verifyToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { error: tokenError } = await this.supabase
        .from('reset_tokens')
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          token_type: 'verify',
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
        });

      if (tokenError) {
        console.error('Failed to create verification token:', tokenError);
      }

      // Send verification email
      try {
        await emailService.sendVerificationEmail(email, verifyToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      await auditLog({
        eventType: 'signup_success',
        userId,
        metadata: { email: email.trim().toLowerCase() },
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        userId,
        needsVerification: true,
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(params: VerifyEmailParams): Promise<{ success: boolean; error?: string }> {
    const { token, ipAddress, userAgent } = params;

    try {
      const tokenHash = this.hashToken(token);

      // Find valid token
      const { data: tokenData, error: tokenError } = await this.supabase
        .from('reset_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .eq('token_type', 'verify')
        .is('used_at', null)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        return { success: false, error: 'Invalid or expired verification token' };
      }

      // Mark token as used
      const { error: markError } = await this.supabase
        .from('reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      if (markError) {
        console.warn('Failed to mark token used:', markError);
        // continue - token should still be treated as used logically
      }

      // Update profile
      const { error: profileUpdateError } = await this.supabase
        .from('profiles')
        .update({
          email_verified: true,
          email_verified_at: new Date().toISOString(),
        })
        .eq('id', tokenData.user_id);

      if (profileUpdateError) {
        console.error('Failed to update profile verification:', profileUpdateError);
        return { success: false, error: 'Failed to update verification status' };
      }

      // ALSO update Supabase Auth to mark the user as confirmed
      try {
        // `updateUserById` accepts `email_confirm` on admin API; set it to true.
        // Also attempt to set a confirmation timestamp in user metadata if possible.
        const authUpdatePayload: AuthUpdatePayload = {
          email_confirm: true,
        };

        // Many Supabase implementations accept `email_confirmed_at` as a field; include it if accepted by your SDK/runtime.
        // This call may or may not update that field depending on Supabase server SDK version — it's safe to attempt.
        authUpdatePayload.email_confirmed_at = new Date().toISOString();

        const { error: authUpdateError } = await this.supabase.auth.admin.updateUserById(tokenData.user_id, authUpdatePayload);

        if (authUpdateError) {
          // Log and continue — profile is the canonical source for your app flows
          console.warn('Warning: failed to update Supabase Auth email confirmation:', authUpdateError);
        }
      } catch (err) {
        console.warn('Warning: error while marking Supabase auth user confirmed:', err);
      }

      await auditLog({
        eventType: 'email_verified',
        userId: tokenData.user_id,
        ipAddress,
        userAgent,
      });

      return { success: true };
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const emailTrimmed = (email || '').trim().toLowerCase();

      // Validate email early
      const emailValidation = validateEmail(emailTrimmed);
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
      }

      // Find user by email
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id, email_verified')
        .eq('email', emailTrimmed)
        .single();

      if (!profile) {
        return { success: false, error: 'User not found' };
      }

      if (profile.email_verified) {
        return { success: false, error: 'Email already verified' };
      }

      // Audit the resend request
      await auditLog({
        eventType: 'resend_verification_requested',
        metadata: { email: emailTrimmed },
      });

      // Invalidate old verification tokens
      await this.supabase
        .from('reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('user_id', profile.id)
        .eq('token_type', 'verify')
        .is('used_at', null);

      // Generate new token
      const verifyToken = this.generateToken();
      const tokenHash = this.hashToken(verifyToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const { error: insertError } = await this.supabase
        .from('reset_tokens')
        .insert({
          user_id: profile.id,
          token_hash: tokenHash,
          token_type: 'verify',
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Failed to insert new verification token:', insertError);
        return { success: false, error: 'Failed to generate verification token' };
      }

      await emailService.sendVerificationEmail(emailTrimmed, verifyToken);

      return { success: true };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Login with email and password
   * Returns session token on success
   */
  async login(params: LoginParams): Promise<LoginResult> {
    const { email, password, ipAddress, userAgent } = params;

    try {
      const emailTrimmed = (email || '').trim().toLowerCase();

      // Validate email early
      const emailValidation = validateEmail(emailTrimmed);
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
      }

      // Attempt Supabase Auth login
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });

      if (authError || !authData.user) {
        await auditLog({
          eventType: 'login_failed',
          metadata: { email: emailTrimmed, reason: authError?.message },
          ipAddress,
          userAgent,
        });
        return { success: false, error: 'Invalid email or password' };
      }

      const userId = authData.user.id;

      // Check email verification from profiles table (your app uses profiles.email_verified)
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();

      if (!profile?.email_verified) {
        await auditLog({
          eventType: 'login_blocked_unverified',
          userId,
          ipAddress,
          userAgent,
        });
        return {
          success: false,
          error: 'Please verify your email before signing in',
          needsVerification: true,
        };
      }

      // Create server session
      const sessionToken = await sessionService.createSession({
        userId,
        ipAddress,
        userAgent,
      });

      await auditLog({
        eventType: 'login_success',
        userId,
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        sessionToken,
        userId,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Request password reset
   * Sends email with reset link
   */
  async requestPasswordReset(params: ResetPasswordParams): Promise<{ success: boolean; error?: string }> {
    const { email, ipAddress, userAgent } = params;

    try {
      const emailTrimmed = (email || '').trim().toLowerCase();

      // Find user
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('email', emailTrimmed)
        .single();

      // Always return success to prevent email enumeration
      if (!profile) {
        return { success: true };
      }

      // Invalidate old reset tokens
      await this.supabase
        .from('reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('user_id', profile.id)
        .eq('token_type', 'reset')
        .is('used_at', null);

      // Generate reset token
      const resetToken = this.generateToken();
      const tokenHash = this.hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.supabase
        .from('reset_tokens')
        .insert({
          user_id: profile.id,
          token_hash: tokenHash,
          token_type: 'reset',
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
        });

      await emailService.sendPasswordResetEmail(emailTrimmed, resetToken);

      await auditLog({
        eventType: 'password_reset_requested',
        userId: profile.id,
        ipAddress,
        userAgent,
      });

      return { success: true };
    } catch (error) {
      console.error('Request password reset error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Complete password reset
   */
  async resetPassword(params: ResetPasswordCompleteParams): Promise<{ success: boolean; error?: string }> {
    const { token, newPassword, ipAddress, userAgent } = params;

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error };
    }

    try {
      const tokenHash = this.hashToken(token);

      // Find valid token
      const { data: tokenData, error: tokenError } = await this.supabase
        .from('reset_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .eq('token_type', 'reset')
        .is('used_at', null)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Update password via Supabase Auth Admin
      const { error: updateError } = await this.supabase.auth.admin.updateUserById(tokenData.user_id, {
        password: newPassword,
      });

      if (updateError) {
        return { success: false, error: 'Failed to update password' };
      }

      // Mark token as used
      await this.supabase
        .from('reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      // Revoke all existing sessions for security
      await sessionService.revokeAllUserSessions(tokenData.user_id);

      await auditLog({
        eventType: 'password_reset_completed',
        userId: tokenData.user_id,
        ipAddress,
        userAgent,
      });

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Handle Google OAuth callback
   * Links provider or creates new user
   */
  async handleGoogleCallback(params: {
    code: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<LoginResult> {
    const { code, ipAddress, userAgent } = params;

    try {
      // Exchange code for session
      const { data: authData, error: authError } = await this.supabase.auth.exchangeCodeForSession(code);

      if (authError || !authData.user) {
        return { success: false, error: 'OAuth authentication failed' };
      }

      const userId = authData.user.id;
      const email = authData.user.email;

      if (!email) {
        return { success: false, error: 'No email provided by OAuth provider' };
      }

      // Check if profile exists
      const { data: existingProfile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Create new profile for OAuth user
        const { error: profileError } = await this.supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email.toLowerCase(),
            email_verified: true, // OAuth providers verify email
            email_verified_at: new Date().toISOString(),
            registration_step: 0,
            registration_completed: false,
            payment_status: 'unpaid',
          });

        if (profileError) {
          console.error('Failed to create OAuth profile:', profileError);
          return { success: false, error: 'Failed to create profile' };
        }

        await auditLog({
          eventType: 'oauth_signup',
          userId,
          metadata: { provider: 'google', email },
          ipAddress,
          userAgent,
        });
      } else {
        await auditLog({
          eventType: 'oauth_login',
          userId,
          metadata: { provider: 'google', email },
          ipAddress,
          userAgent,
        });
      }

      // Create server session
      const sessionToken = await sessionService.createSession({
        userId,
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        sessionToken,
        userId,
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }
}

export const authService = new AuthService();
