import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { userRepository } from '../repositories/user.repository.js';
import { subscriptionRepository } from '../repositories/subscription.repository.js';
import { googleAuthService } from './googleAuth.service.js';
import type { JwtPayload } from '../types/index.js';

export const authService = {
   signToken(payload: JwtPayload): string {
      return jwt.sign(payload, config.jwt.secret, {
         expiresIn: config.jwt.expiresIn,
      });
   },

   verifyToken(token: string): JwtPayload {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
   },

   async register(email: string, password: string) {
      const existing = await userRepository.findByEmail(email);
      if (existing)
         throw Object.assign(new Error('Email already in use'), {
            status: 409,
         });

      const hash = await bcrypt.hash(password, 10);
      const user = await userRepository.create({ email, password: hash });
      await subscriptionRepository.create(user.id);

      const token = this.signToken({ userId: user.id, role: user.role });
      return {
         token,
         user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: (user as any).name ?? null,
            avatar: (user as any).avatar ?? null,
         },
      };
   },

   async login(email: string, password: string) {
      const user = await userRepository.findByEmailWithSubscription(email);
      if (!user)
         throw Object.assign(new Error('Invalid credentials'), { status: 401 });

      if (!user.password) {
         // Account was created via Google — no password set
         throw Object.assign(
            new Error(
               'This account uses Google Sign-In. Please continue with Google.'
            ),
            { status: 401 }
         );
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok)
         throw Object.assign(new Error('Invalid credentials'), { status: 401 });

      const token = this.signToken({ userId: user.id, role: user.role });
      return {
         token,
         user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: (user as any).name ?? null,
            avatar: (user as any).avatar ?? null,
            subscription: user.subscription,
         },
      };
   },

   /**
    * Verifies the Google ID token, then either logs in an existing user
    * (matched by googleId, then by email for account-linking) or creates
    * a brand-new account.
    */
   async loginWithGoogle(idToken: string) {
      const profile = await googleAuthService.verifyIdToken(idToken);

      let user = await userRepository.findByGoogleId(profile.googleId);

      if (!user) {
         // Check if an account with this email already exists (e.g. signed up
         // with password originally) — link Google to it instead of duplicating.
         const existingByEmail = await userRepository.findByEmail(
            profile.email
         );

         if (existingByEmail) {
            await userRepository.linkGoogleId(existingByEmail.id, {
               googleId: profile.googleId,
               name: profile.name,
               avatar: profile.avatar,
            });
            user = await userRepository.findByGoogleId(profile.googleId);
         } else {
            const created = await userRepository.createWithGoogle({
               email: profile.email,
               googleId: profile.googleId,
               name: profile.name,
               avatar: profile.avatar,
            });
            await subscriptionRepository.create(created.id);
            user = await userRepository.findByGoogleId(profile.googleId);
         }
      }

      if (!user) {
         throw Object.assign(new Error('Failed to create or find user'), {
            status: 500,
         });
      }

      const token = this.signToken({ userId: user.id, role: user.role });
      return {
         token,
         user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: (user as any).name ?? null,
            avatar: (user as any).avatar ?? null,
            subscription: (user as any).subscription,
         },
      };
   },
};
