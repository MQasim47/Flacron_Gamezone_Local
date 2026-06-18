import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { passwordResetService } from '../services/passwordReset.service.js';
import { GoogleAuthError } from '../services/googleAuth.service.js';

export const authController = {
   async signup(req: Request, res: Response) {
      const { email, password } = (req as any).validated;
      const result = await authService.register(email, password);
      res.json(result);
   },

   async login(req: Request, res: Response) {
      const { email, password } = (req as any).validated;
      const result = await authService.login(email, password);
      res.json(result);
   },

   async google(req: Request, res: Response) {
      const { idToken } = (req as any).validated;
      try {
         const result = await authService.loginWithGoogle(idToken);
         res.json(result);
      } catch (err) {
         if (err instanceof GoogleAuthError) {
            return res.status(err.code === 'NOT_CONFIGURED' ? 500 : 401).json({
               error: err.message,
            });
         }
         throw err;
      }
   },

   async forgotPassword(req: Request, res: Response) {
      const { email } = (req as any).validated;
      await passwordResetService.requestReset(email);
      // Always return the same success message — never reveal if the email exists
      res.json({
         success: true,
         message:
            'If an account exists for that email, a reset link has been sent.',
      });
   },

   async resetPassword(req: Request, res: Response) {
      const { token, password } = (req as any).validated;
      await passwordResetService.resetPassword(token, password);
      res.json({ success: true, message: 'Password reset successfully.' });
   },
};
