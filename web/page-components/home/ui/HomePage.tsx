'use client';

import { apiGet } from '@/shared/api/base';
import { ScrollToTop } from '@/shared/ui/ScrollToTop';
import {
   Calendar,
   ChevronRight,
   Clock,
   Globe,
   Play,
   Search,
   Sparkles,
   Trophy,
   Users,
   Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface League {
   id: string;
   name: string;
   country: string | null;
   logo: string;
}

interface Team {
   id: string;
   name: string;
   logo: string | null;
}

interface Match {
   id: string;
   homeTeam: Team;
   awayTeam: Team;
   league: League | null;
   kickoffTime: string;
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
   venue: string | null;
}

interface SearchResults {
   leagues: League[];
   teams: Team[];
   matches: Match[];
}

interface HomePageProps {
   initialFeaturedLeagues: League[];
   initialLiveMatches: Match[];
   initialUpcomingMatches: Match[];
}

// World Cup detection — matches league names containing "World Cup"
const isWorldCupMatch = (m: Match) =>
   !!m.league?.name && /world cup/i.test(m.league.name);

const Skeleton = ({ className = '' }: { className?: string }) => (
   <div
      className={`relative overflow-hidden bg-slate-800/60 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-slate-700/40 before:to-transparent ${className}`}
   />
);

export default function HomePage({
   initialFeaturedLeagues,
   initialLiveMatches,
   initialUpcomingMatches,
}: HomePageProps) {
   const [featuredLeagues, setFeaturedLeagues] = useState<League[]>(
      initialFeaturedLeagues
   );
   const [liveMatches, setLiveMatches] = useState<Match[]>(
      initialLiveMatches.slice(0, 4)
   );
   const [totalLiveMatches, setTotalLiveMatches] = useState<number>(
      initialLiveMatches.length
   );
   const [allLiveMatches, setAllLiveMatches] =
      useState<Match[]>(initialLiveMatches);
   const [upcomingMatches, setUpcomingMatches] = useState<Match[]>(
      initialUpcomingMatches
   );
   const [allUpcomingMatches, setAllUpcomingMatches] = useState<Match[]>(
      initialUpcomingMatches
   );
   const [searchQuery, setSearchQuery] = useState('');
   const [searchResults, setSearchResults] = useState<SearchResults | null>(
      null
   );
   const [isSearching, setIsSearching] = useState(false);
   const [loading] = useState(false);

   // ── Live matches: fetch, store, display ──────────────────────────────
   const refreshLiveMatches = useCallback(async () => {
      try {
         const liveRes = await apiGet<any>('/api/matches/live');
         const all: Match[] = Array.isArray(liveRes)
            ? liveRes
            : (liveRes.matches ?? []);
         setAllLiveMatches(all);
         setLiveMatches(all.slice(0, 4));
         setTotalLiveMatches(all.length);
      } catch {}
   }, []);

   // ── Upcoming matches: fetch, store, display (same pattern as live) ────
   const refreshUpcomingMatches = useCallback(async () => {
      try {
         const upcomingRes = await apiGet<any>('/api/matches?status=UPCOMING');
         const all: Match[] = Array.isArray(upcomingRes)
            ? upcomingRes
            : (upcomingRes.matches ?? []);
         setAllUpcomingMatches(all);
         setUpcomingMatches(all.slice(0, 6));
      } catch {}
   }, []);

   useEffect(() => {
      refreshLiveMatches();
      refreshUpcomingMatches();
      const liveInterval = setInterval(refreshLiveMatches, 45000);
      const upcomingInterval = setInterval(refreshUpcomingMatches, 60000);
      return () => {
         clearInterval(liveInterval);
         clearInterval(upcomingInterval);
      };
   }, [refreshLiveMatches, refreshUpcomingMatches]);

   useEffect(() => {
      const timer = setTimeout(() => {
         if (searchQuery.trim()) performSearch();
         else setSearchResults(null);
      }, 300);
      return () => clearTimeout(timer);
   }, [searchQuery]);

   async function performSearch() {
      if (!searchQuery.trim()) return;
      try {
         setIsSearching(true);
         const results = await apiGet<SearchResults>(
            `/api/search?q=${encodeURIComponent(searchQuery)}`
         );
         setSearchResults(results);
      } catch {
      } finally {
         setIsSearching(false);
      }
   }

   const getStatusBadge = (status: string) => {
      if (status === 'LIVE')
         return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg animate-pulse">
               <span className="w-1.5 h-1.5 bg-white rounded-full" />
               LIVE
            </span>
         );
      if (status === 'UPCOMING')
         return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
               <Clock className="w-3 h-3" />
               UPCOMING
            </span>
         );
      return null;
   };

   // World Cup matches: live ones first, then upcoming ones — from the same
   // fetched/stored datasets as the Live and Upcoming sections below.
   const worldCupLive = allLiveMatches.filter(isWorldCupMatch);
   const worldCupUpcoming = allUpcomingMatches.filter(isWorldCupMatch);
   const worldCupMatches = [...worldCupLive, ...worldCupUpcoming].slice(0, 4);

   return (
      <div className="space-y-8 sm:space-y-12">
         <ScrollToTop />

         {/* Hero Section */}
         <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
                  <div
                     className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '1s' }}
                  />
               </div>
               <div className="relative p-6 sm:p-8 md:p-16">
                  <div className="max-w-4xl">
                     <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs sm:text-sm font-semibold text-red-400">
                           {totalLiveMatches} Live Matches Now
                        </span>
                     </div>

                     <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                           Football Universe
                        </span>
                        <br />
                        <span className="text-slate-400 text-xl sm:text-3xl md:text-5xl">
                           Discover • Watch • Connect
                        </span>
                     </h1>

                     <p className="text-slate-300 text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl">
                        Your ultimate destination for live football matches,
                        comprehensive league coverage, and real-time updates.
                     </p>

                     <div className="flex flex-wrap gap-3 sm:gap-4">
                        <Link href="/live">
                           <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-5 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2 sm:gap-3">
                              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                              Watch Live
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                           </button>
                        </Link>
                        <Link href="/leagues">
                           <button className="group bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 text-white font-bold px-5 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base transition-all duration-300 hover:scale-105 flex items-center gap-2 sm:gap-3">
                              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                              Browse Leagues
                           </button>
                        </Link>
                     </div>

                     <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12 max-w-xs sm:max-w-2xl">
                        <div className="text-center">
                           <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                              {featuredLeagues.length}+
                           </div>
                           <div className="text-xs sm:text-sm text-slate-400 mt-1">
                              Leagues
                           </div>
                        </div>
                        <div className="text-center">
                           <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              {totalLiveMatches}
                           </div>
                           <div className="text-xs sm:text-sm text-slate-400 mt-1">
                              Live Now
                           </div>
                        </div>
                        <div className="text-center">
                           <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                              {upcomingMatches.length}+
                           </div>
                           <div className="text-xs sm:text-sm text-slate-400 mt-1">
                              Upcoming
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </div>
         </div>

         {/* Global Search */}
         <div className="relative max-w-3xl mx-auto">
            <div className="relative">
               <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
               <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search teams, leagues, or matches..."
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl pl-11 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
               />
               {isSearching && (
                  <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2">
                     <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
               )}
            </div>

            {searchResults && searchQuery && (
               <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl shadow-2xl max-h-[70vw] sm:max-h-[500px] overflow-y-auto z-50">
                  {searchResults.leagues.length > 0 && (
                     <div className="p-3 sm:p-4 border-b border-slate-700/50">
                        <div className="text-xs font-semibold text-slate-400 mb-2 sm:mb-3 flex items-center gap-2">
                           <Trophy className="w-4 h-4" />
                           LEAGUES
                        </div>
                        <div className="space-y-1">
                           {searchResults.leagues.map((league) => (
                              <Link
                                 key={league.id}
                                 href={`/leagues/${league.id}`}
                                 className="flex items-center gap-3 p-2 sm:p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                                 onClick={() => setSearchQuery('')}
                              >
                                 <img
                                    src={league.logo}
                                    alt={league.name}
                                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                                 />
                                 <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                       {league.name}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                       {league.country}
                                    </div>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  )}
                  {searchResults.teams.length > 0 && (
                     <div className="p-3 sm:p-4 border-b border-slate-700/50">
                        <div className="text-xs font-semibold text-slate-400 mb-2 sm:mb-3 flex items-center gap-2">
                           <Users className="w-4 h-4" />
                           TEAMS
                        </div>
                        <div className="space-y-1">
                           {searchResults.teams.map((team) => (
                              <Link
                                 key={team.id}
                                 href={`/teams/${team.id}`}
                                 className="flex items-center gap-3 p-2 sm:p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                                 onClick={() => setSearchQuery('')}
                              >
                                 {team.logo ? (
                                    <img
                                       src={team.logo}
                                       alt={team.name}
                                       className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                                    />
                                 ) : (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                                       {team.name.substring(0, 2).toUpperCase()}
                                    </div>
                                 )}
                                 <div className="font-medium text-sm truncate">
                                    {team.name}
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  )}
                  {searchResults.matches.length > 0 && (
                     <div className="p-3 sm:p-4">
                        <div className="text-xs font-semibold text-slate-400 mb-2 sm:mb-3 flex items-center gap-2">
                           <Play className="w-4 h-4" />
                           MATCHES
                        </div>
                        <div className="space-y-1">
                           {searchResults.matches.map((match) => (
                              <Link
                                 key={match.id}
                                 href={`/match/${match.id}`}
                                 className="block p-2 sm:p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                                 onClick={() => setSearchQuery('')}
                              >
                                 <div className="flex items-center justify-between gap-2 text-sm">
                                    <span className="truncate flex-1">
                                       {match.homeTeam.name}
                                    </span>
                                    <span className="text-slate-500 flex-shrink-0">
                                       vs
                                    </span>
                                    <span className="truncate flex-1 text-right">
                                       {match.awayTeam.name}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(match.status)}
                                    <span className="text-xs text-slate-500">
                                       {new Date(
                                          match.kickoffTime
                                       ).toLocaleDateString()}
                                    </span>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  )}
                  {searchResults.leagues.length === 0 &&
                     searchResults.teams.length === 0 &&
                     searchResults.matches.length === 0 && (
                        <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">
                           No results found for "{searchQuery}"
                        </div>
                     )}
               </div>
            )}
         </div>

         {/* World Cup Spotlight Section */}
         {worldCupMatches.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
               <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                  <div className="relative bg-gradient-to-br from-yellow-900/50 via-amber-900/40 to-yellow-900/50 backdrop-blur-xl border border-yellow-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                     <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                           <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                 <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                                    World Cup Spotlight
                                 </h2>
                                 {worldCupLive.length > 0 && (
                                    <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                                       <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                          <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500" />
                                       </span>
                                       <span className="text-xs font-black text-red-400 uppercase tracking-wide">
                                          {worldCupLive.length} LIVE
                                       </span>
                                    </div>
                                 )}
                              </div>
                              <p className="text-xs sm:text-sm text-yellow-300 font-medium mt-0.5">
                                 🏆 Follow the World Cup action live
                              </p>
                           </div>
                        </div>
                        <Link
                           href="/matches"
                           className="hidden sm:flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 hover:text-yellow-200 font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm transition-all"
                        >
                           View All <ChevronRight className="w-4 h-4" />
                        </Link>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {worldCupMatches.map((match) => (
                     <Link key={match.id} href={`/match/${match.id}`}>
                        <div className="group relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-yellow-500/30 hover:border-yellow-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg">
                           <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                              {match.status === 'LIVE' ? (
                                 <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg">
                                    <span className="relative flex h-2 w-2">
                                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                       <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                    </span>
                                    <span className="text-xs font-black text-white uppercase">
                                       LIVE
                                    </span>
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
                                    <Clock className="w-3 h-3 text-white" />
                                    <span className="text-xs font-black text-white uppercase">
                                       Upcoming
                                    </span>
                                 </div>
                              )}
                           </div>
                           <div className="space-y-3 sm:space-y-4">
                              <div className="flex items-center gap-2">
                                 {match.league?.logo && (
                                    <img
                                       src={match.league.logo}
                                       alt={match.league.name}
                                       className="w-5 h-5 object-contain"
                                    />
                                 )}
                                 <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide truncate">
                                    {match.league?.name}
                                 </span>
                              </div>
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
                                 <div className="text-right">
                                    <div className="flex justify-end mb-2">
                                       {match.homeTeam.logo ? (
                                          <img
                                             src={match.homeTeam.logo}
                                             alt={match.homeTeam.name}
                                             className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                                          />
                                       ) : (
                                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-700 rounded-xl flex items-center justify-center text-base sm:text-xl font-black">
                                             {match.homeTeam.name.substring(
                                                0,
                                                2
                                             )}
                                          </div>
                                       )}
                                    </div>
                                    <div className="text-xs sm:text-base font-bold text-white truncate">
                                       {match.homeTeam.name}
                                    </div>
                                 </div>
                                 <div className="text-center min-w-[60px] sm:min-w-[90px]">
                                    {match.status === 'LIVE' ? (
                                       <div className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                                          {match.score || '0-0'}
                                       </div>
                                    ) : (
                                       <div className="text-xs sm:text-sm font-bold text-slate-300">
                                          {new Date(
                                             match.kickoffTime
                                          ).toLocaleString('en-US', {
                                             month: 'short',
                                             day: 'numeric',
                                             hour: '2-digit',
                                             minute: '2-digit',
                                          })}
                                       </div>
                                    )}
                                 </div>
                                 <div className="text-left">
                                    <div className="flex justify-start mb-2">
                                       {match.awayTeam.logo ? (
                                          <img
                                             src={match.awayTeam.logo}
                                             alt={match.awayTeam.name}
                                             className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                                          />
                                       ) : (
                                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-700 rounded-xl flex items-center justify-center text-base sm:text-xl font-black">
                                             {match.awayTeam.name.substring(
                                                0,
                                                2
                                             )}
                                          </div>
                                       )}
                                    </div>
                                    <div className="text-xs sm:text-base font-bold text-white truncate">
                                       {match.awayTeam.name}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         )}

         {/* Live Matches Section */}
         {liveMatches.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
               <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                  <div className="relative bg-gradient-to-br from-red-900/50 via-orange-900/40 to-red-900/50 backdrop-blur-xl border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                     <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                           <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Zap className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                 <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                                    Live Matches
                                 </h2>
                                 <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                       <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500" />
                                    </span>
                                    <span className="text-xs font-black text-red-400 uppercase tracking-wide">
                                       {totalLiveMatches} LIVE
                                    </span>
                                 </div>
                              </div>
                              <p className="text-xs sm:text-sm text-red-300 font-medium mt-0.5">
                                 ⚡ Auto-updating every 45s
                              </p>
                           </div>
                        </div>
                        <Link
                           href="/live"
                           className="hidden sm:flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm transition-all"
                        >
                           View All Live <ChevronRight className="w-4 h-4" />
                        </Link>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {liveMatches.map((match, idx) => (
                     <Link key={match.id} href={`/match/${match.id}`}>
                        <div className="group relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-red-500/30 hover:border-red-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg">
                           <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg">
                                 <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                 </span>
                                 <span className="text-xs font-black text-white uppercase">
                                    LIVE
                                 </span>
                              </div>
                           </div>
                           <div className="space-y-3 sm:space-y-4">
                              {match.league && (
                                 <div className="flex items-center gap-2">
                                    {match.league.logo && (
                                       <img
                                          src={match.league.logo}
                                          alt={match.league.name}
                                          className="w-5 h-5 object-contain"
                                       />
                                    )}
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide truncate">
                                       {match.league.name}
                                    </span>
                                 </div>
                              )}
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
                                 <div className="text-right">
                                    <div className="flex justify-end mb-2">
                                       {match.homeTeam.logo ? (
                                          <img
                                             src={match.homeTeam.logo}
                                             alt={match.homeTeam.name}
                                             className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                                          />
                                       ) : (
                                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-700 rounded-xl flex items-center justify-center text-base sm:text-xl font-black">
                                             {match.homeTeam.name.substring(
                                                0,
                                                2
                                             )}
                                          </div>
                                       )}
                                    </div>
                                    <div className="text-xs sm:text-base font-bold text-white truncate">
                                       {match.homeTeam.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                       Home
                                    </div>
                                 </div>
                                 <div className="text-center min-w-[60px] sm:min-w-[90px]">
                                    <div className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                                       {match.score || '0-0'}
                                    </div>
                                 </div>
                                 <div className="text-left">
                                    <div className="flex justify-start mb-2">
                                       {match.awayTeam.logo ? (
                                          <img
                                             src={match.awayTeam.logo}
                                             alt={match.awayTeam.name}
                                             className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                                          />
                                       ) : (
                                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-700 rounded-xl flex items-center justify-center text-base sm:text-xl font-black">
                                             {match.awayTeam.name.substring(
                                                0,
                                                2
                                             )}
                                          </div>
                                       )}
                                    </div>
                                    <div className="text-xs sm:text-base font-bold text-white truncate">
                                       {match.awayTeam.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                       Away
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>

               <Link href="/live" className="sm:hidden block">
                  <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                     View All {totalLiveMatches} Live Matches{' '}
                     <ChevronRight className="w-5 h-5" />
                  </button>
               </Link>
            </div>
         )}

         {/* Featured Leagues */}
         <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                     <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                     <h2 className="text-lg sm:text-2xl font-bold">
                        Featured Leagues
                     </h2>
                     <p className="text-xs sm:text-sm text-slate-400">
                        Top competitions worldwide
                     </p>
                  </div>
               </div>
               <Link
                  href="/leagues"
                  className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium flex items-center gap-1"
               >
                  View All <ChevronRight className="w-4 h-4" />
               </Link>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
               {loading
                  ? Array.from({ length: 8 }).map((_, idx) => (
                       <div
                          key={idx}
                          className="bg-gradient-to-b from-slate-900/40 to-slate-900/80 border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                       >
                          <Skeleton className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl mx-auto mb-3" />
                          <Skeleton className="h-3 w-3/4 mx-auto mb-2 rounded-lg" />
                          <Skeleton className="h-2.5 w-1/2 mx-auto rounded-lg" />
                       </div>
                    ))
                  : featuredLeagues.map((league, idx) => (
                       <Link key={league.id} href={`/leagues/${league.id}`}>
                          <div className="group bg-gradient-to-b from-slate-900/40 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
                             <div className="relative mb-3 mx-auto w-14 h-14 sm:w-20 sm:h-20">
                                <div className="w-full h-full rounded-xl bg-slate-800/50 flex items-center justify-center p-2 sm:p-3 group-hover:scale-110 transition-transform">
                                   {league.logo ? (
                                      <img
                                         src={league.logo}
                                         alt={league.name}
                                         className="w-full h-full object-contain"
                                      />
                                   ) : (
                                      <span>{league?.name.charAt(0)}</span>
                                   )}
                                </div>
                             </div>
                             <div className="text-center space-y-1">
                                <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                                   {league.name}
                                </h3>
                                {league.country && (
                                   <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                                      <Globe className="w-3 h-3" />
                                      <span className="line-clamp-1">
                                         {league.country}
                                      </span>
                                   </div>
                                )}
                             </div>
                          </div>
                       </Link>
                    ))}
            </div>
         </div>

         {/* Upcoming Matches */}
         <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                     <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                     <h2 className="text-lg sm:text-2xl font-bold">
                        Upcoming Matches
                     </h2>
                     <p className="text-xs sm:text-sm text-slate-400">
                        Don't miss these games
                     </p>
                  </div>
               </div>
               <Link
                  href="/matches"
                  className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium flex items-center gap-1"
               >
                  View All <ChevronRight className="w-4 h-4" />
               </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
               {upcomingMatches.map((match) => (
                  <Link key={match.id} href={`/match/${match.id}`}>
                     <div className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                        <div className="flex items-center justify-center mb-3">
                           {getStatusBadge(match.status)}
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                           <div className="flex items-center gap-2 sm:gap-3">
                              {match.homeTeam.logo ? (
                                 <img
                                    src={match.homeTeam.logo}
                                    alt={match.homeTeam.name}
                                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                                 />
                              ) : (
                                 <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {match.homeTeam.name.substring(0, 2)}
                                 </div>
                              )}
                              <span className="font-semibold text-xs sm:text-sm truncate group-hover:text-blue-400 transition-colors">
                                 {match.homeTeam.name}
                              </span>
                           </div>
                           <div className="flex items-center gap-2 sm:gap-3">
                              {match.awayTeam.logo ? (
                                 <img
                                    src={match.awayTeam.logo}
                                    alt={match.awayTeam.name}
                                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0"
                                 />
                              ) : (
                                 <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {match.awayTeam.name.substring(0, 2)}
                                 </div>
                              )}
                              <span className="font-semibold text-xs sm:text-sm truncate group-hover:text-purple-400 transition-colors">
                                 {match.awayTeam.name}
                              </span>
                           </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                           <div className="flex items-center justify-between text-xs text-slate-400">
                              <div className="flex items-center gap-1">
                                 <Clock className="w-3 h-3" />
                                 {new Date(
                                    match.kickoffTime
                                 ).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                 })}
                              </div>
                              <div>
                                 {new Date(
                                    match.kickoffTime
                                 ).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                 })}
                              </div>
                           </div>
                           {match.league && (
                              <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                                 <Trophy className="w-3 h-3 flex-shrink-0" />
                                 <span className="truncate">
                                    {match.league.name}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>

         {/* CTA */}
         <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="relative bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
               <div className="max-w-2xl mx-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                     <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">
                     Ready for Premium Experience?
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base mb-6 sm:mb-8">
                     Unlock exclusive features, HD streaming, and advanced
                     analytics with our premium plans.
                  </p>
                  <Link href="/pricing">
                     <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
                        View Pricing Plans
                     </button>
                  </Link>
               </div>
            </div>
         </div>

         <style jsx>{`
            @keyframes fadeInUp {
               from {
                  opacity: 0;
                  transform: translateY(20px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            @keyframes shimmer {
               100% {
                  transform: translateX(100%);
               }
            }
         `}</style>
      </div>
   );
}
