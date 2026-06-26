'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
   Mail,
   ArrowRight,
   AlertCircle,
   ArrowLeft,
   CheckCircle2,
} from 'lucide-react';
import { forgotPassword } from '../api/authApi';

export function ForgotPasswordForm() {
   const [email, setEmail] = useState('');
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [submitted, setSubmitted] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         setError('Please enter a valid email address.');
         return;
      }

      try {
         setLoading(true);
         await forgotPassword(email);
         // Always show success — backend never reveals whether the email exists
         setSubmitted(true);
      } catch (err: any) {
         let msg = 'Something went wrong. Please try again.';
         try {
            msg = JSON.parse(err.message)?.error ?? err.message ?? msg;
         } catch {}
         setError(msg);
      } finally {
         setLoading(false);
      }
   };

   if (submitted) {
      return (
         <div className="space-y-5 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30">
               <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div>
               <h2 className="text-xl font-semibold text-white mb-2">
                  Check your email
               </h2>
               <p className="text-slate-400 text-sm">
                  If an account exists for{' '}
                  <span className="text-slate-300">{email}</span>, we've sent a
                  link to reset your password. It expires in 30 minutes.
               </p>
            </div>
            <Link
               href="/login"
               className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand-hover transition-colors font-medium"
            >
               <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
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
            <label
               htmlFor="email"
               className="block text-sm font-medium text-slate-300"
            >
               Email Address
            </label>
            <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all"
               />
            </div>
         </div>

         <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
         >
            {loading ? (
               <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
               </span>
            ) : (
               <>
                  Send Reset Link
                  <ArrowRight className="w-5 h-5" />
               </>
            )}
         </button>

         <p className="text-center text-sm text-slate-500">
            <Link
               href="/login"
               className="inline-flex items-center gap-1 text-brand hover:text-brand-hover transition-colors font-medium"
            >
               <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
         </p>
      </form>
   );
}
