'use client';

import { useState, useEffect } from 'react';
import {
   Check,
   Sparkles,
   Zap,
   Crown,
   Shield,
   Clock,
   CreditCard,
   HelpCircle,
   Star,
   Loader2,
   ChevronDown,
   Tv,
   BarChart2,
   Users,
   Headphones,
   X,
} from 'lucide-react';
import { createCheckoutSession } from '@/shared/api/billing';
import { useRouter } from 'next/navigation';
import { getToken } from '@/shared/api/base';
import { useSearchParams } from 'next/navigation';
import { ScrollToTop } from '@/shared/ui/ScrollToTop';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
   left: `${(i * 5.3) % 100}%`,
   top: `${(i * 7.1) % 100}%`,
   duration: `${5 + (i % 10)}s`,
   delay: `${i % 5}s`,
}));

const FAQS = [
   {
      question: 'Can I cancel anytime?',
      answer:
         "Yes, you can cancel your subscription at any time with no questions asked. You'll continue to have full premium access until the end of your current billing period.",
   },
   {
      question: 'Is there a free trial?',
      answer:
         'Yes! New Flacron GameZone users get 7 days of premium access completely free. Experience all premium features with no credit card required to start your trial.',
   },
   {
      question: 'What payment methods are accepted?',
      answer:
         'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and popular digital wallets through our secure Stripe payment gateway.',
   },
   {
      question: 'Can I upgrade or downgrade anytime?',
      answer:
         "Absolutely! You can change your plan at any time from your dashboard. Changes take effect immediately, and we'll prorate any charges.",
   },
   {
      question: 'Do you offer student or team discounts?',
      answer:
         'Yes! We offer special pricing for students (with valid .edu email) and team subscriptions. Contact our support team at billing@flacrongamezone.com for custom pricing.',
   },
];

const PREMIUM_GROUPS = [
   {
      label: 'Streaming',
      icon: <Tv className="w-4 h-4 text-brand" />,
      features: ['Live tournament streaming in HD'],
   },
   {
      label: 'Analysis',
      icon: <BarChart2 className="w-4 h-4 text-brand" />,
      features: [
         'AI-powered match analysis & predictions',
         'Advanced AI preview',
      ],
   },
   {
      label: 'Matchmaking',
      icon: <Users className="w-4 h-4 text-brand" />,
      features: ['Priority matchmaking queue', 'Exclusive premium tournaments'],
   },
   {
      label: 'Support',
      icon: <Headphones className="w-4 h-4 text-green-400" />,
      features: ['24/7 priority support'],
   },
];

export function PricingClient() {
   const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
      'monthly'
   );
   const [loading, setLoading] = useState<string | null>(null);
   const [mounted, setMounted] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [openFaq, setOpenFaq] = useState<number | null>(0);
   const router = useRouter();
   const searchParams = useSearchParams();

   const monthlyPrice = 47.99;
   const yearlyPrice = +(monthlyPrice * 12 * 0.83).toFixed(2);
   const yearlyMonthlyEquivalent = (yearlyPrice / 12).toFixed(2);
   const yearlySavings = (monthlyPrice * 12 - yearlyPrice).toFixed(2);

   useEffect(() => {
      setMounted(true);
   }, []);

   useEffect(() => {
      if (!mounted) return;
      const timeoutId = setTimeout(() => {
         if (searchParams?.get('scroll') === 'faq') {
            document
               .getElementById('faq-section')
               ?.scrollIntoView({ behavior: 'smooth' });
         }
      }, 600);
      return () => clearTimeout(timeoutId);
   }, [searchParams, mounted]);

   const handleCheckout = async (plan: 'free' | 'premium') => {
      const token = getToken();
      if (!token) {
         router.push('/login?redirect=/pricing');
         return;
      }
      if (plan === 'free') {
         router.push('/dashboard');
         return;
      }
      try {
         setLoading(plan);
         setError(null);
         const { url } = await createCheckoutSession(billingCycle);
         if (!url) throw new Error('Invalid checkout URL received');
         window.location.href = url;
      } catch (error: any) {
         console.error('Checkout failed:', error);
         setError(
            error.message || 'Failed to start checkout. Please try again.'
         );
         setLoading(null);
      }
   };

   return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
         <ScrollToTop />

         {/* Background blobs */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
               className="absolute top-20 left-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '4s' }}
            />
            <div
               className="absolute bottom-20 right-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '6s', animationDelay: '1s' }}
            />
            <div
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '8s', animationDelay: '2s' }}
            />
         </div>

         {/* Particles */}
         <div className="absolute inset-0 pointer-events-none">
            {PARTICLES.map((p, i) => (
               <div
                  key={i}
                  className="absolute w-1 h-1 bg-brand/20 rounded-full"
                  style={{
                     left: p.left,
                     top: p.top,
                     animation: `float ${p.duration} ease-in-out infinite`,
                     animationDelay: p.delay,
                  }}
               />
            ))}
         </div>

         <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
            {/* Header */}
            <div
               className={`text-center mb-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
               <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 rounded-full px-4 py-2 mb-6">
                  <Crown className="w-4 h-4 text-brand" />
                  <span className="text-sm text-brand font-semibold">
                     Premium Football Experience
                  </span>
               </div>
               <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand-light via-brand to-brand-hover bg-clip-text text-transparent animate-gradient">
                  Choose Your Plan
               </h1>
               <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Start free or unlock full access to live matches, AI analysis,
                  and everything football.
               </p>
            </div>

            {/* Error */}
            {error && (
               <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center flex items-center justify-between gap-4">
                  <p className="text-red-400">{error}</p>
                  <button
                     onClick={() => setError(null)}
                     className="text-red-400 hover:text-red-300 flex-shrink-0"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>
            )}

            {/* Billing Toggle */}
            <div
               className={`flex justify-center mb-12 transition-all duration-1000 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
               <div className="inline-flex flex-col items-center gap-3">
                  <div className="inline-flex items-center bg-slate-800/80 border border-slate-700/50 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 backdrop-blur-xl shadow-xl gap-1 sm:gap-2">
                     <button
                        onClick={() => setBillingCycle('monthly')}
                        disabled={loading !== null}
                        className={`px-5 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                           billingCycle === 'monthly'
                              ? 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                        }`}
                     >
                        Monthly
                     </button>
                     <button
                        onClick={() => setBillingCycle('yearly')}
                        disabled={loading !== null}
                        className={`px-5 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                           billingCycle === 'yearly'
                              ? 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                        }`}
                     >
                        Yearly
                     </button>
                  </div>
                  <div
                     className={`text-sm font-medium transition-all duration-300 ${billingCycle === 'yearly' ? 'text-green-400' : 'text-slate-500'}`}
                  >
                     {billingCycle === 'yearly'
                        ? `🎉 You're saving $${yearlySavings}/year (17% off)`
                        : 'Switch to yearly and save 17%'}
                  </div>
               </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16">
               {/* Free Plan */}
               <div
                  className={`relative group transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
               >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
                  <div className="relative bg-gradient-to-b from-navy/95 to-navy-dark/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                           <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-bold text-white">
                              Free
                           </h2>
                           <p className="text-sm text-slate-400">
                              Basic access, no commitment
                           </p>
                        </div>
                     </div>

                     <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                           <span className="text-5xl font-bold text-white">
                              $0
                           </span>
                           <span className="text-slate-400">/month</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                           Free forever — no credit card needed
                        </p>
                     </div>

                     <button
                        onClick={() => handleCheckout('free')}
                        disabled={loading === 'free'}
                        className="w-full py-3 px-6 rounded-xl border-2 border-slate-600 text-white font-semibold hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {loading === 'free'
                           ? 'Processing...'
                           : 'Get Started Free'}
                     </button>

                     <div className="space-y-3 flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                           What's included
                        </p>
                        {[
                           'Browse game lobbies & tournaments',
                           'Basic player statistics',
                           'Match score updates',
                           'Community chat access',
                           'Standard matchmaking',
                        ].map((feature, index) => (
                           <div
                              key={index}
                              className="flex items-center gap-3 text-slate-300"
                           >
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                 <Check className="w-3 h-3 text-green-400" />
                              </div>
                              <span className="text-sm">{feature}</span>
                           </div>
                        ))}
                        {[
                           'HD live streaming',
                           'AI match analysis',
                           'Advanced stats',
                        ].map((missing, i) => (
                           <div
                              key={i}
                              className="flex items-center gap-3 text-slate-600"
                           >
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700/50 flex items-center justify-center">
                                 <X className="w-3 h-3 text-slate-600" />
                              </div>
                              <span className="text-sm line-through">
                                 {missing}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Premium Plan */}
               <div
                  className={`relative group transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
               >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                     <div className="bg-gradient-to-r from-brand to-brand-dark text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        MOST POPULAR
                     </div>
                  </div>

                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-brand-dark rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
                  <div className="relative bg-gradient-to-b from-navy/95 to-navy-dark/95 backdrop-blur-2xl border-2 border-brand/50 rounded-2xl p-8 shadow-2xl shadow-brand/20 hover:shadow-brand/30 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                     <div className="flex items-center gap-3 mb-4 mt-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg relative">
                           <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand to-brand-dark blur-md opacity-50" />
                           <Sparkles className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-bold text-white">
                              Premium
                           </h2>
                           <p className="text-sm text-brand font-medium">
                              Best for serious football fans
                           </p>
                        </div>
                     </div>

                     <div className="mb-2">
                        <div className="flex items-baseline gap-2">
                           <span className="text-5xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                              $
                              {billingCycle === 'monthly'
                                 ? monthlyPrice.toFixed(2)
                                 : yearlyMonthlyEquivalent}
                           </span>
                           <span className="text-slate-400">/month</span>
                        </div>
                        <div className="mt-2 text-sm">
                           {billingCycle === 'monthly' ? (
                              <span className="text-slate-500">
                                 ${monthlyPrice.toFixed(2)} billed monthly
                              </span>
                           ) : (
                              <span className="text-green-400 flex items-center gap-1">
                                 <Sparkles className="w-3 h-3" />${yearlyPrice}
                                 /year — save ${yearlySavings} (17% off)
                              </span>
                           )}
                        </div>
                     </div>

                     <p className="text-slate-400 text-sm mb-5 mt-1">
                        🏆 Full access to live matches, AI analytics & priority
                        features
                     </p>

                     <button
                        onClick={() => handleCheckout('premium')}
                        disabled={loading === 'premium'}
                        className="relative w-full group/btn overflow-hidden mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-dark rounded-xl" />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-dark rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
                           {loading === 'premium' ? (
                              <>
                                 <Loader2 className="w-5 h-5 animate-spin" />
                                 <span>Redirecting to checkout...</span>
                              </>
                           ) : (
                              <>
                                 <Crown className="w-5 h-5" />
                                 <span>Get Premium Access</span>
                              </>
                           )}
                        </div>
                     </button>

                     <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mb-6">
                        <span className="flex items-center gap-1">
                           <Shield className="w-3 h-3" /> Secure payment
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                           <Clock className="w-3 h-3" /> Cancel anytime
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                           <Sparkles className="w-3 h-3" /> 7-day free trial
                        </span>
                     </div>

                     <div className="space-y-5 flex-1">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-700/50">
                           <Check className="w-4 h-4 text-brand flex-shrink-0" />
                           <span className="text-white text-sm font-semibold">
                              Everything in Free, plus:
                           </span>
                        </div>
                        {PREMIUM_GROUPS.map((group) => (
                           <div key={group.label}>
                              <div className="flex items-center gap-2 mb-2">
                                 {group.icon}
                                 <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {group.label}
                                 </span>
                              </div>
                              <div className="space-y-2 pl-1">
                                 {group.features.map((f) => (
                                    <div
                                       key={f}
                                       className="flex items-center gap-3 text-slate-300"
                                    >
                                       <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-brand/20 to-brand-dark/20 flex items-center justify-center">
                                          <Check className="w-3 h-3 text-brand" />
                                       </div>
                                       <span className="text-sm">{f}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* FAQ — Accordion */}
            <div
               id="faq-section"
               className={`max-w-3xl mx-auto transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
               <h2 className="text-3xl font-bold text-center mb-8 text-white flex items-center justify-center gap-3">
                  <HelpCircle className="w-8 h-8 text-brand" />
                  Frequently Asked Questions
               </h2>
               <div className="space-y-3">
                  {FAQS.map((faq, index) => (
                     <div
                        key={index}
                        className={`bg-slate-800/50 backdrop-blur-xl border rounded-xl overflow-hidden transition-all duration-300 ${
                           openFaq === index
                              ? 'border-brand/40'
                              : 'border-slate-700/50 hover:border-slate-600/60'
                        }`}
                     >
                        <button
                           onClick={() =>
                              setOpenFaq(openFaq === index ? null : index)
                           }
                           className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                        >
                           <span
                              className={`font-semibold text-base transition-colors duration-200 ${openFaq === index ? 'text-brand' : 'text-white'}`}
                           >
                              {faq.question}
                           </span>
                           <ChevronDown
                              className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-brand' : ''}`}
                           />
                        </button>
                        <div
                           className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                           <p className="px-6 pb-5 text-slate-400 text-sm leading-relaxed">
                              {faq.answer}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Trust Indicators */}
            <div
               className={`mt-16 text-center transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
               <p className="text-slate-500 text-sm mb-6">
                  Trusted by over 50,000 Football Fans worldwide
               </p>
               <div className="flex justify-center gap-8 items-center flex-wrap">
                  <div className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors group">
                     <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-5 h-5 text-green-400" />
                     </div>
                     <span className="text-sm font-medium">
                        Secure Payments
                     </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors group">
                     <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5 text-brand" />
                     </div>
                     <span className="text-sm font-medium">Cancel Anytime</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors group">
                     <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard className="w-5 h-5 text-brand" />
                     </div>
                     <span className="text-sm font-medium">
                        Money-back Guarantee
                     </span>
                  </div>
               </div>
            </div>
         </div>

         <style jsx>{`
            @keyframes float {
               0%,
               100% {
                  transform: translateY(0px) translateX(0px);
               }
               50% {
                  transform: translateY(-20px) translateX(10px);
               }
            }
            @keyframes gradient {
               0%,
               100% {
                  background-position: 0% 50%;
               }
               50% {
                  background-position: 100% 50%;
               }
            }
            .animate-gradient {
               background-size: 200% auto;
               animation: gradient 3s ease infinite;
            }
         `}</style>
      </div>
   );
}
