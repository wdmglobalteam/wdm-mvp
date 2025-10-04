//  --- filename: lib/server/emailService.ts ---
/**
 * Email Service
 * Sends transactional emails via Resend
 */

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not set - emails will not be sent');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'WDM PathMastery <noreply@wdmpathmastery.com>';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

class EmailService {
  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    if (!resend) {
      console.log(`[DEV] Verification email for ${email}: ${BASE_URL}/verify?token=${token}`);
      return;
    }

    const verifyUrl = `${BASE_URL}/verify?token=${token}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your WDM PathMastery account',
      html: `
        <h2>Welcome to WDM PathMastery!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verifyUrl}">Verify Email Address</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${verifyUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    if (!resend) {
      console.log(`[DEV] Password reset for ${email}: ${BASE_URL}/api/auth/reset-password?token=${token}`);
      return;
    }

    const resetUrl = `${BASE_URL}/api/auth/reset-password?token=${token}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your WDM PathMastery password',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  }
}

export const emailService = new EmailService();