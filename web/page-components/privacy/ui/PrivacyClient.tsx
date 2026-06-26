'use client';

import Link from 'next/link';
import {
   Shield,
   Eye,
   Lock,
   Database,
   Share2,
   UserCheck,
   Bell,
   Globe,
   Mail,
   ChevronRight,
   FileText,
   ChevronLeft,
} from 'lucide-react';
// TODO: Update Privacy Email
const LAST_UPDATED_DATE = 'February 27, 2026';
const PRIVACY_EMAIL = 'privacy@youractualdomain.com';

const sections = [
   {
      id: 'information-we-collect',
      icon: Database,
      title: 'Information We Collect',
      gradient: 'from-brand to-brand-dark',
      border: 'border-brand/30',
      glow: 'rgba(6,182,212,0.15)',
      content: [
         {
            subtitle: 'Account Information',
            text: 'When you register, we collect your email address, username, and encrypted password. If you subscribe to a paid plan, billing details are handled securely by our payment processor (Stripe) and we never store your full card information.',
         },
         {
            subtitle: 'Usage Data',
            text: 'We automatically collect information about how you interact with our platform — pages visited, matches watched, features used, and session duration. This helps us improve your experience and troubleshoot issues.',
         },
         {
            subtitle: 'Device & Technical Data',
            text: 'We collect your IP address, browser type, operating system, and device identifiers to ensure platform security and deliver region-appropriate content.',
         },
      ],
   },
   {
      id: 'how-we-use',
      icon: Eye,
      title: 'How We Use Your Information',
      gradient: 'from-brand to-brand-dark',
      border: 'border-brand/30',
      glow: 'rgba(59,130,246,0.15)',
      content: [
         {
            subtitle: 'Service Delivery',
            text: 'Your information is used to provide, maintain, and improve our live match streaming, AI-generated previews and summaries, real-time scores, and all other core features of the platform.',
         },
         {
            subtitle: 'Personalization',
            text: 'We use your viewing history and preferences to recommend matches, leagues, and teams relevant to you — creating a tailored experience every time you visit.',
         },
         {
            subtitle: 'Communications',
            text: 'We may send you service-related emails (account confirmations, subscription receipts, security alerts). With your consent, we may also send product updates and promotional content, from which you can unsubscribe at any time.',
         },
      ],
   },
   {
      id: 'data-sharing',
      icon: Share2,
      title: 'Data Sharing & Third Parties',
      gradient: 'from-purple-600 to-pink-600',
      border: 'border-purple-500/30',
      glow: 'rgba(168,85,247,0.15)',
      content: [
         {
            subtitle: 'We Do Not Sell Your Data',
            text: 'We never sell, rent, or trade your personal information to third parties for marketing purposes. Your data is not a product.',
         },
         {
            subtitle: 'Service Providers',
            text: 'We share limited data with trusted service providers who help us operate the platform — including Stripe (payments), Neon (database infrastructure), and Vercel (hosting). These partners are contractually obligated to protect your data.',
         },
         {
            subtitle: 'Legal Requirements',
            text: 'We may disclose your information if required by law, court order, or governmental authority, or to protect the rights, property, or safety of our users and the public.',
         },
      ],
   },
   {
      id: 'data-security',
      icon: Lock,
      title: 'Data Security',
      gradient: 'from-green-600 to-emerald-600',
      border: 'border-green-500/30',
      glow: 'rgba(34,197,94,0.15)',
      content: [
         {
            subtitle: 'Encryption',
            text: 'All data transmitted between your browser and our servers is encrypted using industry-standard TLS (Transport Layer Security). Passwords are hashed using bcrypt and are never stored in plain text.',
         },
         {
            subtitle: 'Access Controls',
            text: 'Access to personal data is strictly limited to authorized personnel who require it to operate and improve the service. We maintain detailed access logs and conduct regular security reviews.',
         },
         {
            subtitle: 'Breach Notification',
            text: 'In the unlikely event of a data breach that affects your personal information, we will notify you within 72 hours of becoming aware, in accordance with applicable data protection regulations.',
         },
      ],
   },
   {
      id: 'your-rights',
      icon: UserCheck,
      title: 'Your Rights & Choices',
      gradient: 'from-orange-600 to-red-600',
      border: 'border-orange-500/30',
      glow: 'rgba(249,115,22,0.15)',
      content: [
         {
            subtitle: 'Access & Portability',
            text: 'You have the right to request a copy of the personal data we hold about you at any time. We will provide this in a structured, machine-readable format within 30 days.',
         },
         {
            subtitle: 'Correction & Deletion',
            text: 'You may update your account information at any time through your profile settings. You may also request the permanent deletion of your account and all associated data by contacting our support team.',
         },
         {
            subtitle: 'Opt-Out',
            text: 'You can opt out of marketing communications at any time via the unsubscribe link in any email or through your notification preferences in account settings.',
         },
      ],
   },
   {
      id: 'cookies',
      icon: Globe,
      title: 'Cookies & Tracking',
      gradient: 'from-brand to-brand',
      border: 'border-brand/30',
      glow: 'rgba(6,182,212,0.15)',
      content: [
         {
            subtitle: 'Essential Cookies',
            text: 'We use strictly necessary cookies to maintain your session, remember your login state, and ensure the platform functions correctly. These cannot be disabled as they are essential to the service.',
         },
         {
            subtitle: 'Analytics Cookies',
            text: 'With your consent, we use analytics cookies to understand how users interact with the platform. This data is aggregated and anonymized — it helps us improve performance and user experience.',
         },
         {
            subtitle: 'Managing Cookies',
            text: 'You can control cookie preferences through your browser settings. Note that disabling certain cookies may affect platform functionality.',
         },
      ],
   },
   {
      id: 'data-retention',
      icon: FileText,
      title: 'Data Retention',
      gradient: 'from-slate-600 to-slate-500',
      border: 'border-slate-500/30',
      glow: 'rgba(100,116,139,0.15)',
      content: [
         {
            subtitle: 'Active Accounts',
            text: 'We retain your personal data for as long as your account remains active or as needed to provide you with our services.',
         },
         {
            subtitle: 'Account Deletion',
            text: 'Upon account deletion, your personal data is permanently removed from our systems within 30 days, except where retention is required by law (e.g. financial records for tax compliance, which may be retained for up to 7 years).',
         },
         {
            subtitle: 'Anonymized Data',
            text: 'Aggregated, anonymized usage data may be retained indefinitely for analytics and platform improvement purposes, as it cannot be linked back to any individual.',
         },
      ],
   },
   {
      id: 'contact',
      icon: Bell,
      title: 'Policy Updates & Contact',
      gradient: 'from-brand to-brand-dark',
      border: 'border-brand/30',
      glow: 'rgba(59,130,246,0.15)',
      content: [
         {
            subtitle: 'Policy Changes',
            text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of significant changes via email or a prominent notice on the platform.',
         },
         {
            subtitle: 'Effective Date',
            text: `This Privacy Policy was last updated on ${LAST_UPDATED_DATE}. The most current version will always be available on this page.`,
         },
         {
            subtitle: 'Contact Us',
            text: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Protection team at ${PRIVACY_EMAIL}. We aim to respond within 48 hours.`,
         },
      ],
   },
];

export function PrivacyClient() {
   return (
      <div className="bg-[#0a0e27]">
         {/* Back Button */}
         <div className="max-w-5xl mx-auto px-6 pt-6">
            <Link
               href="/"
               className="group inline-flex items-center gap-3 text-slate-400 hover:text-brand transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-brand/30"
            >
               <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/70 group-hover:bg-gradient-to-br group-hover:from-brand group-hover:to-brand transition-all duration-300 shadow-lg">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
               </div>
               <span className="text-sm font-bold uppercase tracking-wide">
                  Back to Home
               </span>
            </Link>
         </div>

         {/* Hero */}
         <div className="relative overflow-hidden border-b border-slate-700/50 mt-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.15),transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.1),transparent_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_8s_linear_infinite]" />

            {/* Decorative grid */}
            <div
               className="absolute inset-0 opacity-5"
               style={{
                  backgroundImage:
                     'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
               }}
            />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-28">
               <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-dark rounded-2xl blur-2xl opacity-60" />
                     <div className="relative w-20 h-20 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center shadow-2xl border border-brand/50">
                        <Shield className="w-10 h-10 text-white" />
                     </div>
                  </div>
               </div>

               <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 rounded-full px-4 py-2 mb-6">
                     <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                     <span className="text-sm font-semibold text-brand uppercase tracking-wider">
                        Legal Document
                     </span>
                  </div>

                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 uppercase tracking-tight leading-none">
                     Privacy{' '}
                     <span className="bg-gradient-to-r from-brand via-brand to-purple-400 bg-clip-text text-transparent">
                        Policy
                     </span>
                  </h1>

                  <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                     We are committed to protecting your privacy and being
                     transparent about how we collect, use, and safeguard your
                     personal information.
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500">
                     <FileText className="w-4 h-4" />
                     <span>Last updated: {LAST_UPDATED_DATE}</span>
                  </div>
               </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
         </div>

         <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
            {/* Quick nav */}
            <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl p-6 shadow-xl">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(6,182,212,0.08),transparent)]" />
               <div className="relative">
                  <p className="text-xs font-bold text-brand uppercase tracking-widest mb-4">
                     Quick Navigation
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {sections.map((s) => (
                        <a
                           key={s.id}
                           href={`#${s.id}`}
                           className="group flex items-center gap-2 text-sm text-slate-400 hover:text-brand transition-colors duration-200 font-semibold"
                        >
                           <ChevronRight className="w-3 h-3 text-brand/50 group-hover:text-brand transition-colors flex-shrink-0" />
                           <span className="truncate">{s.title}</span>
                        </a>
                     ))}
                  </div>
               </div>
            </div>

            {/* Intro card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand/20 to-brand/20 border-2 border-brand/30 rounded-2xl p-8 shadow-xl">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(6,182,212,0.1),transparent)]" />
               <div className="relative flex items-start gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                     <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">
                        Our Commitment to You
                     </h2>
                     <p className="text-slate-300 leading-relaxed font-medium">
                        This Privacy Policy explains how we collect, use,
                        disclose, and protect your information when you use our
                        football streaming and analytics platform. By accessing
                        our service, you agree to the terms outlined in this
                        document. We take your privacy seriously and adhere to
                        applicable data protection laws including GDPR and CCPA.
                     </p>
                  </div>
               </div>
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-brand to-brand" />
            </div>

            {/* Sections */}
            {sections.map((section) => {
               const Icon = section.icon;
               return (
                  <div
                     key={section.id}
                     id={section.id}
                     className={`relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 ${section.border} rounded-2xl shadow-xl scroll-mt-8`}
                  >
                     <div
                        className="absolute inset-0"
                        style={{
                           background: `radial-gradient(circle at 20% 30%, ${section.glow}, transparent 60%)`,
                        }}
                     />

                     <div className="relative p-8">
                        {/* Section header */}
                        <div className="flex items-center gap-4 mb-8">
                           <div
                              className={`w-12 h-12 bg-gradient-to-br ${section.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                           >
                              <Icon className="w-6 h-6 text-white" />
                           </div>
                           <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                              {section.title}
                           </h2>
                        </div>

                        {/* Content blocks */}
                        <div className="space-y-6">
                           {section.content.map((block, i) => (
                              <div key={i} className="flex gap-4">
                                 <div
                                    className={`w-1 rounded-full bg-gradient-to-b ${section.gradient} flex-shrink-0 mt-1`}
                                 />
                                 <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                                       {block.subtitle}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed font-medium text-sm">
                                       {block.text}
                                    </p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div
                        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30`}
                     />
                  </div>
               );
            })}

            {/* Contact CTA */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-slate-700/50 rounded-2xl p-8 text-center shadow-xl">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.08),transparent)]" />
               <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-brand/30">
                     <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-3">
                     Questions About Your Privacy?
                  </h3>
                  <p className="text-slate-400 font-medium mb-6 max-w-md mx-auto">
                     Our Data Protection team is here to help. Reach out and
                     we'll respond within 48 hours.
                  </p>
                  <a
                     href={`mailto:${PRIVACY_EMAIL}`}
                     className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark hover:from-brand hover:to-brand text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-brand/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand/40 uppercase tracking-wide text-sm"
                  >
                     <Mail className="w-5 h-5" />
                     Contact Privacy Team
                  </a>
               </div>
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-brand to-purple-500" />
            </div>
         </div>

         <style jsx>{`
            @keyframes shimmer {
               0% {
                  background-position: -1000px 0;
               }
               100% {
                  background-position: 1000px 0;
               }
            }
         `}</style>
      </div>
   );
}
