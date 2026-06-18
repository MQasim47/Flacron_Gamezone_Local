import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { userRepository } from '../repositories/user.repository.js';
import { passwordResetTokenRepository } from '../repositories/passwordResetToken.repository.js';
import { emailService } from './email.service.js';

function hashToken(rawToken: string): string {
   return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export const passwordResetService = {
   /**
    * Always resolves successfully regardless of whether the email exists,
    * so the API never leaks which emails are registered.
    */
   async requestReset(email: string): Promise<void> {
      const user = await userRepository.findByEmail(email);
      if (!user) return; // silent no-op — don't leak account existence

      // Google-only accounts have no password to reset
      if (!user.password) return;

      await passwordResetTokenRepository.invalidateAllForUser(user.id);

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(
         Date.now() + config.passwordReset.ttlMinutes * 60 * 1000
      );

      await passwordResetTokenRepository.create({
         userId: user.id,
         tokenHash,
         expiresAt,
      });

      const resetUrl = `${config.cors.origin}/reset-password?token=${rawToken}`;

      await emailService.send({
         to: { email: user.email },
         subject: 'Reset your Flacron Gamezone password',
         fromEmail: config.passwordReset.fromEmail,
         fromName: config.passwordReset.fromName,
         htmlContent: `
            <div style="font-family: sans-serif; line-height: 1.6;">
              <h2>Reset your password</h2>
              <p>We received a request to reset your Flacron Gamezone password. This link expires in ${config.passwordReset.ttlMinutes} minutes.</p>
              <p>
                <a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
                  Reset Password
                </a>
              </p>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <p style="color:#888;font-size:12px;">Or paste this link into your browser: ${resetUrl}</p>
            </div>
         `,
         textContent: `Reset your password: ${resetUrl}\n\nThis link expires in ${config.passwordReset.ttlMinutes} minutes. If you didn't request this, ignore this email.`,
      });
   },

   async resetPassword(rawToken: string, newPassword: string): Promise<void> {
      const tokenHash = hashToken(rawToken);
      const tokenRecord =
         await passwordResetTokenRepository.findValidByHash(tokenHash);

      if (!tokenRecord) {
         throw Object.assign(new Error('Invalid or expired reset link'), {
            status: 400,
         });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await userRepository.updatePassword(tokenRecord.userId, passwordHash);
      await passwordResetTokenRepository.markUsed(tokenRecord.id);
   },
};
