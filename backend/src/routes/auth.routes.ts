import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const signupSchema = z.object({
   email: z.string().email(),
   password: z.string().min(6),
});

const loginSchema = z.object({
   email: z.string().email(),
   password: z.string().min(1),
});

const googleSchema = z.object({
   idToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
   email: z.string().email(),
});

const resetPasswordSchema = z.object({
   token: z.string().min(1),
   password: z.string().min(6),
});

// Prevent abuse of the forgot-password endpoint (email bombing / enumeration probing)
const forgotPasswordLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 5,
   message: { error: 'Too many requests. Please try again later.' },
});

const router = Router();

router.post(
   '/signup',
   validateBody(signupSchema),
   asyncHandler(authController.signup)
);
router.post(
   '/login',
   validateBody(loginSchema),
   asyncHandler(authController.login)
);
router.post(
   '/google',
   validateBody(googleSchema),
   asyncHandler(authController.google)
);
router.post(
   '/forgot-password',
   forgotPasswordLimiter,
   validateBody(forgotPasswordSchema),
   asyncHandler(authController.forgotPassword)
);
router.post(
   '/reset-password',
   validateBody(resetPasswordSchema),
   asyncHandler(authController.resetPassword)
);

export default router;
