// app/terms/TermsClient.tsx
'use client';

import { useEffect, useState } from 'react';
import {
   FileText,
   Scale,
   UserCheck,
   AlertTriangle,
   Shield,
   Link2,
   RefreshCw,
   XCircle,
   Gavel,
   Mail,
   CheckCircle,
} from 'lucide-react';
import { ScrollToTop } from '@/shared/ui/ScrollToTop';
import Link from 'next/link';

// Deterministic particle positions — avoids React hydration mismatch
const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
   left: `${(i * 6.7) % 100}%`,
   top: `${(i * 8.3) % 100}%`,
   duration: `${5 + (i % 10)}s`,
   delay: `${i % 5}s`,
}));

const sections = [
   {
      icon: FileText,
      color: 'purple',
      title: 'Acceptance of Terms',
      content:
         'By accessing and using Flacrom Gamezone, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this gaming platform. Your continued use of Flacrom Gamezone, including participation in tournaments, use of matchmaking services, or engagement with our community features, constitutes acceptance of any modifications to these terms. These terms apply to all users, including free tier members, premium subscribers, tournament participants, and casual players.',
   },
   {
      icon: Scale,
      color: 'purple',
      title: 'Use License',
      content:
         'Permission is granted to access Flacrom Gamezone for personal gaming and entertainment purposes only. This is the grant of a license, not a transfer of title. Under this license you may not:',
      restrictions: [
         'Modify, copy, or redistribute any game assets, software, or platform materials',
         'Use the platform for commercial purposes without written authorization',
         'Attempt to decompile, reverse engineer, or extract source code from our software',
         'Remove copyright, trademark, or proprietary notices from any materials',
         'Transfer your account or license to another person without permission',
         'Use cheating software, bots, or automation tools that violate fair play',
         'Exploit bugs or glitches for competitive advantage',
         'Engage in account sharing or selling',
      ],
   },
   {
      icon: UserCheck,
      color: 'blue',
      title: 'User Accounts and Subscriptions',
      content:
         'When you create a Flacrom Gamezone account, you must provide accurate and complete information. You are responsible for:',
      responsibilities: [
         'Maintaining the security of your account credentials',
         'All activities and transactions under your account',
         'Timely payment of subscription fees for premium services',
         'Compliance with these terms and community guidelines',
         'Keeping your contact information up to date',
         'Notifying us immediately of any unauthorized account access',
      ],
      additional:
         'Premium subscriptions auto-renew unless cancelled. You can manage your subscription from your account dashboard. Refunds are provided according to our refund policy.',
   },
   {
      icon: AlertTriangle,
      color: 'amber',
      title: 'Disclaimer',
      content:
         "The gaming services on Flacrom Gamezone are provided on an 'as is' and 'as available' basis. Flacrom Gamezone makes no warranties, expressed or implied, and hereby disclaims all warranties including, without limitation, implied warranties of merchantability, fitness for a particular gaming purpose, uninterrupted service, or non-infringement. We do not guarantee that tournaments will run without interruption, that matchmaking will always be balanced, or that live streams will be available without technical issues. Game statistics, leaderboards, and rankings are provided for informational purposes and may contain errors.",
   },
   {
      icon: Shield,
      color: 'orange',
      title: 'Limitations of Liability',
      content:
         'In no event shall Flacrom Gamezone or its suppliers be liable for any damages including, without limitation, loss of game progress, virtual items, tournament prizes, subscription fees, or business interruption arising from the use or inability to use our gaming platform. This includes damages from server outages, account suspension, tournament disqualification, or technical failures. Our maximum liability is limited to the amount you paid for services in the 12 months preceding the claim, even if Flacrom Gamezone has been notified of the possibility of such damage.',
   },
   {
      icon: CheckCircle,
      color: 'orange',
      title: 'Accuracy of Materials',
      content:
         'The materials on Flacrom Gamezone, including tournament schedules, match results, player statistics, leaderboard rankings, and live stream information, could include technical, typographical, or other errors. Flacrom Gamezone does not warrant that game data, player profiles, or tournament information is accurate, complete, or current. We reserve the right to correct errors, update statistics, or modify tournament brackets at any time without notice. Match results are considered final once officially published, except in cases of proven technical errors or rule violations.',
   },
   {
      icon: Link2,
      color: 'green',
      title: 'Links and Third-Party Content',
      content:
         'Flacrom Gamezone may contain links to third-party websites, streaming platforms, or gaming services. We are not responsible for:',
      thirdParty: [
         'The content, privacy practices, or security of third-party sites',
         'Availability, quality, or latency of third-party game servers or streams',
         'Any damages, losses, or issues arising from your use of external services',
         'Content shared by other players in community features',
         'Third-party tournament organizers or prize distributions',
      ],
      note: 'Use of external links and services is at your own risk. We recommend reviewing their terms and privacy policies.',
   },
   {
      icon: RefreshCw,
      color: 'green',
      title: 'Modifications to Terms',
      content:
         'Flacrom Gamezone may revise these Terms of Service at any time to reflect changes in our gaming services, legal requirements, or business practices. Material changes will be communicated via email to registered users and prominently displayed on the platform. By continuing to use Flacrom Gamezone after modifications take effect, you agree to be bound by the revised terms. We recommend reviewing these terms periodically. Premium members will receive 30 days advance notice of any changes affecting subscription pricing or core features.',
   },
   {
      icon: XCircle,
      color: 'red',
      title: 'Account Termination',
      content:
         'We may terminate or suspend your account and access to Flacrom Gamezone immediately, without prior notice or liability, for any reason including but not limited to:',
      violations: [
         'Breach of these Terms of Service or community guidelines',
         'Use of cheating software or unauthorized third-party tools',
         'Harassment, abuse, or toxic behavior toward other players',
         'Fraud, payment disputes, or chargebacks',
         'Account sharing, selling, or unauthorized access',
         'Violation of tournament rules or competitive integrity',
      ],
      rights:
         'Upon termination, your right to use the service will immediately cease. You may lose access to virtual items, game progress, and any unused subscription time. We reserve the right to delete terminated accounts and associated data.',
   },
   {
      icon: Gavel,
      color: 'red',
      title: 'Governing Law',
      content:
         'These Terms of Service are governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. You irrevocably submit to the exclusive jurisdiction of the courts located in San Francisco, California for resolution of any disputes arising from these terms or your use of Flacrom Gamezone. Any legal action must be commenced within one year of the cause of action arising.',
   },
   {
      icon: Mail,
      color: 'purple',
      title: 'Contact Information',
      content:
         'If you have any questions about these Terms of Service, need clarification on any provisions, or wish to report a violation, please',
   },
];

const COLOR_CLASSES: Record<
   string,
   { gradient: string; text: string; bg: string; border: string }
> = {
   purple: {
      gradient: 'from-purple-500 to-purple-600',
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
   },
   blue: {
      gradient: 'from-blue-500 to-blue-600',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
   },
   amber: {
      gradient: 'from-amber-500 to-amber-600',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
   },
   orange: {
      gradient: 'from-orange-500 to-orange-600',
      text: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
   },
   green: {
      gradient: 'from-green-500 to-green-600',
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
   },
   red: {
      gradient: 'from-red-500 to-red-600',
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
   },
};

export function TermsClient() {
   const lastUpdated = 'January 24, 2026';
   const [mounted, setMounted] = useState(false);
   const [activeSection, setActiveSection] = useState<number | null>(null);

   useEffect(() => {
      setMounted(true);
   }, []);

   return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
         <ScrollToTop />

         {/* Animated background blobs */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
               className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '4s' }}
            />
            <div
               className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '6s', animationDelay: '1s' }}
            />
            <div
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '8s', animationDelay: '2s' }}
            />
         </div>

         {/* Floating particles — deterministic */}
         <div className="absolute inset-0 pointer-events-none">
            {PARTICLES.map((p, i) => (
               <div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-400/20 rounded-full"
                  style={{
                     left: p.left,
                     top: p.top,
                     animation: `float ${p.duration} ease-in-out infinite`,
                     animationDelay: p.delay,
                  }}
               />
            ))}
         </div>

         <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
            {/* Header */}
            <div
               className={`text-center mb-12 transition-all duration-1000 ${
                  mounted
                     ? 'opacity-100 translate-y-0'
                     : 'opacity-0 translate-y-8'
               }`}
            >
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 mb-6 shadow-lg shadow-purple-500/50 relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <FileText className="w-10 h-10 text-white relative z-10" />
               </div>
               <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                  Terms of Service
               </h1>
               <p className="text-slate-400 text-lg mb-2">
                  Please read these terms carefully before using our platform
               </p>
               <p className="text-slate-500 text-sm">
                  Last updated: {lastUpdated}
               </p>
            </div>

            {/* Content card */}
            <div
               className={`bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-5 sm:p-8 shadow-2xl transition-all duration-1000 delay-150 ${
                  mounted
                     ? 'opacity-100 translate-y-0'
                     : 'opacity-0 translate-y-8'
               }`}
            >
               <div className="space-y-8">
                  {sections.map((section, index) => {
                     const Icon = section.icon;
                     const c = COLOR_CLASSES[section.color];

                     return (
                        <section
                           key={index}
                           className="group"
                           onMouseEnter={() => setActiveSection(index)}
                           onMouseLeave={() => setActiveSection(null)}
                        >
                           {/* Section header */}
                           <div className="flex items-start gap-3 sm:gap-4 mb-4">
                              <div
                                 className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 ${
                                    activeSection === index ? 'scale-110' : ''
                                 }`}
                              >
                                 <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                 <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 flex-wrap">
                                    {section.title}
                                    <span
                                       className={`text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${c.text} ${c.bg} border ${c.border}`}
                                    >
                                       {index + 1}
                                    </span>
                                 </h2>
                              </div>
                           </div>

                           <div className="ml-0 sm:ml-16 space-y-2">
                              {/* Main paragraph */}
                              {section.content && (
                                 <p className="text-slate-300 leading-relaxed">
                                    {section.content}
                                    {/* Contact link inline */}
                                    {section.title ===
                                       'Contact Information' && (
                                       <>
                                          {' '}
                                          <Link
                                             href="/contact"
                                             className="text-blue-400 font-semibold hover:underline"
                                          >
                                             contact us here
                                          </Link>
                                          .
                                       </>
                                    )}
                                 </p>
                              )}

                              {/* Restrictions */}
                              {section.restrictions?.map((item, i) => (
                                 <div
                                    key={i}
                                    className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-red-500/30 transition-all"
                                 >
                                    <div className="flex items-start gap-3">
                                       <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                       <span className="text-slate-300">
                                          {item}
                                       </span>
                                    </div>
                                 </div>
                              ))}

                              {/* Responsibilities */}
                              {section.responsibilities?.map((item, i) => (
                                 <div
                                    key={i}
                                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/30 transition-all"
                                 >
                                    <div className="flex items-start gap-3">
                                       <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                       <span className="text-slate-300">
                                          {item}
                                       </span>
                                    </div>
                                 </div>
                              ))}

                              {/* Additional note after responsibilities */}
                              {section.additional && (
                                 <p className="text-slate-400 italic pt-2">
                                    {section.additional}
                                 </p>
                              )}

                              {/* Third-party items */}
                              {section.thirdParty?.map((item, i) => (
                                 <div
                                    key={i}
                                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-green-500/30 transition-all"
                                 >
                                    <div className="flex items-start gap-3">
                                       <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                       <span className="text-slate-300">
                                          {item}
                                       </span>
                                    </div>
                                 </div>
                              ))}

                              {/* Note */}
                              {section.note && (
                                 <p className="text-slate-400 italic pt-2">
                                    {section.note}
                                 </p>
                              )}

                              {/* Violations */}
                              {section.violations?.map((item, i) => (
                                 <div
                                    key={i}
                                    className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-red-500/30 transition-all"
                                 >
                                    <div className="flex items-start gap-3">
                                       <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                       <span className="text-slate-300">
                                          {item}
                                       </span>
                                    </div>
                                 </div>
                              ))}

                              {/* Rights */}
                              {section.rights && (
                                 <p className="text-slate-400 pt-2">
                                    {section.rights}
                                 </p>
                              )}
                           </div>

                           {/* Divider between sections */}
                           {index < sections.length - 1 && (
                              <div className="mt-8 border-t border-slate-700/30" />
                           )}
                        </section>
                     );
                  })}
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
