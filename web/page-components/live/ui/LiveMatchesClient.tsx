'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/shared/api/base';
import Link from 'next/link';
import Image from 'next/image';
import {
   Activity,
   Trophy,
   Clock,
   MapPin,
   Tv,
   AlertCircle,
   PlayCircle,
   Radio,
   WifiOff,
} from 'lucide-react';
import { ScrollToTop } from '@/shared/ui/ScrollToTop';

interface Team {
   id: string;
   name: string;
   logo: string | null;
}
interface League {
   id: string;
   name: string;
   country: string | null;
   logo: string | null;
}
interface Stream {
   type: 'EMBED' | 'NONE';
   provider: string | null;
   isActive: boolean;
}
interface Venue {
   id: string;
   name: string;
   city: string | null;
}

interface Match {
   id: string;
   homeTeam: Team;
   awayTeam: Team;
   league: League | null;
   kickoffTime: string;
   status: string;
   score: string | null;
   venue: Venue | null;
   stream: Stream | null;
}
interface ApiError {
   code: string;
   message: string;
}
interface LiveResponse {
   matches: Match[];
   apiError: ApiError | null;
}

const API_ERROR_MESSAGES: Record<string, { title: string; detail: string }> = {
   SUSPENDED: {
      title: 'Live data temporarily unavailable',
      detail:
         "Our football data provider account is suspended. Scores shown may be outdated. We're working on fixing this.",
   },
   QUOTA_EXCEEDED: {
      title: 'Live updates paused until tomorrow',
      detail:
         "We've hit our daily data limit. Live scores will resume updating tomorrow.",
   },
   NO_KEY: {
      title: 'Live data not configured',
      detail: 'Live score updates are not available right now.',
   },
   UNKNOWN: {
      title: 'Live data temporarily unavailable',
      detail: "We're having trouble connecting to our data provider.",
   },
};

export default function LiveMatchesClient({
   initialMatches,
   initialError = false,
}: {
   initialMatches: Match[];
   initialError?: boolean;
}) {
   const [matches, setMatches] = useState<Match[]>(initialMatches || []);
   const [apiError, setApiError] = useState<ApiError | null>(null);
   const [loading, setLoading] = useState(
      initialMatches.length === 0 && !initialError
   );
   const [error, setError] = useState(
      initialError ? 'Failed to load live matches' : ''
   );
   const [lastUpdate, setLastUpdate] = useState<Date | null>(
      initialMatches.length ? new Date() : null
   );
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
      let currentController: AbortController | null = null;

      async function loadMatches() {
         if (currentController) currentController.abort();
         currentController = new AbortController();
         try {
            setError('');
            const data = await apiGet<LiveResponse>('/api/matches/live', {
               signal: currentController.signal,
            });
            // Handle both old array shape and new object shape
            if (Array.isArray(data)) {
               setMatches(data);
               setApiError(null);
            } else {
               setMatches(data.matches ?? []);
               setApiError(data.apiError ?? null);
            }
            setLastUpdate(new Date());
         } catch (e: any) {
            if ((e as Error).name === 'AbortError') return;
            setError(e?.message || 'Failed to load live matches');
         } finally {
            setLoading(false);
         }
      }

      loadMatches();
      const interval = setInterval(loadMatches, 45000);
      return () => {
         clearInterval(interval);
         if (currentController) currentController.abort();
      };
   }, []);

   if (loading) {
      return (
         <div className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
               <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                     <Activity className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-slate-300 font-bold text-xl">
                     ⚡ Loading live matches...
                  </p>
               </div>
            </div>
         </div>
      );
   }

   const apiErrorInfo = apiError
      ? (API_ERROR_MESSAGES[apiError.code] ?? API_ERROR_MESSAGES.UNKNOWN)
      : null;

   return (
      <>
         <ScrollToTop />
         <div className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
               {/* Header */}
               <div className="bg-gradient-to-br from-slate-900/95 to-red-900/50 border-2 border-red-500/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center">
                           <Radio className="w-8 h-8 text-white" />
                        </div>
                        <div>
                           <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
                              Live Matches
                           </h1>
                           <p className="text-sm text-red-300 font-bold mt-1">
                              🔴 Auto-updates every 45 seconds
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-xs text-slate-400 font-semibold">
                           Last Update
                        </div>
                        <div className="text-sm text-white font-bold">
                           {mounted && lastUpdate
                              ? lastUpdate.toLocaleTimeString()
                              : '—'}
                        </div>
                     </div>
                  </div>
               </div>

               {/* API Error Banner */}
               {apiErrorInfo && (
                  <div className="bg-amber-900/30 border-2 border-amber-500/50 rounded-2xl p-5">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                           <WifiOff className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                           <p className="text-amber-300 font-bold text-sm">
                              {apiErrorInfo.title}
                           </p>
                           <p className="text-amber-400/70 text-xs mt-1">
                              {apiErrorInfo.detail}
                           </p>
                        </div>
                     </div>
                  </div>
               )}

               {/* Fetch Error */}
               {error && (
                  <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-5">
                     <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-sm text-red-300 font-bold">
                           {error}
                        </p>
                     </div>
                  </div>
               )}

               {/* Matches */}
               {matches.length > 0 ? (
                  <div className="grid gap-6">
                     {matches.map((match) => (
                        <Link
                           key={match.id}
                           href={`/match/${match.id}`}
                           className="group bg-gradient-to-br from-navy/90 to-navy-dark/95 border border-navy-light/40 rounded-2xl p-6 transition-all duration-200 hover:border-brand/50 hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-0.5"
                        >
                           <div className="space-y-4">
                              {match.league && (
                                 <div className="flex items-center gap-3">
                                    {match.league.logo ? (
                                       <Image
                                          src={match.league.logo}
                                          alt={match.league.name}
                                          width={32}
                                          height={32}
                                          style={{ height: 'auto' }}
                                          className="object-contain"
                                       />
                                    ) : (
                                       <Trophy className="w-8 h-8 text-brand" />
                                    )}
                                    <div>
                                       <div className="text-sm font-semibold text-white">
                                          {match.league.name}
                                       </div>
                                       {match.league.country && (
                                          <div className="text-xs text-brand">
                                             {match.league.country}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              )}
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                                 <div className="flex items-center justify-end gap-2 sm:gap-3">
                                    {match.homeTeam.logo && (
                                       <Image
                                          src={match.homeTeam.logo}
                                          alt={match.homeTeam.name}
                                          width={28}
                                          height={28}
                                          style={{ height: 'auto' }}
                                          className="object-contain w-6 h-6 sm:w-8 sm:h-8"
                                       />
                                    )}
                                    <span className="font-bold text-white text-sm sm:text-base truncate">
                                       {match.homeTeam.name}
                                    </span>
                                 </div>
                                 <div className="flex flex-col items-center gap-1 px-1">
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 uppercase tracking-wider">
                                       <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                       Live
                                    </span>
                                    <div className="bg-navy-dark/70 border border-brand/20 rounded-xl px-3 py-1 text-2xl sm:text-3xl font-bold text-brand text-center whitespace-nowrap">
                                       {match.score ?? 'vs'}
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-start gap-2 sm:gap-3">
                                    {match.awayTeam.logo && (
                                       <Image
                                          src={match.awayTeam.logo}
                                          alt={match.awayTeam.name}
                                          width={28}
                                          height={28}
                                          style={{ height: 'auto' }}
                                          className="object-contain w-6 h-6 sm:w-8 sm:h-8"
                                       />
                                    )}
                                    <span className="font-bold text-white text-sm sm:text-base truncate">
                                       {match.awayTeam.name}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-slate-400 border-t border-white/10 pt-3">
                                 {match.venue && (
                                    <div className="flex items-center gap-2">
                                       <MapPin className="w-4 h-4" />
                                       {match.venue.name}
                                       {match.venue.city
                                          ? `, ${match.venue.city}`
                                          : ''}
                                    </div>
                                 )}
                                 {match.stream?.type === 'EMBED' &&
                                 match.stream.isActive ? (
                                    <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full ml-auto">
                                       <PlayCircle className="w-4 h-4" />
                                       Stream Available
                                    </div>
                                 ) : (
                                    <div className="flex items-center gap-2 ml-auto">
                                       <Tv className="w-4 h-4" />
                                       Score Only
                                    </div>
                                 )}
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-16">
                     <Activity className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                     <h3 className="text-2xl font-bold text-white mb-2">
                        No Live Matches
                     </h3>
                     <p className="text-slate-400">
                        {apiErrorInfo
                           ? 'Live match data is currently unavailable.'
                           : 'Check back soon for live football action!'}
                     </p>
                     <Link
                        href="/matches"
                        className="inline-flex items-center gap-2 mt-6 bg-brand hover:bg-brand-hover transition text-white px-6 py-3 rounded-xl"
                     >
                        <Clock className="w-5 h-5" />
                        View Upcoming Matches
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </>
   );
}
