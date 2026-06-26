'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
   Mail,
   Lock,
   Eye,
   EyeOff,
   CheckCircle2,
   ArrowRight,
   AlertCircle,
   Shield,
} from 'lucide-react';
import { signup } from '../api/authApi';
import { useAuth } from '@/shared/hooks';
import { GoogleAuthButton } from './GoogleAuthButton';

interface FormErrors {
   email?: string;
   password?: string;
   confirmPassword?: string;
   terms?: string;
   general?: string;
}

function getStrength(password: string): number {
   let s = 0;
   if (password.length >= 6) s++;
   if (password.length >= 10) s++;
   if (/[A-Z]/.test(password)) s++;
   if (/[0-9]/.test(password)) s++;
   if (/[^A-Za-z0-9]/.test(password)) s++;
   return s;
}

export function SignupForm() {
   const router = useRouter();
   const { login: storeLogin } = useAuth();

   const [form, setForm] = useState({
      email: '',
      password: '',
      confirmPassword: '',
   });
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirm, setShowConfirm] = useState(false);
   const [agreed, setAgreed] = useState(false);
   const [errors, setErrors] = useState<FormErrors>({});
   const [loading, setLoading] = useState(false);
   const [strength, setStrength] = useState(0);

   useEffect(() => {
      setStrength(getStrength(form.password));
   }, [form.password]);

   const set = (key: keyof typeof form, value: string) =>
      setForm((f) => ({ ...f, [key]: value }));

   const validate = (): FormErrors => {
      const errs: FormErrors = {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
         errs.email = 'Please enter a valid email address.';
      if (form.password.length < 6)
         errs.password = 'Password must be at least 6 characters.';
      if (form.password !== form.confirmPassword)
         errs.confirmPassword = 'Passwords do not match.';
      if (!agreed) errs.terms = 'You must agree to the Terms of Service.';
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
         const data = await signup(form.email, form.password);
         storeLogin(data.token, data.user);
         router.replace('/');
      } catch (err: any) {
         let msg = 'Something went wrong. Please try again.';
         try {
            msg = JSON.parse(err.message)?.error ?? err.message ?? msg;
         } catch {}
         setErrors({ general: msg });
      } finally {
         setLoading(false);
      }
   };

   const strengthColor =
      strength <= 1
         ? 'bg-red-500'
         : strength <= 3
           ? 'bg-yellow-500'
           : 'bg-green-500';
   const strengthText =
      strength <= 1 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong';

   return (
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            <label className="block text-sm font-medium text-slate-300">
               Email Address
            </label>
            <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
               />
            </div>
            {errors.email && (
               <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.email}
               </p>
            )}
         </div>

         {/* Password */}
         <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
               Password
            </label>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
               />
               <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
               >
                  {showPassword ? (
                     <EyeOff className="w-5 h-5" />
                  ) : (
                     <Eye className="w-5 h-5" />
                  )}
               </button>
            </div>
            {form.password && (
               <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400">Password strength</span>
                     <span
                        className={
                           strength <= 1
                              ? 'text-red-400'
                              : strength <= 3
                                ? 'text-yellow-400'
                                : 'text-green-400'
                        }
                     >
                        {strengthText}
                     </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                     <div
                        className={`h-full ${strengthColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                     />
                  </div>
               </div>
            )}
            {errors.password && (
               <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.password}
               </p>
            )}
         </div>

         {/* Confirm Password */}
         <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
               Confirm Password
            </label>
            <div className="relative">
               <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
               />
               <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
               >
                  {showConfirm ? (
                     <EyeOff className="w-5 h-5" />
                  ) : (
                     <Eye className="w-5 h-5" />
                  )}
               </button>
            </div>
            {errors.confirmPassword && (
               <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
               </p>
            )}
         </div>

         {/* Terms */}
         <div className="space-y-1">
            <label className="flex items-start gap-3 cursor-pointer">
               <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-purple-500 cursor-pointer"
               />
               <span className="text-sm text-slate-400 select-none">
                  I agree to the{' '}
                  <Link
                     href="/terms"
                     className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                  >
                     Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                     href="/privacy"
                     className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                  >
                     Privacy Policy
                  </Link>
               </span>
            </label>
            {errors.terms && (
               <p className="text-sm text-red-400 ml-7 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.terms}
               </p>
            )}
         </div>

         {/* Submit */}
         <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
         >
            {loading ? (
               <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account…
               </span>
            ) : (
               <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
               </>
            )}
         </button>

         <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3 h-3" />
            Protected by industry-standard encryption
         </div>

         <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
               href="/login"
               className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
               Sign in
            </Link>
         </p>
      </form>
   );
}
