'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
   Lock,
   Eye,
   EyeOff,
   ArrowRight,
   AlertCircle,
   CheckCircle2,
} from 'lucide-react';
import { resetPassword } from '../api/authApi';

export function ResetPasswordForm() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const token = searchParams.get('token') ?? '';

   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!token) {
         setError('This reset link is invalid or missing a token.');
         return;
      }
      if (password.length < 6) {
         setError('Password must be at least 6 characters.');
         return;
      }
      if (password !== confirmPassword) {
         setError('Passwords do not match.');
         return;
      }

      try {
         setLoading(true);
         await resetPassword(token, password);
         setSuccess(true);
         setTimeout(() => router.replace('/login'), 2500);
      } catch (err: any) {
         let msg = 'This reset link is invalid or has expired.';
         try {
            msg = JSON.parse(err.message)?.error ?? err.message ?? msg;
         } catch {}
         setError(msg);
      } finally {
         setLoading(false);
      }
   };

   if (!token) {
      return (
         <div className="space-y-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-slate-300">
               This reset link is invalid or missing a token. Please request a
               new one.
            </p>
            <Link
               href="/forgot-password"
               className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
               Request new link
            </Link>
         </div>
      );
   }

   if (success) {
      return (
         <div className="space-y-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30">
               <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
               Password reset!
            </h2>
            <p className="text-slate-400 text-sm">
               Redirecting you to sign in…
            </p>
         </div>
      );
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
         {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-2 text-sm">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               {error}
            </div>
         )}

         <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
               New Password
            </label>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter a new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
               />
               <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
               >
                  {showPassword ? (
                     <EyeOff className="w-5 h-5" />
                  ) : (
                     <Eye className="w-5 h-5" />
                  )}
               </button>
            </div>
         </div>

         <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
               Confirm Password
            </label>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
               />
            </div>
         </div>

         <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
         >
            {loading ? (
               <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting…
               </span>
            ) : (
               <>
                  Reset Password
                  <ArrowRight className="w-5 h-5" />
               </>
            )}
         </button>
      </form>
   );
}
