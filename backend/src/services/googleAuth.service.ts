import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/index.js';

export class GoogleAuthError extends Error {
   constructor(
      message: string,
      public code: 'NOT_CONFIGURED' | 'INVALID_TOKEN'
   ) {
      super(message);
      this.name = 'GoogleAuthError';
   }
}

export interface GoogleProfile {
   googleId: string;
   email: string;
   emailVerified: boolean;
   name: string | null;
   avatar: string | null;
}

const client = config.google.clientId
   ? new OAuth2Client(config.google.clientId)
   : null;

export const googleAuthService = {
   /**
    * Verifies a Google ID token (the credential returned by @react-oauth/google's
    * GoogleLogin component) and extracts the user's profile.
    */
   async verifyIdToken(idToken: string): Promise<GoogleProfile> {
      if (!client) {
         throw new GoogleAuthError(
            'Google OAuth is not configured on the server',
            'NOT_CONFIGURED'
         );
      }

      try {
         const ticket = await client.verifyIdToken({
            idToken,
            audience: config.google.clientId,
         });

         const payload = ticket.getPayload();
         if (!payload || !payload.sub || !payload.email) {
            throw new GoogleAuthError(
               'Invalid Google token payload',
               'INVALID_TOKEN'
            );
         }

         return {
            googleId: payload.sub,
            email: payload.email,
            emailVerified: payload.email_verified ?? false,
            name: payload.name ?? null,
            avatar: payload.picture ?? null,
         };
      } catch (err) {
         if (err instanceof GoogleAuthError) throw err;
         throw new GoogleAuthError(
            'Failed to verify Google token',
            'INVALID_TOKEN'
         );
      }
   },
};
