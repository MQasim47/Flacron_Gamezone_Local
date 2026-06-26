'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
   Calendar,
   Filter,
   Trophy,
   Clock,
   Sparkles,
   Play,
   TrendingUp,
   ChevronLeft,
   ChevronRight,
} from 'lucide-react';
import { apiGet } from '@/shared/api/base';
import { ScrollToTop } from '@/shared/ui/ScrollToTop';

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

interface Venue {
   id: string;
   name: string;
   city: string | null;
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
   venue: Venue | null;
   league: League | null;
   homeTeam: Team;
   awayTeam: Team;
}

interface PaginatedResponse {
   matches: Match[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
   };
}

interface MatchesClientProps {
   initialMatches: Match[];
}

const PAGE_SIZE = 20;

export function MatchesClient({ initialMatches }: MatchesClientProps) {
   const [status, setStatus] = useState('');
   const [date, setDate] = useState('');
   const [selectedLeague, setSelectedLeague] = useState('');
   const [selectedTeam, setSelectedTeam] = useState('');
   const [allMatches, setAllMatches] = useState<Match[]>(initialMatches);
   const [showFilters, setShowFilters] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalMatches, setTotalMatches] = useState(0);
   const [hasMore, setHasMore] = useState(false);

   // Leagues and teams for filter dropdowns — fetched separately and lightly
   const [leagues, setLeagues] = useState<League[]>([]);
   const [teams, setTeams] = useState<Team[]>([]);

   // Fetch filter options once on mount (these endpoints are small)
   useEffect(() => {
      apiGet<{ leagues: League[]; pagination: unknown }>(
         '/api/leagues?limit=200'
      )
         .then((r) => setLeagues(r.leagues ?? []))
         .catch(() => {});

      apiGet<Team[] | { teams: Team[] }>('/api/teams?limit=500')
         .then((r) => setTeams(Array.isArray(r) ? r : ((r as any).teams ?? [])))
         .catch(() => {});
   }, []);

   const fetchMatches = useCallback(
      async (page = 1) => {
         try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
               page: String(page),
               limit: String(PAGE_SIZE),
            });
            if (status) params.set('status', status);
            if (date) params.set('date', date);
            if (selectedLeague) params.set('leagueId', selectedLeague);
            if (selectedTeam) params.set('teamId', selectedTeam);

            // Try paginated shape first; fall back to plain array for older API versions
            const raw = await apiGet<PaginatedResponse | Match[]>(
               `/api/matches?${params}`
            );

            if (Array.isArray(raw)) {
               // Legacy: plain array — no server-side pagination
               setAllMatches(raw);
               setTotalMatches(raw.length);
               setHasMore(false);
            } else {
               setAllMatches(raw.matches ?? []);
               setTotalMatches(raw.pagination?.total ?? 0);
               setHasMore(raw.pagination?.hasMore ?? false);
               setCurrentPage(raw.pagination?.page ?? page);
            }
         } catch (err) {
            setError(
               err instanceof Error ? err.message : 'Failed to load matches.'
            );
         } finally {
            setLoading(false);
         }
      },
      [status, date, selectedLeague, selectedTeam]
   );

   // Fetch on mount and whenever filters change
   useEffect(() => {
      setCurrentPage(1);
      fetchMatches(1);
   }, [fetchMatches]);

   const handlePrev = () => {
      const prev = Math.max(1, currentPage - 1);
      setCurrentPage(prev);
      fetchMatches(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const handleNext = () => {
      const next = currentPage + 1;
      setCurrentPage(next);
      fetchMatches(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const totalPages = Math.ceil(totalMatches / PAGE_SIZE);

   const getStatusBadge = (matchStatus: string) => {
      switch (matchStatus) {
         case 'LIVE':
            return (
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/50 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  LIVE
               </span>
            );
         case 'FINISHED':
            return (
               <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 text-slate-200">
                  FINISHED
               </span>
            );
         case 'UPCOMING':
            return (
               <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/20">
                  UPCOMING
               </span>
            );
         default:
            return (
               <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
                  {matchStatus}
               </span>
            );
      }
   };

   const liveCount = allMatches.filter((m) => m.status === 'LIVE').length;

   return (
      <div className="space-y-6">
         {/* Hero Section */}
         <div className="relative overflow-hidden border border-navy-light/40 rounded-2xl shadow-2xl">
            <Image
               src="/hero-matches.jpg"
               alt="Football stadium"
               fill
               priority
               className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy/85 to-navy-dark/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-transparent to-transparent" />
            <div className="relative z-10 p-6 sm:p-8 md:p-12">
               <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 backdrop-blur-sm">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                     <span className="text-xs sm:text-sm font-semibold text-red-400">
                        {liveCount} Live Matches Now
                     </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-brand-light to-purple-300 bg-clip-text text-transparent leading-tight">
                     Watch Football
                     <br />
                     Matches Live
                  </h1>

                  <p className="text-slate-300 text-sm sm:text-lg mb-4 sm:mb-6 max-w-xl">
                     Stream live matches, get real-time scores, and never miss a
                     moment of the action.
                  </p>

                  <div className="flex flex-wrap gap-4 sm:gap-6 mb-4 sm:mb-6">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand to-brand-dark rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                           <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                           <div className="text-xl sm:text-2xl font-bold text-white">
                              {liveCount}
                           </div>
                           <div className="text-xs text-slate-400">
                              Live Now
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                           <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                           <div className="text-xl sm:text-2xl font-bold text-white">
                              {totalMatches}
                           </div>
                           <div className="text-xs text-slate-400">Total</div>
                        </div>
                     </div>
                  </div>

                  <Link
                     href="/live"
                     className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-white font-bold px-5 py-3 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base shadow-lg shadow-brand/30 transition-all duration-300 hover:scale-105"
                  >
                     <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                     Watch Live Matches
                  </Link>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-purple-500 to-pink-500" />
         </div>

         {/* Filters */}
         <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 sm:p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
               <Filter className="w-4 h-4 text-brand" />
               <h3 className="text-sm font-semibold text-slate-200">Filters</h3>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 items-center">
               <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="col-span-2 sm:col-auto bg-gradient-to-r from-slate-800 to-slate-700 hover:from-brand hover:to-brand-hover border border-slate-600/50 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-300"
               >
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Date Filter
               </button>
               <select
                  className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 rounded-lg px-2 py-2 text-xs sm:text-sm font-medium cursor-pointer text-slate-100 w-full sm:w-auto"
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  aria-label="Filter by league"
               >
                  <option value="">All Leagues</option>
                  {leagues.map((l) => (
                     <option key={l.id} value={l.id}>
                        {l.name}
                     </option>
                  ))}
               </select>
               <select
                  className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 rounded-lg px-2 py-2 text-xs sm:text-sm font-medium cursor-pointer text-slate-100 w-full sm:w-auto"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  aria-label="Filter by team"
               >
                  <option value="">All Teams</option>
                  {teams.map((t) => (
                     <option key={t.id} value={t.id}>
                        {t.name}
                     </option>
                  ))}
               </select>
               <select
                  className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 rounded-lg px-2 py-2 text-xs sm:text-sm font-medium cursor-pointer text-slate-100 w-full sm:w-auto"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  aria-label="Filter by status"
               >
                  <option value="">All Status</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="LIVE">Live</option>
                  <option value="FINISHED">Finished</option>
               </select>
               {(status || date || selectedLeague || selectedTeam) && (
                  <button
                     onClick={() => {
                        setStatus('');
                        setDate('');
                        setSelectedLeague('');
                        setSelectedTeam('');
                     }}
                     className="col-span-2 sm:col-auto bg-gradient-to-r from-red-600 to-red-500 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all"
                  >
                     Clear All
                  </button>
               )}
            </div>
            {showFilters && (
               <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <label className="block text-xs text-slate-400 mb-2 font-medium">
                     Select Date
                  </label>
                  <input
                     type="date"
                     value={date}
                     onChange={(e) => setDate(e.target.value)}
                     className="bg-slate-800 border border-slate-600/50 rounded-lg px-3 py-2 w-full text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
               </div>
            )}
         </div>
         {/* Loading */}
         {loading && (
            <div className="text-center py-12">
               <div className="inline-block w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
               <p className="text-slate-400 mt-4 text-sm">Loading matches...</p>
            </div>
         )}
         {/* Error */}
         {error && !loading && (
            <div className="text-center py-12 bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-700/50 rounded-xl">
               <Trophy className="w-12 h-12 text-red-400 mx-auto mb-3" />
               <p className="text-red-400 font-medium text-sm">{error}</p>
               <button
                  onClick={() => fetchMatches(currentPage)}
                  className="mt-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
               >
                  Try Again
               </button>
            </div>
         )}
         {/* Matches Grid */}
         {!loading && !error && (
            <div className="space-y-3 sm:space-y-4">
               <ScrollToTop />

               {allMatches.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/30 border border-slate-700/50 rounded-xl">
                     <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                     <p className="text-slate-400 font-medium text-sm">
                        No matches found
                     </p>
                     <p className="text-slate-600 text-xs mt-1">
                        Try adjusting your filters
                     </p>
                  </div>
               ) : (
                  allMatches.map((m) => (
                     <Link key={m.id} href={`/match/${m.id}`}>
                        <div className="group relative bg-gradient-to-br from-navy/80 to-navy-dark/90 backdrop-blur-xl border border-navy-light/40 hover:border-brand/50 rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-brand/10 cursor-pointer my-3 sm:my-4">
                           {/* League badge */}
                           <div className="flex items-center justify-center mb-3">
                              <div className="inline-flex items-center gap-1.5 bg-slate-800/70 border border-slate-600/30 rounded-full px-3 py-1">
                                 <Trophy className="w-3 h-3 text-yellow-500" />
                                 <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
                                    {m.league?.name || 'Unknown League'}
                                 </span>
                              </div>
                           </div>

                           {/* Teams row */}
                           <div className="flex items-center justify-between gap-3 sm:gap-4">
                              {/* Home */}
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                 <div className="flex-shrink-0">
                                    {m.homeTeam?.logo ? (
                                       <img
                                          src={m.homeTeam.logo}
                                          alt={m.homeTeam.name}
                                          className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xl bg-white/5 border border-slate-600/50 p-1"
                                       />
                                    ) : (
                                       <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-600/50">
                                          {m.homeTeam?.name
                                             .substring(0, 2)
                                             .toUpperCase()}
                                       </div>
                                    )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <span className="font-bold text-sm truncate block group-hover:text-brand transition-colors">
                                       {m.homeTeam?.name}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                       Home
                                    </span>
                                 </div>
                              </div>

                              {/* Score / Status */}
                              <div className="text-center flex-shrink-0 min-w-[90px] sm:min-w-[120px]">
                                 {m.status === 'FINISHED' ||
                                 m.status === 'LIVE' ? (
                                    <>
                                       <div className="text-2xl sm:text-3xl font-bold mb-1 text-white tracking-tight">
                                          {m.score || '0-0'}
                                       </div>
                                       {getStatusBadge(m.status)}
                                    </>
                                 ) : (
                                    <>
                                       {getStatusBadge(m.status)}
                                       <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mt-1.5">
                                          <Clock className="w-3 h-3" />
                                          {new Date(
                                             m.kickoffTime
                                          ).toLocaleString('en-US', {
                                             month: 'short',
                                             day: 'numeric',
                                             hour: '2-digit',
                                             minute: '2-digit',
                                          })}
                                       </div>
                                    </>
                                 )}
                              </div>

                              {/* Away */}
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
                                 <div className="flex-1 min-w-0 text-right">
                                    <span className="font-bold text-sm truncate block group-hover:text-brand transition-colors">
                                       {m.awayTeam?.name}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                       Away
                                    </span>
                                 </div>
                                 <div className="flex-shrink-0">
                                    {m.awayTeam?.logo ? (
                                       <img
                                          src={m.awayTeam.logo}
                                          alt={m.awayTeam.name}
                                          className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xl bg-white/5 border border-slate-600/50 p-1"
                                       />
                                    ) : (
                                       <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-xs font-bold border border-slate-600/50">
                                          {m.awayTeam?.name
                                             .substring(0, 2)
                                             .toUpperCase()}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>

                           {/* Venue */}
                           {m.venue && (
                              <div className="text-xs text-slate-500 mt-3 text-center flex items-center justify-center gap-1.5">
                                 <Sparkles className="w-3 h-3" />
                                 {m.venue.name}
                                 {m.venue.city ? `, ${m.venue.city}` : ''}
                              </div>
                           )}
                        </div>
                     </Link>
                  ))
               )}
            </div>
         )}
         {/* Pagination */}
         {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 sm:p-4">
               <button
                  onClick={handlePrev}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 hover:border-brand/50 rounded-lg transition-all text-xs sm:text-sm font-medium"
               >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
               </button>

               <div className="text-xs sm:text-sm text-slate-400">
                  Page{' '}
                  <span className="font-bold text-brand">{currentPage}</span> of{' '}
                  <span className="font-bold text-slate-300">{totalPages}</span>
                  <span className="hidden sm:inline text-slate-500">
                     {' '}
                     · {totalMatches} total
                  </span>
               </div>

               <button
                  onClick={handleNext}
                  disabled={currentPage >= totalPages || !hasMore}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 hover:border-brand/50 rounded-lg transition-all text-xs sm:text-sm font-medium"
               >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         )}
      </div>
   );
}
