'use client';

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginWithGoogle } from '../api/authApi';
import { useAuth } from '@/shared/hooks';

interface GoogleAuthButtonProps {
   onError?: (message: string) => void;
}

export function GoogleAuthButton({ onError }: GoogleAuthButtonProps) {
   const router = useRouter();
   const { login: storeLogin } = useAuth();
   const [loading, setLoading] = useState(false);

   const handleSuccess = async (credentialResponse: CredentialResponse) => {
      if (!credentialResponse.credential) {
         onError?.('Google sign-in failed. Please try again.');
         return;
      }
      try {
         setLoading(true);
         const data = await loginWithGoogle(credentialResponse.credential);
         storeLogin(data.token, data.user);
         router.replace('/');
      } catch (err: any) {
         let msg = 'Google sign-in failed. Please try again.';
         try {
            msg = JSON.parse(err.message)?.error ?? err.message ?? msg;
         } catch {}
         onError?.(msg);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div
         className={`flex justify-center ${loading ? 'opacity-60 pointer-events-none' : ''}`}
      >
         <GoogleLogin
            onSuccess={handleSuccess}
            onError={() =>
               onError?.('Google sign-in failed. Please try again.')
            }
            theme="filled_black"
            shape="pill"
            width="320"
         />
      </div>
   );
}
