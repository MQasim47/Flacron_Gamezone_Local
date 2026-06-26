'use client';

import { getAllDeepData } from '@/shared/api/deepData';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
   Trophy,
   Clock,
   MapPin,
   Sparkles,
   Globe,
   FileText,
   TrendingUp,
   AlertCircle,
   Flame,
   Crosshair,
   Lock,
} from 'lucide-react';
import { apiGet, apiPost } from '@/shared/api/base';
import StreamEmbed from '@/entities/stream/ui/StreamEmbed';
import { PremiumGate } from '@/shared/ui/PremiumGate';
import { BackButton } from '@/shared/ui/BackButton';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { DeepDataSection } from './DeepDataSection';
import { SCROLLBAR_STYLES } from '../model/matchDetail.constants';
import type { Match, AISummary, Lang } from '../model/matchDetail.types';

interface Props {
   initialMatch: Match | null;
   matchId: string;
}

function getStatusBadge(status: string) {
   switch (status) {
      case 'LIVE':
         return (
            <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-500/50">
               <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl animate-pulse" />
               <div className="relative flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
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
}

export function MatchDetailClient({ initialMatch, matchId }: Props) {
   const [match, setMatch] = useState<Match | null>(initialMatch);
   const [err, setErr] = useState('');
   const [lang, setLang] = useState<Lang>('en');
   const [generating, setGenerating] = useState<string | null>(null);
   const [successMsg, setSuccessMsg] = useState('');
   const [loadingMatch, setLoadingMatch] = useState(!initialMatch);
   const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   const [deepData, setDeepData] = useState<any>(null);
   const [deepLoading, setDeepLoading] = useState(false);
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
         // silent fail
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
         if (data && match)
            setMatch((prev) => (prev ? { ...prev, aiTexts: data } : prev));
      } catch {}
   }

   useEffect(() => {
      if (isPremium && matchId) loadDeepData();
   }, [matchId, isPremium]);
   useEffect(() => {
      if (!initialMatch) loadMatch();
   }, [matchId]);
   useEffect(() => {
      if (match) loadAIContent();
   }, [lang, match?.id, isPremium]);
   useEffect(
      () => () => {
         if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      },
      []
   );

   async function generateAI(kind: 'preview' | 'summary') {
      const exists = match?.aiTexts?.some(
         (t) => t.kind === kind && t.language === lang
      );
      if (exists) return;
      const key = kind === 'preview' ? 'match-preview' : 'match-summary';
      try {
         setGenerating(key);
         setErr('');
         setSuccessMsg('');
         const response = await apiPost<AISummary>(`/api/ai/${kind}`, {
            matchId,
            language: lang,
         });
         setMatch((prev) =>
            prev ? { ...prev, aiTexts: [...prev.aiTexts, response] } : prev
         );
         setSuccessMsg(
            `✅ ${kind === 'preview' ? 'Preview' : 'Summary'} generated successfully!`
         );
         await loadAIContent();
         if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
         successTimeoutRef.current = setTimeout(() => setSuccessMsg(''), 3000);
      } catch (e: any) {
         setErr(e?.message || `Failed to generate ${kind}`);
      } finally {
         setGenerating(null);
      }
   }

   if (loadingMatch && !match) {
      return (
         <div className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
               <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-cyan-500/20 rounded-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-cyan-500/30">
                     <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-slate-300 font-bold text-xl">
                     ⚡ Loading match data...
                  </p>
               </div>
            </div>
         </div>
      );
   }

   if (err && !match) {
      return (
         <div className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
               <div className="mb-6">
                  <BackButton
                     label="Back"
                     onClick={() => window.history.back()}
                  />
               </div>
               <div className="text-center py-16 bg-gradient-to-br from-slate-900/90 to-red-900/30 border-2 border-red-500/30 rounded-2xl">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 font-bold text-xl mb-4">
                     ⚠️ {err}
                  </p>
                  <button
                     onClick={loadMatch}
                     className="bg-gradient-to-r from-red-600 to-red-500 text-white font-medium px-4 py-2 rounded-lg"
                  >
                     Try Again
                  </button>
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
            {/* Back */}
            <BackButton label="Back" onClick={() => window.history.back()} />

            {/* Premium upsell */}
            {!subLoading && !isPremium && (
               <div className="relative overflow-hidden bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-yellow-900/30 border-2 border-yellow-500/40 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
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
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 uppercase tracking-wider flex-shrink-0"
                     >
                        ⭐ Upgrade Now
                     </button>
                  </div>
               </div>
            )}

            {/* Success */}
            {successMsg && (
               <div className="relative overflow-hidden bg-gradient-to-br from-green-900/30 to-green-800/30 border-2 border-green-500/50 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                     <Sparkles className="w-5 h-5 text-green-400" />
                     <p className="text-sm text-green-300 font-bold">
                        {successMsg}
                     </p>
                  </div>
               </div>
            )}

            {/* Match Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(6,182,212,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15),transparent_50%)]" />
               <div className="relative z-10 p-6 md:p-10">
                  {/* League */}
                  <div className="flex items-center justify-center mb-8">
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

                  {/* Teams */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 md:gap-8 mb-6 sm:mb-8">
                     {/* Home */}
                     <div className="text-center md:text-right">
                        <div className="relative inline-block mb-2 sm:mb-4">
                           {match.homeTeam?.logo ? (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-900/90 rounded-2xl p-3 sm:p-4 border-2 border-cyan-500/50 shadow-2xl flex items-center justify-center">
                                 <img
                                    src={match.homeTeam.logo}
                                    alt={match.homeTeam.name}
                                    className="w-full h-full object-contain"
                                 />
                              </div>
                           ) : (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-900/90 rounded-2xl flex items-center justify-center text-xl sm:text-3xl md:text-4xl font-black border-2 border-cyan-500/50 shadow-2xl">
                                 {match.homeTeam?.name?.charAt(0)}
                              </div>
                           )}
                        </div>
                        <h2 className="text-sm sm:text-xl md:text-3xl font-black text-white mb-1 sm:mb-2 uppercase tracking-tight line-clamp-2">
                           {match.homeTeam?.name}
                        </h2>
                        <div className="inline-flex items-center gap-1.5 bg-cyan-500/20 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 border border-cyan-500/30">
                           <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                              🏠 Home
                           </span>
                        </div>
                     </div>

                     {/* Score */}
                     <div className="text-center min-w-[80px] sm:min-w-[120px] md:min-w-[180px]">
                        {match.status === 'FINISHED' ||
                        match.status === 'LIVE' ? (
                           <div className="space-y-2 sm:space-y-4">
                              <div className="text-3xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
                                 {match.score || '0-0'}
                              </div>
                              {getStatusBadge(match.status)}
                           </div>
                        ) : (
                           <div className="space-y-2 sm:space-y-4">
                              {getStatusBadge(match.status)}
                              <div className="flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm bg-slate-900/70 rounded-xl px-2 py-2 sm:px-4 sm:py-3 border-2 border-blue-500/30 shadow-lg">
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

                     {/* Away */}
                     <div className="text-center md:text-left">
                        <div className="relative inline-block mb-2 sm:mb-4">
                           {match.awayTeam?.logo ? (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-900/90 rounded-2xl p-3 sm:p-4 border-2 border-blue-500/50 shadow-2xl flex items-center justify-center">
                                 <img
                                    src={match.awayTeam.logo}
                                    alt={match.awayTeam.name}
                                    className="w-full h-full object-contain"
                                 />
                              </div>
                           ) : (
                              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-slate-900/90 rounded-2xl flex items-center justify-center text-xl sm:text-3xl md:text-4xl font-black border-2 border-blue-500/50 shadow-2xl">
                                 {match.awayTeam?.name?.charAt(0)}
                              </div>
                           )}
                        </div>
                        <h2 className="text-sm sm:text-xl md:text-3xl font-black text-white mb-1 sm:mb-2 uppercase tracking-tight line-clamp-2">
                           {match.awayTeam?.name}
                        </h2>
                        <div className="inline-flex items-center gap-1.5 bg-blue-500/20 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 border border-blue-500/30">
                           <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                              ✈️ Away
                           </span>
                        </div>
                     </div>
                  </div>

                  {match.venue && (
                     <div className="flex items-center justify-center">
                        <div className="inline-flex items-center gap-2 bg-slate-900/70 rounded-xl px-5 py-2.5 border border-slate-700/50 shadow-lg">
                           <MapPin className="w-4 h-4 text-cyan-400" />
                           <span className="text-sm text-slate-300 font-semibold">
                              {match.venue.name}
                              {match.venue.city ? `, ${match.venue.city}` : ''}
                           </span>
                        </div>
                     </div>
                  )}
               </div>
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />
            </div>

            {/* Language */}
            {isPremium && (
               <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Globe className="w-5 h-5 text-white" />
                     </div>
                     <h3 className="text-lg font-black text-white uppercase tracking-wide">
                        Language
                     </h3>
                  </div>
                  <select
                     aria-label="Select language"
                     className="w-full bg-slate-800/90 border-2 border-purple-500/50 rounded-xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-400"
                     value={lang}
                     onChange={(e) => setLang(e.target.value as Lang)}
                  >
                     <option value="en">🇬🇧 English</option>
                     <option value="fr">🇫🇷 French</option>
                  </select>
               </div>
            )}

            {/* Stream */}
            <PremiumGate isPremium={isPremium} feature="Live Stream">
               <StreamEmbed
                  stream={match.stream}
                  matchStatus={match.status}
                  homeTeam={match.homeTeam.name}
                  awayTeam={match.awayTeam.name}
                  matchId={match.id}
               />
            </PremiumGate>

            {/* AI */}
            <PremiumGate isPremium={isPremium} feature="AI Match Analysis">
               <div className="grid md:grid-cols-2 gap-6">
                  {(['preview', 'summary'] as const).map((kind) => {
                     const existing = kind === 'preview' ? preview : summary;
                     const genKey =
                        kind === 'preview' ? 'match-preview' : 'match-summary';
                     const isPreview = kind === 'preview';
                     return (
                        <div
                           key={kind}
                           className={`relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 ${isPreview ? 'border-cyan-500/30' : 'border-purple-500/30'} rounded-2xl shadow-2xl`}
                        >
                           <div className="relative p-6">
                              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                                 <div className="flex items-center gap-3">
                                    <div
                                       className={`w-10 h-10 bg-gradient-to-br ${isPreview ? 'from-cyan-600 to-blue-600' : 'from-purple-600 to-pink-600'} rounded-xl flex items-center justify-center shadow-lg`}
                                    >
                                       {isPreview ? (
                                          <Sparkles className="w-5 h-5 text-white" />
                                       ) : (
                                          <TrendingUp className="w-5 h-5 text-white" />
                                       )}
                                    </div>
                                    <div>
                                       <h3 className="font-black text-white text-lg uppercase tracking-wide">
                                          AI {isPreview ? 'Preview' : 'Summary'}
                                       </h3>
                                       <p
                                          className={`text-xs ${isPreview ? 'text-cyan-400' : 'text-purple-400'} font-bold`}
                                       >
                                          {isPreview
                                             ? '⚡ Pre-Match Analysis'
                                             : '🔥 Post-Match Report'}
                                       </p>
                                    </div>
                                 </div>
                                 <button
                                    onClick={() => generateAI(kind)}
                                    disabled={
                                       generating === genKey || !!existing
                                    }
                                    className={`bg-gradient-to-r ${isPreview ? 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500' : 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'} disabled:from-slate-700 disabled:to-slate-700 text-white font-black px-5 py-3 rounded-xl text-sm transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-md uppercase tracking-wide`}
                                 >
                                    {generating === genKey ? (
                                       <span className="flex items-center gap-2">
                                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                          Generating...
                                       </span>
                                    ) : (
                                       <span className="flex items-center gap-2">
                                          <Crosshair className="w-4 h-4" />
                                          {existing ? 'Generated' : 'Generate'}
                                       </span>
                                    )}
                                 </button>
                              </div>
                              <div
                                 className={`bg-slate-950/60 rounded-xl p-5 min-h-[240px] max-h-[420px] overflow-y-auto border-2 ${isPreview ? 'border-cyan-500/20' : 'border-purple-500/20'} backdrop-blur-sm custom-scrollbar`}
                              >
                                 {existing?.content ? (
                                    <div className="space-y-3">
                                       <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                                          {existing.content}
                                       </p>
                                       {existing.provider && (
                                          <div
                                             className={`flex items-center gap-2 pt-3 border-t ${isPreview ? 'border-cyan-500/30' : 'border-purple-500/30'}`}
                                          >
                                             <Flame
                                                className={`w-3 h-3 ${isPreview ? 'text-cyan-400' : 'text-purple-400'}`}
                                             />
                                             <span
                                                className={`text-xs ${isPreview ? 'text-cyan-400' : 'text-purple-400'} font-bold uppercase`}
                                             >
                                                Powered by {existing.provider}
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
                                          {isPreview
                                             ? '⚡ No preview yet'
                                             : '🔥 No summary yet'}
                                       </p>
                                       <p className="text-xs text-slate-600 font-semibold">
                                          AI {kind} can be generated once
                                       </p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </PremiumGate>

            {/* Deep Data */}
            <PremiumGate isPremium={isPremium} feature="Deep Match Data">
               <DeepDataSection
                  deepData={deepData}
                  deepLoaded={deepLoaded}
                  deepLoading={deepLoading}
                  match={match}
                  onLoad={loadDeepData}
               />
            </PremiumGate>

            {/* Error */}
            {err && (
               <div className="relative overflow-hidden bg-gradient-to-br from-red-900/30 to-red-800/30 border-2 border-red-500/50 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center gap-3">
                     <AlertCircle className="w-5 h-5 text-red-400" />
                     <p className="text-sm text-red-300 font-bold">⚠️ {err}</p>
                  </div>
               </div>
            )}
         </div>

         <style jsx>{SCROLLBAR_STYLES}</style>
      </div>
   );
}
