'use client';

import { KeyRound } from 'lucide-react';
import { ForgotPasswordForm } from '@/features/auth/ui/ForgotPasswordForm';

export function ForgotPasswordClient() {
   return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div
               className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
               style={{ animationDelay: '1s' }}
            />
         </div>

         <div className="relative w-full max-w-md z-10">
            <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
               <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-blue-500/50">
                     <KeyRound className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                     Forgot Password?
                  </h1>
                  <p className="text-slate-400 text-sm">
                     Enter your email and we'll send you a reset link
                  </p>
               </div>
               <ForgotPasswordForm />
            </div>
         </div>
      </div>
   );
}
