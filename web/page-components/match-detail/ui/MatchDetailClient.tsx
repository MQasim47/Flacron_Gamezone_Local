'use client';

import { getAllDeepData } from '@/shared/api/deepData';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
   ChevronLeft,
   Trophy,
   Clock,
   MapPin,
   Sparkles,
   Globe,
   FileText,
   TrendingUp,
   AlertCircle,
   Shield,
   Target,
   Flame,
   Crosshair,
   Lock,
} from 'lucide-react';
import { apiGet, apiPost } from '@/shared/api/base';
import StreamEmbed from '@/entities/stream/ui/StreamEmbed';
import { PremiumGate } from '@/shared/ui/PremiumGate';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';

interface Team {
   id: string;
   name: string;
   logo: string | null;
   apiTeamId: number | null;
}

interface League {
   id: string;
   name: string;
   country: string | null;
   logo: string | null;
   apiLeagueId: number | null;
}

interface Stream {
   id: string;
   matchId: string;
   type: 'EMBED' | 'NONE';
   provider: string | null;
   url: string | null;
   isActive: boolean;
}

interface AISummary {
   id: string;
   matchId: string;
   provider: string;
   language: string;
   kind: 'preview' | 'summary';
   content: string;
   createdAt: string;
}

interface Match {
   id: string;
   apiFixtureId: number | null;
   leagueId: string | null;
   homeTeamId: string;
   awayTeamId: string;
   kickoffTime: string;
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
   venue: string | null;
   league: League | null;
   homeTeam: Team;
   awayTeam: Team;
   stream: Stream | null;
   aiTexts: AISummary[];
}

interface Props {
   initialMatch: Match | null;
   matchId: string;
}

export function MatchDetailClient({ initialMatch, matchId }: Props) {
   const [match, setMatch] = useState<Match | null>(initialMatch);
   const [err, setErr] = useState('');
   const [lang, setLang] = useState<'en' | 'fr'>('en');
   const [generating, setGenerating] = useState<string | null>(null);
   const [successMsg, setSuccessMsg] = useState('');
   const [loadingMatch, setLoadingMatch] = useState(!initialMatch);
   const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   const [deepData, setDeepData] = useState<any>(null);
   const [deepLoading, setDeepLoading] = useState(false);
   const [deepTab, setDeepTab] = useState<
      'lineups' | 'stats' | 'incidents' | 'odds' | 'votes' | 'h2h'
   >('lineups');
   const [deepLoaded, setDeepLoaded] = useState(false);

   const router = useRouter();
   const { isPremium, loading: subLoading } = useSubscription();

   async function loadDeepData() {
      if (deepLoaded || !isPremium) return;
      try {
         setDeepLoading(true);
         const data = await getAllDeepData(matchId);
         setDeepData(data);
         setDeepLoaded(true);
      } catch {
         // deep data unavailable — silent fail
      } finally {
         setDeepLoading(false);
      }
   }

   async function loadMatch() {
      try {
         setLoadingMatch(true);
         setErr('');
         const data = await apiGet<Match>(`/api/matches/${matchId}`);
         setMatch(data);
      } catch (e: any) {
         console.error('Error loading match:', e);
         setErr(e?.message || 'Failed to load match details');
      } finally {
         setLoadingMatch(false);
      }
   }

   async function loadAIContent() {
      if (!isPremium) return;
      try {
         const data = await apiGet<AISummary[]>(
            `/api/ai/${matchId}?language=${lang}`
         );
         if (data && match) {
            setMatch((prev) => (prev ? { ...prev, aiTexts: data } : prev));
         }
      } catch (e: any) {
         console.log('No AI content found:', e?.message);
      }
   }

   // Only fetch on client if no initial data was provided
   useEffect(() => {
      if (!initialMatch) {
         loadMatch();
      }
   }, [matchId]);

   useEffect(() => {
      if (match) loadAIContent();
   }, [lang, match?.id, isPremium]);

   useEffect(() => {
      return () => {
         if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      };
   }, []);

   async function generatePreview() {
      const previewExists = match?.aiTexts?.some(
         (t) => t.kind === 'preview' && t.language === lang
      );
      if (previewExists) return;

      try {
         setGenerating('match-preview');
         setErr('');
         setSuccessMsg('');

         const response = await apiPost<AISummary>('/api/ai/preview', {
            matchId,
            language: lang,
         });

         setMatch((prev) =>
            prev ? { ...prev, aiTexts: [...prev.aiTexts, response] } : prev
         );

         setSuccessMsg('✅ Preview generated successfully!');
         await loadAIContent();
         if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
         successTimeoutRef.current = setTimeout(() => setSuccessMsg(''), 3000);
      } catch (e: any) {
         setErr(e?.message || 'Failed to generate preview');
      } finally {
         setGenerating(null);
      }
   }

   async function generateSummary() {
      const summaryExists = match?.aiTexts?.some(
         (t) => t.kind === 'summary' && t.language === lang
      );
      if (summaryExists) return;

      try {
         setGenerating('match-summary');
         setErr('');
         setSuccessMsg('');

         const response = await apiPost<AISummary>('/api/ai/summary', {
            matchId,
            language: lang,
         });

         setMatch((prev) =>
            prev ? { ...prev, aiTexts: [...prev.aiTexts, response] } : prev
         );

         setSuccessMsg('✅ Summary generated successfully!');
         await loadAIContent();
         if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
         successTimeoutRef.current = setTimeout(() => setSuccessMsg(''), 3000);
      } catch (e: any) {
         setErr(e?.message || 'Failed to generate summary');
      } finally {
         setGenerating(null);
      }
   }

   const getStatusBadge = (status: string) => {
      switch (status) {
         case 'LIVE':
            return (
               <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl animate-pulse"></div>
                  <div className="relative flex items-center gap-2">
                     <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                     </span>
                     <span className="text-sm font-black tracking-wider text-white uppercase">
                        🔴 Live Now
                     </span>
                  </div>
               </div>
            );
         case 'FINISHED':
            return (
               <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 shadow-lg">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-black tracking-wider text-slate-200 uppercase">
                     Full Time
                  </span>
               </div>
            );
         case 'UPCOMING':
            return (
               <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-blue-500/30">
                  <Clock className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-sm font-black tracking-wider text-white uppercase">
                     Coming Soon
                  </span>
               </div>
            );
         default:
            return null;
      }
   };

   // Loading state (only if no server-side data)
   if (loadingMatch && !match) {
      return (
         <div className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
               <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-cyan-500/20 rounded-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.1),transparent)]"></div>
                  <div className="relative">
                     <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-cyan-500/30">
                        <Trophy className="w-10 h-10 text-white" />
                     </div>
                     <p className="text-slate-300 font-bold text-xl">
                        ⚡ Loading match data...
                     </p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // Error state (only if completely failed with no data)
   if (err && !match) {
      return (
         <div className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
               <button
                  onClick={() => window.history.back()}
                  className="group flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30 mb-6"
               >
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/70 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300 shadow-lg">
                     <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide">
                     ← Back
                  </span>
               </button>
               <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-900/90 to-red-900/30 border-2 border-red-500/30 rounded-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.1),transparent)]"></div>
                  <div className="relative">
                     <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-500/30">
                        <AlertCircle className="w-10 h-10 text-white" />
                     </div>
                     <p className="text-red-400 font-bold text-xl mb-2">
                        ⚠️ {err}
                     </p>
                     <button
                        onClick={loadMatch}
                        className="mt-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                     >
                        Try Again
                     </button>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (!match) return null;

   const aiTexts = match.aiTexts ?? [];
   const preview = aiTexts.find(
      (x) => x.kind === 'preview' && x.language === lang
   );
   const summary = aiTexts.find(
      (x) => x.kind === 'summary' && x.language === lang
   );

   return (
      <div className="flex-1 p-4 md:p-6">
         <div className="max-w-7xl mx-auto space-y-6">
            {/* Back Button */}
            <button
               onClick={() => window.history.back()}
               className="group flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30"
            >
               <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/70 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300 shadow-lg">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
               </div>
               <span className="text-sm font-bold uppercase tracking-wide">
                  ← Back
               </span>
            </button>

            {/* Premium upsell banner for free users */}
            {!subLoading && !isPremium && (
               <div className="relative overflow-hidden bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-yellow-900/30 border-2 border-yellow-500/40 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(234,179,8,0.12),transparent)]" />
                  <div className="relative flex items-center justify-between gap-4 flex-wrap">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                           <Lock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                           <p className="text-white font-black text-sm uppercase tracking-wide">
                              Premium features locked
                           </p>
                           <p className="text-yellow-300/80 text-xs">
                              Upgrade to access live streams, AI previews &
                              match summaries
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={() => router.push('/pricing')}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400
                           text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all duration-300
                           hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/40 uppercase tracking-wider flex-shrink-0"
                     >
                        ⭐ Upgrade Now
                     </button>
                  </div>
               </div>
            )}

            {/* Success Message */}
            {successMsg && (
               <div className="relative overflow-hidden bg-gradient-to-br from-green-900/30 to-green-800/30 border-2 border-green-500/50 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(34,197,94,0.15),transparent)]"></div>
                  <div className="relative flex items-center gap-3">
                     <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                     </div>
                     <p className="text-sm text-green-300 font-bold">
                        {successMsg}
                     </p>
                  </div>
               </div>
            )}

            {/* Match Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20">
               <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]"></div>
               </div>
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(6,182,212,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15),transparent_50%)]"></div>

               <div className="relative z-10 p-6 md:p-10">
                  {/* League Badge */}
                  <div className="flex items-center justify-center mb-8">
                     <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl px-6 py-4 shadow-2xl">
                           {match.league?.logo ? (
                              <img
                                 src={match.league.logo}
                                 alt={match.league.name}
                                 className="w-10 h-10 object-contain"
                              />
                           ) : (
                              <Trophy className="w-10 h-10 text-cyan-400" />
                           )}
                           <div>
                              <div className="text-lg font-black text-white uppercase tracking-wide">
                                 {match.league?.name || 'Unknown League'}
                              </div>
                              {match.league?.country && (
                                 <div className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" />
                                    {match.league.country}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Teams Battle Zone */}

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 md:gap-8 mb-6 sm:mb-8">
                     {/* Home Team */}
                     <div className="text-center md:text-right">
                        <div className="relative inline-block mb-2 sm:mb-4 group">
                           <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500/40 to-blue-500/40 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
                           <div className="relative">
                              {match.homeTeam?.logo ? (
                                 <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-900/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border-2 border-cyan-500/50 shadow-2xl flex items-center justify-center">
                                    <img
                                       src={match.homeTeam.logo}
                                       alt={match.homeTeam.name}
                                       className="w-full h-full object-contain"
                                    />
                                 </div>
                              ) : (
                                 <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl sm:text-3xl md:text-4xl font-black border-2 border-cyan-500/50 shadow-2xl">
                                    {match.homeTeam?.name?.charAt(0)}
                                 </div>
                              )}
                           </div>
                        </div>
                        <h2 className="text-sm sm:text-xl md:text-3xl font-black text-white mb-1 sm:mb-2 uppercase tracking-tight line-clamp-2">
                           {match.homeTeam?.name}
                        </h2>
                        <div className="inline-flex items-center gap-1.5 bg-cyan-500/20 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 border border-cyan-500/30">
                           <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                              🏠 Home
                           </span>
                        </div>
                     </div>

                     {/* Score/VS Section */}
                     <div className="text-center min-w-[80px] sm:min-w-[120px] md:min-w-[180px]">
                        {match.status === 'FINISHED' ||
                        match.status === 'LIVE' ? (
                           <div className="space-y-2 sm:space-y-4">
                              <div className="text-3xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl tracking-tighter">
                                 {match.score || '0-0'}
                              </div>
                              {getStatusBadge(match.status)}
                           </div>
                        ) : (
                           <div className="space-y-2 sm:space-y-4">
                              {getStatusBadge(match.status)}
                              <div className="flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm bg-slate-900/70 backdrop-blur-sm rounded-xl px-2 py-2 sm:px-4 sm:py-3 border-2 border-blue-500/30 shadow-lg">
                                 <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400 animate-pulse" />
                                 <div className="font-black text-white uppercase tracking-wide text-xs sm:text-sm text-center">
                                    {new Date(match.kickoffTime).toLocaleString(
                                       lang === 'fr' ? 'fr-FR' : 'en-US',
                                       {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                       }
                                    )}
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Away Team */}
                     <div className="text-center md:text-left">
                        <div className="relative inline-block mb-2 sm:mb-4 group">
                           <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
                           <div className="relative">
                              {match.awayTeam?.logo ? (
                                 <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-900/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border-2 border-blue-500/50 shadow-2xl flex items-center justify-center">
                                    <img
                                       src={match.awayTeam.logo}
                                       alt={match.awayTeam.name}
                                       className="w-full h-full object-contain"
                                    />
                                 </div>
                              ) : (
                                 <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl sm:text-3xl md:text-4xl font-black border-2 border-blue-500/50 shadow-2xl">
                                    {match.awayTeam?.name?.charAt(0)}
                                 </div>
                              )}
                           </div>
                        </div>
                        <h2 className="text-sm sm:text-xl md:text-3xl font-black text-white mb-1 sm:mb-2 uppercase tracking-tight line-clamp-2">
                           {match.awayTeam?.name}
                        </h2>
                        <div className="inline-flex items-center gap-1.5 bg-blue-500/20 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 border border-blue-500/30">
                           <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                              ✈️ Away
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Venue Badge */}
                  {match.venue && (
                     <div className="flex items-center justify-center">
                        <div className="inline-flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-slate-700/50 shadow-lg">
                           <MapPin className="w-4 h-4 text-cyan-400" />
                           <span className="text-sm text-slate-300 font-semibold">
                              {match.venue}
                           </span>
                        </div>
                     </div>
                  )}
               </div>

               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"></div>
            </div>

            {/* Language Selector – only useful for premium users */}
            {isPremium && (
               <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(168,85,247,0.1),transparent)]"></div>
                  <div className="relative">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                           <Globe className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wide">
                           Language
                        </h3>
                     </div>
                     <select
                        id="lang-selector"
                        aria-label="Select language"
                        className="w-full bg-slate-800/90 border-2 border-purple-500/50 rounded-xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer hover:border-purple-400"
                        value={lang}
                        onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
                     >
                        <option value="en">🇬🇧 English</option>
                        <option value="fr">🇫🇷 French</option>
                     </select>
                  </div>
               </div>
            )}

            {/* Live Stream – Premium gated */}
            <PremiumGate isPremium={isPremium} feature="Live Stream">
               <StreamEmbed
                  stream={match.stream}
                  matchStatus={match.status}
                  homeTeam={match.homeTeam.name}
                  awayTeam={match.awayTeam.name}
                  matchId={match.id}
               />
            </PremiumGate>

            {/* AI Content – Premium gated */}
            <PremiumGate isPremium={isPremium} feature="AI Match Analysis">
               <div className="grid md:grid-cols-2 gap-6">
                  {/* AI Preview */}
                  <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/30 rounded-2xl shadow-2xl">
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(6,182,212,0.15),transparent)]"></div>
                     <div className="relative p-6">
                        <div className="flex items-center justify-between mb-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                 <Sparkles className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                 <h3 className="font-black text-white text-lg uppercase tracking-wide">
                                    AI Preview
                                 </h3>
                                 <p className="text-xs text-cyan-400 font-bold">
                                    ⚡ Pre-Match Analysis
                                 </p>
                              </div>
                           </div>
                           <button
                              onClick={generatePreview}
                              disabled={
                                 generating === 'match-preview' || !!preview
                              }
                              className="relative group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-black px-5 py-3 rounded-xl text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 disabled:scale-100 disabled:cursor-not-allowed shadow-md uppercase tracking-wide"
                           >
                              {generating === 'match-preview' ? (
                                 <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Generating...
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-2">
                                    <Crosshair className="w-4 h-4" />
                                    {preview ? 'Generated' : 'Generate'}
                                 </span>
                              )}
                           </button>
                        </div>
                        <div className="bg-slate-950/60 rounded-xl p-5 min-h-[240px] max-h-[420px] overflow-y-auto border-2 border-cyan-500/20 backdrop-blur-sm custom-scrollbar">
                           {preview?.content ? (
                              <div className="space-y-3">
                                 <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                                    {preview.content}
                                 </p>
                                 {preview.provider && (
                                    <div className="flex items-center gap-2 pt-3 border-t border-cyan-500/30">
                                       <Flame className="w-3 h-3 text-cyan-400" />
                                       <span className="text-xs text-cyan-400 font-bold uppercase">
                                          Powered by {preview.provider}
                                       </span>
                                    </div>
                                 )}
                              </div>
                           ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                 <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-slate-600" />
                                 </div>
                                 <p className="text-sm text-slate-400 font-bold mb-1">
                                    ⚡ No preview yet
                                 </p>
                                 <p className="text-xs text-slate-600 font-semibold">
                                    AI preview can be generated once
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* AI Summary */}
                  <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl shadow-2xl">
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(168,85,247,0.15),transparent)]"></div>
                     <div className="relative p-6">
                        <div className="flex items-center justify-between mb-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                 <TrendingUp className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                 <h3 className="font-black text-white text-lg uppercase tracking-wide">
                                    AI Summary
                                 </h3>
                                 <p className="text-xs text-purple-400 font-bold">
                                    🔥 Post-Match Report
                                 </p>
                              </div>
                           </div>
                           <button
                              onClick={generateSummary}
                              disabled={
                                 generating === 'match-summary' || !!summary
                              }
                              className="relative group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-black px-5 py-3 rounded-xl text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 disabled:scale-100 disabled:cursor-not-allowed shadow-md uppercase tracking-wide"
                           >
                              {generating === 'match-summary' ? (
                                 <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Generating...
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-2">
                                    <Crosshair className="w-4 h-4" />
                                    {summary ? 'Generated' : 'Generate'}
                                 </span>
                              )}
                           </button>
                        </div>
                        <div className="bg-slate-950/60 rounded-xl p-5 min-h-[240px] max-h-[420px] overflow-y-auto border-2 border-purple-500/20 backdrop-blur-sm custom-scrollbar">
                           {summary?.content ? (
                              <div className="space-y-3">
                                 <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                                    {summary.content}
                                 </p>
                                 {summary.provider && (
                                    <div className="flex items-center gap-2 pt-3 border-t border-purple-500/30">
                                       <Flame className="w-3 h-3 text-purple-400" />
                                       <span className="text-xs text-purple-400 font-bold uppercase">
                                          Powered by {summary.provider}
                                       </span>
                                    </div>
                                 )}
                              </div>
                           ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                 <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-slate-600" />
                                 </div>
                                 <p className="text-sm text-slate-400 font-bold mb-1">
                                    🔥 No summary yet
                                 </p>
                                 <p className="text-xs text-slate-600 font-semibold">
                                    AI summary can be generated once
                                 </p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </PremiumGate>

            {/* Deep Match Data — Premium gated */}
            <PremiumGate isPremium={isPremium} feature="Deep Match Data">
               <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl shadow-2xl">
                  {/* Section header */}
                  <div className="p-6 border-b border-slate-700/50">
                     <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Target className="w-5 h-5 text-white" />
                           </div>
                           <div>
                              <h3 className="font-black text-white text-lg uppercase tracking-wide">
                                 Deep Match Data
                              </h3>
                              <p className="text-xs text-indigo-400 font-bold">
                                 Lineups · Stats · Incidents · Odds
                              </p>
                           </div>
                        </div>
                        {!deepLoaded && (
                           <button
                              onClick={loadDeepData}
                              disabled={deepLoading}
                              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-50 uppercase tracking-wide"
                           >
                              {deepLoading ? (
                                 <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
                                    Loading…
                                 </>
                              ) : (
                                 <>
                                    <Sparkles className="w-4 h-4" /> Load Data
                                 </>
                              )}
                           </button>
                        )}
                     </div>
                  </div>

                  {!deepLoaded && !deepLoading && (
                     <div className="p-12 text-center">
                        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm font-semibold">
                           Click "Load Data" to fetch live lineups, stats,
                           incidents, odds and more from SportSRC.
                        </p>
                     </div>
                  )}

                  {deepLoaded && deepData && (
                     <>
                        {/* Tabs */}
                        <div className="flex overflow-x-auto border-b border-slate-700/50 px-2 pt-2 gap-1">
                           {(
                              [
                                 {
                                    id: 'lineups',
                                    label: 'Lineups',
                                    available: !!deepData.lineups,
                                 },
                                 {
                                    id: 'stats',
                                    label: 'Stats',
                                    available: !!deepData.stats,
                                 },
                                 {
                                    id: 'incidents',
                                    label: 'Incidents',
                                    available: !!deepData.incidents?.length,
                                 },
                                 {
                                    id: 'odds',
                                    label: 'Odds',
                                    available: !!deepData.odds,
                                 },
                                 {
                                    id: 'votes',
                                    label: 'Votes',
                                    available: !!deepData.votes,
                                 },
                                 {
                                    id: 'h2h',
                                    label: 'H2H',
                                    available: !!deepData.h2h,
                                 },
                              ] as const
                           ).map((tab) => (
                              <button
                                 key={tab.id}
                                 onClick={() => setDeepTab(tab.id as any)}
                                 className={`flex-shrink-0 px-4 py-2.5 text-xs font-black uppercase tracking-wide rounded-t-lg transition-all relative ${
                                    deepTab === tab.id
                                       ? 'text-indigo-400'
                                       : tab.available
                                         ? 'text-slate-400 hover:text-white'
                                         : 'text-slate-600 cursor-not-allowed'
                                 }`}
                                 disabled={!tab.available}
                              >
                                 {tab.label}
                                 {!tab.available && (
                                    <span className="ml-1 text-slate-600">
                                       —
                                    </span>
                                 )}
                                 {deepTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t" />
                                 )}
                              </button>
                           ))}
                        </div>

                        {/* Tab content */}
                        <div className="p-6">
                           {deepTab === 'lineups' && deepData.lineups && (
                              <div className="grid md:grid-cols-2 gap-6">
                                 {['home', 'away'].map((side) => {
                                    const lineup = deepData.lineups[side];
                                    if (!lineup) return null;
                                    const teamName =
                                       side === 'home'
                                          ? match?.homeTeam.name
                                          : match?.awayTeam.name;
                                    return (
                                       <div
                                          key={side}
                                          className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                                       >
                                          <div className="flex items-center justify-between mb-3">
                                             <h4 className="font-black text-white text-sm uppercase">
                                                {teamName}
                                             </h4>
                                             {lineup.formation && (
                                                <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                                                   {lineup.formation}
                                                </span>
                                             )}
                                          </div>
                                          <div className="space-y-2">
                                             {(lineup.players || []).map(
                                                (player: any, i: number) => (
                                                   <div
                                                      key={i}
                                                      className={`flex items-center gap-3 p-2 rounded-lg ${player.isSub ? 'opacity-60' : ''}`}
                                                   >
                                                      <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                                                         {player.number ??
                                                            i + 1}
                                                      </span>
                                                      <span className="text-sm text-white font-medium flex-1 truncate">
                                                         {player.name}
                                                      </span>
                                                      {player.position && (
                                                         <span className="text-xs text-slate-500 flex-shrink-0">
                                                            {player.position}
                                                         </span>
                                                      )}
                                                      {player.isSub && (
                                                         <span className="text-xs text-yellow-500 flex-shrink-0">
                                                            SUB
                                                         </span>
                                                      )}
                                                   </div>
                                                )
                                             )}
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           )}

                           {deepTab === 'stats' && deepData.stats && (
                              <div className="space-y-3">
                                 {Object.entries(deepData.stats.home || {}).map(
                                    ([key, homeVal]) => {
                                       const awayVal = (deepData.stats.away ||
                                          {})[key];
                                       if (homeVal == null && awayVal == null)
                                          return null;
                                       const label = key
                                          .replace(/_/g, ' ')
                                          .replace(/\b\w/g, (c) =>
                                             c.toUpperCase()
                                          );
                                       const h = Number(homeVal) || 0;
                                       const a = Number(awayVal) || 0;
                                       const total = h + a || 1;
                                       return (
                                          <div
                                             key={key}
                                             className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30"
                                          >
                                             <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                                                <span className="text-cyan-400">
                                                   {String(homeVal ?? 0)}
                                                </span>
                                                <span className="text-slate-400 uppercase tracking-wide">
                                                   {label}
                                                </span>
                                                <span className="text-purple-400">
                                                   {String(awayVal ?? 0)}
                                                </span>
                                             </div>
                                             <div className="flex h-2 rounded-full overflow-hidden bg-slate-700">
                                                <div
                                                   className="bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                                                   style={{
                                                      width: `${(h / total) * 100}%`,
                                                   }}
                                                />
                                                <div className="bg-gradient-to-r from-purple-400 to-purple-500 transition-all flex-1" />
                                             </div>
                                          </div>
                                       );
                                    }
                                 )}
                              </div>
                           )}

                           {deepTab === 'incidents' &&
                              deepData.incidents?.length > 0 && (
                                 <div className="space-y-2">
                                    {deepData.incidents.map(
                                       (inc: any, i: number) => (
                                          <div
                                             key={i}
                                             className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30"
                                          >
                                             <span className="w-10 text-center text-xs font-black text-slate-400 flex-shrink-0">
                                                {inc.time
                                                   ? `${inc.time}'`
                                                   : '—'}
                                             </span>
                                             <span
                                                className={`text-sm font-black flex-shrink-0 ${
                                                   inc.type === 'goal'
                                                      ? 'text-green-400'
                                                      : inc.type ===
                                                          'yellow_card'
                                                        ? 'text-yellow-400'
                                                        : inc.type ===
                                                            'red_card'
                                                          ? 'text-red-400'
                                                          : 'text-slate-400'
                                                }`}
                                             >
                                                {inc.type === 'goal'
                                                   ? '⚽'
                                                   : inc.type === 'yellow_card'
                                                     ? '🟨'
                                                     : inc.type === 'red_card'
                                                       ? '🟥'
                                                       : inc.type === 'sub'
                                                         ? '🔄'
                                                         : '•'}
                                             </span>
                                             <div className="flex-1 min-w-0">
                                                <span className="text-sm text-white font-medium truncate block">
                                                   {inc.player ?? '—'}
                                                </span>
                                                {inc.team && (
                                                   <span className="text-xs text-slate-500">
                                                      {inc.team}
                                                   </span>
                                                )}
                                             </div>
                                          </div>
                                       )
                                    )}
                                 </div>
                              )}

                           {deepTab === 'odds' && deepData.odds && (
                              <div className="grid grid-cols-3 gap-4">
                                 {[
                                    {
                                       label: match?.homeTeam.name ?? 'Home',
                                       key: 'home_win',
                                       color: 'from-cyan-600 to-blue-600',
                                    },
                                    {
                                       label: 'Draw',
                                       key: 'draw',
                                       color: 'from-slate-600 to-slate-500',
                                    },
                                    {
                                       label: match?.awayTeam.name ?? 'Away',
                                       key: 'away_win',
                                       color: 'from-purple-600 to-pink-600',
                                    },
                                 ].map(({ label, key, color }) => {
                                    const odd = deepData.odds[key];
                                    return (
                                       <div
                                          key={key}
                                          className={`bg-gradient-to-br ${color} rounded-xl p-4 text-center shadow-lg`}
                                       >
                                          <div className="text-xs text-white/70 font-semibold uppercase mb-1 truncate">
                                             {label}
                                          </div>
                                          <div className="text-2xl font-black text-white">
                                             {odd?.decimal ?? '—'}
                                          </div>
                                          {odd?.fractional && (
                                             <div className="text-xs text-white/60 mt-1">
                                                {odd.fractional}
                                             </div>
                                          )}
                                       </div>
                                    );
                                 })}
                                 {deepData.odds.bookmaker && (
                                    <div className="col-span-3 text-center text-xs text-slate-500 mt-2">
                                       via {deepData.odds.bookmaker}
                                    </div>
                                 )}
                              </div>
                           )}

                           {deepTab === 'votes' && deepData.votes && (
                              <div className="space-y-4">
                                 {[
                                    {
                                       label: `${match?.homeTeam.name ?? 'Home'} Win`,
                                       pct: deepData.votes.home_win_pct,
                                       color: 'bg-cyan-500',
                                    },
                                    {
                                       label: 'Draw',
                                       pct: deepData.votes.draw_pct,
                                       color: 'bg-slate-500',
                                    },
                                    {
                                       label: `${match?.awayTeam.name ?? 'Away'} Win`,
                                       pct: deepData.votes.away_win_pct,
                                       color: 'bg-purple-500',
                                    },
                                 ].map(({ label, pct, color }) => (
                                    <div key={label}>
                                       <div className="flex justify-between text-sm font-bold mb-1">
                                          <span className="text-slate-300">
                                             {label}
                                          </span>
                                          <span className="text-white">
                                             {pct != null ? `${pct}%` : '—'}
                                          </span>
                                       </div>
                                       <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                          <div
                                             className={`h-full ${color} rounded-full transition-all`}
                                             style={{ width: `${pct ?? 0}%` }}
                                          />
                                       </div>
                                    </div>
                                 ))}
                                 {deepData.votes.total_votes != null && (
                                    <p className="text-xs text-slate-500 text-center">
                                       {deepData.votes.total_votes.toLocaleString()}{' '}
                                       total votes
                                    </p>
                                 )}
                              </div>
                           )}

                           {deepTab === 'h2h' && deepData.h2h && (
                              <div className="space-y-4">
                                 <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                    {[
                                       {
                                          label: match?.homeTeam.name ?? 'Home',
                                          val: deepData.h2h.home_team_wins,
                                          color: 'text-cyan-400',
                                       },
                                       {
                                          label: 'Draws',
                                          val: deepData.h2h.draws,
                                          color: 'text-slate-400',
                                       },
                                       {
                                          label: match?.awayTeam.name ?? 'Away',
                                          val: deepData.h2h.away_team_wins,
                                          color: 'text-purple-400',
                                       },
                                    ].map(({ label, val, color }) => (
                                       <div
                                          key={label}
                                          className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30"
                                       >
                                          <div
                                             className={`text-3xl font-black ${color}`}
                                          >
                                             {val ?? '—'}
                                          </div>
                                          <div className="text-xs text-slate-400 truncate mt-1">
                                             {label}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                                 {deepData.h2h.recent_matches?.length > 0 && (
                                    <div className="space-y-2">
                                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                          Recent Meetings
                                       </h4>
                                       {deepData.h2h.recent_matches
                                          .slice(0, 5)
                                          .map((m: any, i: number) => (
                                             <div
                                                key={i}
                                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 text-sm"
                                             >
                                                <span className="text-slate-300 truncate flex-1">
                                                   {m.home_team ?? '?'}
                                                </span>
                                                <span className="font-black text-white mx-3 flex-shrink-0">
                                                   {m.score ?? '—'}
                                                </span>
                                                <span className="text-slate-300 truncate flex-1 text-right">
                                                   {m.away_team ?? '?'}
                                                </span>
                                             </div>
                                          ))}
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     </>
                  )}
               </div>
            </PremiumGate>

            {/* Error Display */}
            {err && (
               <div className="relative overflow-hidden bg-gradient-to-br from-red-900/30 to-red-800/30 border-2 border-red-500/50 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.15),transparent)]"></div>
                  <div className="relative flex items-center gap-3">
                     <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                     </div>
                     <p className="text-sm text-red-300 font-bold">⚠️ {err}</p>
                  </div>
               </div>
            )}
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
            .custom-scrollbar::-webkit-scrollbar {
               width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
               background: rgba(15, 23, 42, 0.5);
               border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
               background: linear-gradient(
                  to bottom,
                  rgb(6, 182, 212),
                  rgb(59, 130, 246)
               );
               border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
               background: linear-gradient(
                  to bottom,
                  rgb(8, 145, 178),
                  rgb(37, 99, 235)
               );
               border-radius: 10px;
            }
         `}</style>
      </div>
   );
}
