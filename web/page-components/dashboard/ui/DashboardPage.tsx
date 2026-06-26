'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
   Crown,
   Calendar,
   CreditCard,
   AlertCircle,
   CheckCircle,
   Loader2,
   ExternalLink,
   Zap,
   Shield,
   Star,
   Play,
   TrendingUp,
   Sparkles,
   Trophy,
   ChevronRight,
   Search,
   Users,
} from 'lucide-react';
import { useSubscription } from '@/shared/hooks';
import { useBillingActions } from '@/features/billing/hooks/useBillingActions';
import { DeleteConfirmModal } from '@/shared/ui/DeleteConfirmModal';
import Link from 'next/link';

const PREMIUM_FEATURES = [
   {
      icon: Play,
      label: 'Live HD Streaming',
      color: 'from-brand to-brand-dark',
   },
   {
      icon: Sparkles,
      label: 'AI Match Analysis',
      color: 'from-violet-500 to-purple-500',
   },
   {
      icon: TrendingUp,
      label: 'Advanced Statistics',
      color: 'from-emerald-500 to-brand',
   },
   {
      icon: Shield,
      label: 'Ad-Free Experience',
      color: 'from-pink-500 to-rose-500',
   },
   {
      icon: Zap,
      label: 'Priority Support',
      color: 'from-amber-500 to-orange-500',
   },
   {
      icon: Star,
      label: 'Custom Profiles',
      color: 'from-brand to-violet-500',
   },
];

const FREE_FEATURES = [
   {
      icon: Play,
      label: 'Match Browsing',
      color: 'from-slate-500 to-slate-600',
   },
   {
      icon: TrendingUp,
      label: 'Basic Statistics',
      color: 'from-slate-500 to-slate-600',
   },
   { icon: Zap, label: 'Score Updates', color: 'from-slate-500 to-slate-600' },
];

const QUICK_ACTIONS = [
   {
      label: 'Search',
      desc: 'Find leagues, teams & matches',
      icon: Search,
      href: null,
      action: 'search',
      gradient: 'from-brand to-brand-dark',
   },
   {
      label: 'Live Matches',
      desc: "Watch what's on right now",
      icon: Play,
      href: '/live',
      action: null,
      gradient: 'from-red-600 to-orange-500',
   },
   {
      label: 'Leagues',
      desc: 'Browse all competitions',
      icon: Trophy,
      href: '/leagues',
      action: null,
      gradient: 'from-yellow-500 to-amber-500',
   },
   {
      label: 'Matches',
      desc: 'Upcoming & finished games',
      icon: Calendar,
      href: '/matches',
      action: null,
      gradient: 'from-purple-600 to-pink-500',
   },
];

function StatusBadge({ status }: { status: string }) {
   if (status === 'active')
      return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            ACTIVE
         </span>
      );
   if (status === 'past_due')
      return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            PAST DUE
         </span>
      );
   if (status === 'canceled')
      return (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-600/80 text-slate-200 border border-slate-600/30">
            CANCELED
         </span>
      );
   return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
         INACTIVE
      </span>
   );
}

export default function DashboardPage() {
   const router = useRouter();
   const { subscription, loading, isPremium } = useSubscription();
   const billing = useBillingActions();
   const [showCancel, setShowCancel] = useState(false);

   const features = isPremium ? PREMIUM_FEATURES : FREE_FEATURES;
   const isActive = subscription?.status === 'active';
   const isPastDue = subscription?.status === 'past_due';
   const isCanceled = subscription?.status === 'canceled';
   const hasPlan = !!subscription?.plan;

   if (loading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
         </div>
      );
   }

   return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
         <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand/30 to-purple-900/30 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
               <div className="absolute top-0 right-0 w-72 h-72 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
               <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="max-w-xl">
                     <div
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 border text-sm font-semibold ${isActive ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-700/50 border-slate-600/30 text-slate-400'}`}
                     >
                        <span
                           className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
                        />
                        {isActive ? 'Premium Active' : 'Free Plan'}
                     </div>
                     <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-brand to-purple-300 bg-clip-text text-transparent">
                        Account Dashboard
                     </h1>
                     <p className="text-slate-300">
                        Manage your subscription, billing, and account
                        preferences.
                     </p>
                  </div>
               </div>
               <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-brand via-purple-500 to-pink-500" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  const inner = (
                     <div
                        className={`group bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/40 hover:border-slate-600/60 rounded-xl p-4 transition-all hover:scale-[1.03] cursor-pointer h-full`}
                     >
                        <div
                           className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform`}
                        >
                           <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white font-bold text-sm">
                           {action.label}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                           {action.desc}
                        </p>
                     </div>
                  );
                  if (action.href)
                     return (
                        <Link
                           key={action.label}
                           href={action.href}
                           className="h-full"
                        >
                           {inner}
                        </Link>
                     );
                  return (
                     <button
                        key={action.label}
                        className="text-left h-full"
                        onClick={() =>
                           window.dispatchEvent(
                              new CustomEvent('fgz:open-search')
                           )
                        }
                     >
                        {inner}
                     </button>
                  );
               })}
            </div>

            {/* Notifications */}
            {billing.success && (
               <div className="flex items-center gap-3 bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {billing.success}
               </div>
            )}
            {billing.error && (
               <div className="flex items-center gap-3 bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {billing.error}
               </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
               {/* Subscription Card */}
               <div className="lg:col-span-3 bg-slate-900/90 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center shadow-lg relative">
                           <Crown className="w-6 h-6 text-white" />
                           {isActive && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                           )}
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-white">
                              {hasPlan
                                 ? `${subscription!.plan!.charAt(0).toUpperCase() + subscription!.plan!.slice(1)} Plan`
                                 : 'Free Plan'}
                           </h2>
                           <p className="text-xs text-slate-500">
                              Current subscription
                           </p>
                        </div>
                     </div>
                     <StatusBadge status={subscription?.status || 'inactive'} />
                  </div>

                  {hasPlan && (
                     <div className="space-y-2 mb-6">
                        {[
                           {
                              icon: CreditCard,
                              label: 'Billing Cycle',
                              value: subscription!.plan,
                           },
                           subscription!.currentPeriodEnd
                              ? {
                                   icon: Calendar,
                                   label: subscription!.cancelAtPeriodEnd
                                      ? 'Access Until'
                                      : 'Next Billing',
                                   value: new Date(
                                      subscription!.currentPeriodEnd
                                   ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                   }),
                                }
                              : null,
                        ]
                           .filter(Boolean)
                           .map((item, i) => {
                              const { icon: Icon, label, value } = item as any;
                              return (
                                 <div
                                    key={i}
                                    className="flex items-center justify-between bg-slate-800/70 border border-slate-600/30 rounded-lg px-4 py-3"
                                 >
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                       <Icon className="w-4 h-4" />
                                       {label}
                                    </div>
                                    <span className="text-white text-sm font-bold capitalize">
                                       {value}
                                    </span>
                                 </div>
                              );
                           })}
                        {subscription!.cancelAtPeriodEnd && (
                           <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/40 rounded-lg px-4 py-3 text-amber-400 text-sm">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              Subscription set to cancel at end of billing
                              period.
                           </div>
                        )}
                     </div>
                  )}

                  {!hasPlan && (
                     <div className="mb-6 bg-brand/20 border border-brand/40 rounded-xl p-5">
                        <p className="text-slate-300 text-sm mb-4">
                           Upgrade to Premium to unlock live streaming, AI
                           analysis, and more.
                        </p>
                        <button
                           onClick={() => router.push('/pricing')}
                           className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-white font-bold px-5 py-3 rounded-lg shadow-lg transition-all hover:scale-[1.02]"
                        >
                           <Sparkles className="w-4 h-4" /> View Premium Plans
                        </button>
                     </div>
                  )}

                  {hasPlan && (isActive || isPastDue) && (
                     <div className="space-y-3">
                        <button
                           onClick={() => router.push('/pricing')}
                           className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-white font-bold px-5 py-3 rounded-lg shadow-lg transition-all hover:scale-[1.02]"
                        >
                           <Crown className="w-4 h-4" /> Upgrade / Change Plan{' '}
                           <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="flex gap-3">
                           <button
                              onClick={billing.portal}
                              disabled={billing.loading !== null}
                              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 rounded-lg px-4 py-3 text-sm font-semibold text-slate-200 transition-all disabled:opacity-50"
                           >
                              {billing.loading === 'portal' ? (
                                 <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                 <>
                                    <ExternalLink className="w-4 h-4" /> Manage
                                    Billing
                                 </>
                              )}
                           </button>
                           {subscription!.cancelAtPeriodEnd ? (
                              <button
                                 onClick={() => billing.reactivate()}
                                 disabled={billing.loading !== null}
                                 className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg px-4 py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
                              >
                                 {billing.loading === 'reactivate' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                 ) : (
                                    <>
                                       <Zap className="w-4 h-4" /> Reactivate
                                    </>
                                 )}
                              </button>
                           ) : (
                              <button
                                 onClick={() => setShowCancel(true)}
                                 disabled={billing.loading !== null}
                                 className="flex-1 flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-700/50 border border-red-700/40 rounded-lg px-4 py-3 text-sm font-semibold text-red-300 hover:text-white transition-all disabled:opacity-50"
                              >
                                 Cancel Plan
                              </button>
                           )}
                        </div>
                     </div>
                  )}

                  {hasPlan && isCanceled && (
                     <button
                        onClick={() => router.push('/pricing')}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-white font-bold px-5 py-3 rounded-lg shadow-lg transition-all hover:scale-[1.02]"
                     >
                        <Crown className="w-4 h-4" /> Resubscribe{' '}
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  )}
               </div>

               {/* Features */}
               <div className="lg:col-span-2 bg-slate-900/90 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                     <Trophy className="w-4 h-4 text-yellow-500" />
                     <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {isActive ? 'Premium' : 'Free'} Features
                     </span>
                  </div>
                  <ul className="space-y-2">
                     {features.map(({ icon: Icon, label, color }, i) => (
                        <li
                           key={i}
                           className="group flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg px-3 py-2.5 transition-all"
                        >
                           <div
                              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0`}
                           >
                              <Icon className="w-3.5 h-3.5 text-white" />
                           </div>
                           <span className="text-slate-400 group-hover:text-slate-200 text-sm font-medium transition-colors flex-1">
                              {label}
                           </span>
                           <CheckCircle className="w-3.5 h-3.5 text-emerald-500/50 group-hover:text-emerald-400 shrink-0" />
                        </li>
                     ))}
                  </ul>
                  {!isActive && (
                     <button
                        onClick={() => router.push('/pricing')}
                        className="mt-5 w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-purple-600/20 border border-slate-600/50 hover:border-purple-500/50 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-all"
                     >
                        <Sparkles className="w-4 h-4" /> Unlock all features{' '}
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  )}
               </div>
            </div>
         </div>

         <DeleteConfirmModal
            isOpen={showCancel}
            title="Cancel subscription"
            message="Are you sure? Your access continues until end of billing period."
            confirmLabel="Cancel Subscription"
            confirmVariant="warning"
            onConfirm={async () => {
               await billing.cancel();
               setShowCancel(false);
            }}
            onCancel={() => setShowCancel(false)}
            isDeleting={billing.loading === 'cancel'}
         />
      </div>
   );
}
