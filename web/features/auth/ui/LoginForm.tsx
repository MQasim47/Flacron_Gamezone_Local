'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { login } from '../api/authApi';
import { useAuth } from '@/shared/hooks';
import { GoogleAuthButton } from './GoogleAuthButton';

interface FormErrors {
   email?: string;
   password?: string;
   general?: string;
}

export function LoginForm() {
   const router = useRouter();
   const { login: storeLogin } = useAuth();

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [errors, setErrors] = useState<FormErrors>({});
   const [loading, setLoading] = useState(false);

   const validate = (): FormErrors => {
      const errs: FormErrors = {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
         errs.email = 'Please enter a valid email address.';
      if (!password || password.length < 6)
         errs.password = 'Password must be at least 6 characters.';
      return errs;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});
      const errs = validate();
      if (Object.keys(errs).length > 0) {
         setErrors(errs);
         return;
      }

      try {
         setLoading(true);
         const data = await login(email, password);
         storeLogin(data.token, data.user);
         router.replace('/');
      } catch (err: any) {
         let msg = 'An error occurred. Please try again.';
         try {
            msg = JSON.parse(err.message)?.error ?? err.message ?? msg;
         } catch {}
         setErrors({ general: msg });
      } finally {
         setLoading(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
         {errors.general && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-2 text-sm">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               {errors.general}
            </div>
         )}

         <GoogleAuthButton onError={(msg) => setErrors({ general: msg })} />

         <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="flex-1 h-px bg-slate-700/50" />
         </div>

         {/* Email */}
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
                  aria-invalid={!!errors.email}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all"
               />
            </div>
            {errors.email && (
               <p
                  className="text-sm text-red-400 flex items-center gap-1"
                  role="alert"
               >
                  <AlertCircle className="w-4 h-4" /> {errors.email}
               </p>
            )}
         </div>

         {/* Password */}
         <div className="space-y-1.5">
            <div className="flex items-center justify-between">
               <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
               >
                  Password
               </label>
               <Link
                  href="/forgot-password"
                  className="text-xs text-brand hover:text-brand-hover transition-colors font-medium"
               >
                  Forgot password?
               </Link>
            </div>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all"
               />
               <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
               >
                  {showPassword ? (
                     <EyeOff className="w-5 h-5" />
                  ) : (
                     <Eye className="w-5 h-5" />
                  )}
               </button>
            </div>
            {errors.password && (
               <p
                  className="text-sm text-red-400 flex items-center gap-1"
                  role="alert"
               >
                  <AlertCircle className="w-4 h-4" /> {errors.password}
               </p>
            )}
         </div>

         {/* Submit */}
         <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
         >
            {loading ? (
               <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
               </span>
            ) : (
               <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
               </>
            )}
         </button>

         <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
               href="/signup"
               className="text-brand hover:text-brand-hover transition-colors font-medium"
            >
               Create one
            </Link>
         </p>
      </form>
   );
}
