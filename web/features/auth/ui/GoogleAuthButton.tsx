'use client';

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { loginWithGoogle } from '../api/authApi';
import { useAuth } from '@/shared/hooks';

interface GoogleAuthButtonProps {
   onError?: (message: string) => void;
}

export function GoogleAuthButton({ onError }: GoogleAuthButtonProps) {
   const router = useRouter();
   const { login: storeLogin } = useAuth();
   const [loading, setLoading] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);
   const [buttonWidth, setButtonWidth] = useState(320);

   // Google's button only accepts a fixed pixel width (200–400px range).
   // Measuring the actual container means it never overflows narrow phones.
   useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const measure = () => {
         const available = el.offsetWidth;
         if (available > 0) {
            setButtonWidth(Math.min(400, Math.max(200, Math.floor(available))));
         }
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
   }, []);

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
         ref={containerRef}
         className={`flex justify-center w-full ${loading ? 'opacity-60 pointer-events-none' : ''}`}
      >
         <GoogleLogin
            onSuccess={handleSuccess}
            onError={() =>
               onError?.('Google sign-in failed. Please try again.')
            }
            theme="filled_black"
            shape="pill"
            width={buttonWidth}
         />
      </div>
   );
}
