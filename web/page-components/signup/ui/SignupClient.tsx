'use client';

import { UserPlus } from 'lucide-react';
import { SignupForm } from '@/features/auth/ui/SignupForm';
import Link from 'next/link';

export function SignupClient() {
   return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div
               className="absolute bottom-20 right-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse"
               style={{ animationDelay: '1s' }}
            />
         </div>

         <div className="relative w-full max-w-md z-10">
            <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
               <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-dark mb-4 shadow-lg shadow-brand/40">
                     <UserPlus className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent mb-2">
                     Join Flacron GameZone
                  </h1>
                  <p className="text-slate-400 text-sm">
                     Create your account and start your journey
                  </p>
               </div>
               <SignupForm />
            </div>
            <p className="text-center text-xs text-slate-500 mt-6">
               Already have an account?{' '}
               <Link
                  href="/login"
                  className="text-brand hover:text-brand-hover"
               >
                  Sign in
               </Link>
            </p>
         </div>
      </div>
   );
}
