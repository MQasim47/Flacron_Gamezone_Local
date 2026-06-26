'use client';

import { apiGet } from '@/shared/api/base';
import { ScrollToTop } from '@/shared/ui/ScrollToTop';
import Image from 'next/image';
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
   Star,
   Filter,
   Heart,
   Crown,
   Globe2,
   Compass,
   Landmark,
   Flag,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
   getCategorizedLeagues,
   categorizeLeague,
   isMajorLeague,
} from '@/shared/lib/leagueCategories';
import { isSpotlightTournament } from '@/shared/lib/tournamentSpotlight';
import { MajorLeaguesRail } from '@/widgets/major-leagues/ui/MajorLeaguesRail';
import { LeagueCategorySection } from '@/widgets/major-leagues/ui/LeagueCategorySection';
import { TournamentSpotlight } from '@/features/tournament-spotlight/ui/TournamentSpotlight';
import { QuickNavCards } from '@/widgets/quick-nav/ui/QuickNavCards';

const CATEGORY_ICONS = {
   top_european: Crown,
   international_club: Trophy,
   americas: Globe2,
   africa: Compass,
   asia_middle_east: Landmark,
   other: Flag,
} as const;

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
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
   venue?: Venue | null;
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

type FilterType =
   | 'all'
   | 'live'
   | 'upcoming'
   | 'top'
   | 'europe'
   | 'americas'
   | 'africa'
   | 'asia';

const QUICK_FILTERS: { id: FilterType; label: string; icon: string }[] = [
   { id: 'all', label: 'All', icon: '⚽' },
   { id: 'live', label: 'Live Now', icon: '🔴' },
   { id: 'upcoming', label: 'Upcoming', icon: '⏰' },
   { id: 'top', label: 'Top Leagues', icon: '🏆' },
   { id: 'europe', label: 'Europe', icon: '🇪🇺' },
   { id: 'americas', label: 'Americas', icon: '🌎' },
   { id: 'africa', label: 'Africa', icon: '🌍' },
   { id: 'asia', label: 'Asia', icon: '🌏' },
];

const Skeleton = ({ className = '' }: { className?: string }) => (
   <div
      className={`relative overflow-hidden bg-slate-800/60 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-slate-700/40 before:to-transparent ${className}`}
   />
);

// Local storage helpers for favorites
function getFavorites(): string[] {
   if (typeof window === 'undefined') return [];
   try {
      return JSON.parse(localStorage.getItem('fgz_fav_leagues') || '[]');
   } catch {
      return [];
   }
}
function toggleFavorite(id: string): string[] {
   const favs = getFavorites();
   const next = favs.includes(id)
      ? favs.filter((f) => f !== id)
      : [...favs, id];
   localStorage.setItem('fgz_fav_leagues', JSON.stringify(next));
   return next;
}

export default function HomePage({
   initialFeaturedLeagues,
   initialLiveMatches,
   initialUpcomingMatches,
}: HomePageProps) {
   const [allLeagues, setAllLeagues] = useState<League[]>(
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
   const [activeFilter, setActiveFilter] = useState<FilterType>('all');
   const [favorites, setFavorites] = useState<string[]>([]);
   const [showAllLeagues, setShowAllLeagues] = useState(false);
   const searchRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      setFavorites(getFavorites());
   }, []);

   // ── Live match refresh ────────────────────────────────────────────────
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

   const refreshUpcomingMatches = useCallback(async () => {
      try {
         const res = await apiGet<any>('/api/matches?status=UPCOMING');
         const all: Match[] = Array.isArray(res) ? res : (res.matches ?? []);
         setAllUpcomingMatches(all);
         setUpcomingMatches(all.slice(0, 6));
      } catch {}
   }, []);

   useEffect(() => {
      refreshLiveMatches();
      refreshUpcomingMatches();
      const li = setInterval(refreshLiveMatches, 45000);
      const ui = setInterval(refreshUpcomingMatches, 60000);
      return () => {
         clearInterval(li);
         clearInterval(ui);
      };
   }, [refreshLiveMatches, refreshUpcomingMatches]);

   // ── Search ────────────────────────────────────────────────────────────
   useEffect(() => {
      const timer = setTimeout(() => {
         if (searchQuery.trim() && searchQuery.trim().length >= 2)
            performSearch();
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

   // ── Derived data ──────────────────────────────────────────────────────
   const categorized = useMemo(
      () => getCategorizedLeagues(allLeagues),
      [allLeagues]
   );
   const favoriteLeagues = allLeagues.filter((l) => favorites.includes(l.id));

   // Filter leagues based on active filter
   const getFilteredLeagues = () => {
      if (activeFilter === 'all') return allLeagues;
      if (activeFilter === 'top') return categorized.majors;
      if (activeFilter === 'europe') {
         return allLeagues.filter(
            (l) => categorizeLeague(l) === 'top_european'
         );
      }
      if (activeFilter === 'americas') {
         return allLeagues.filter((l) => categorizeLeague(l) === 'americas');
      }
      if (activeFilter === 'africa') {
         return allLeagues.filter((l) => categorizeLeague(l) === 'africa');
      }
      if (activeFilter === 'asia') {
         return allLeagues.filter(
            (l) => categorizeLeague(l) === 'asia_middle_east'
         );
      }
      if (activeFilter === 'live') {
         // Show leagues that have live matches
         const liveLeagueNames = new Set(
            allLiveMatches.map((m) => m.league?.name).filter(Boolean)
         );
         return allLeagues.filter((l) => liveLeagueNames.has(l.name));
      }
      return allLeagues;
   };

   const filteredLeagues = getFilteredLeagues();
   const displayedLeagues = showAllLeagues
      ? filteredLeagues
      : filteredLeagues.slice(0, 12);

   const spotlightMatches = [
      ...allLiveMatches.filter((m) => isSpotlightTournament(m.league?.name)),
      ...allUpcomingMatches.filter((m) =>
         isSpotlightTournament(m.league?.name)
      ),
   ].slice(0, 4);

   const handleFavorite = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFavorites(toggleFavorite(id));
   };

   const scrollToFavorites = () => {
      document
         .getElementById('favorites-section')
         ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   };

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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-brand/20 text-brand border border-brand/30">
               <Clock className="w-3 h-3" />
               UPCOMING
            </span>
         );
      return null;
   };

   return (
      <div className="space-y-8 sm:space-y-12">
         <ScrollToTop />

         {/* ── Hero ─────────────────────────────────────────────────────── */}
         <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[480px] sm:min-h-[560px]">
            <Image
               src="/hero-stadium.jpg"
               alt="Football stadium at night"
               fill
               priority
               className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy/85 to-navy-dark/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent" />

            <div className="relative p-6 sm:p-8 md:p-16 h-full flex items-center">
               <div className="max-w-4xl">
                  <div className="inline-flex items-center gap-2 bg-brand/15 border border-brand/30 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6">
                     <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                     <span className="text-xs sm:text-sm font-semibold text-brand">
                        {totalLiveMatches} Live Matches Now
                     </span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-white">
                     Football Universe
                     <br />
                     <span className="text-slate-300 text-xl sm:text-3xl md:text-5xl">
                        Discover • Watch • Connect
                     </span>
                  </h1>
                  <p className="text-slate-200 text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl">
                     Live scores, streams and AI analysis for Premier League, La
                     Liga, Champions League, MLS and every major competition.
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                     <Link href="/live">
                        <button className="group bg-brand hover:bg-brand-hover text-white font-bold px-5 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base shadow-lg shadow-brand/30 transition-all duration-300 hover:scale-105 flex items-center gap-2 sm:gap-3">
                           <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                           Watch Live
                           <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                     </Link>
                     <Link href="/leagues">
                        <button className="group bg-white/5 hover:bg-white/15 backdrop-blur-sm border-2 border-white text-white font-bold px-5 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base transition-all duration-300 hover:scale-105 flex items-center gap-2 sm:gap-3">
                           <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                           Browse Leagues
                        </button>
                     </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12 max-w-xs sm:max-w-2xl">
                     <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                           {allLeagues.length}+
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-1">
                           Leagues
                        </div>
                     </div>
                     <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-brand bg-clip-text text-transparent">
                           {totalLiveMatches}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-1">
                           Live Now
                        </div>
                     </div>
                     <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                           {upcomingMatches.length}+
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-1">
                           Upcoming
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
         </div>

         {/* ── Quick Nav Cards ───────────────────────────────────────────── */}
         <QuickNavCards
            liveCount={totalLiveMatches}
            totalLeagues={allLeagues.length}
            hasFavorites={favoriteLeagues.length > 0}
            onFavoritesClick={scrollToFavorites}
         />

         {/* ── Search with filters ───────────────────────────────────────── */}
         <div className="relative space-y-3">
            <div className="relative max-w-3xl mx-auto">
               <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
               <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search teams, leagues, countries or matches…"
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl pl-11 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-5 text-sm focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-500"
               />
               {isSearching && (
                  <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2">
                     <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                  </div>
               )}
            </div>

            {/* Quick filter buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-3xl mx-auto scrollbar-none">
               <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
               {QUICK_FILTERS.map((f) => (
                  <button
                     key={f.id}
                     onClick={() => setActiveFilter(f.id)}
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                        activeFilter === f.id
                           ? 'bg-brand text-white shadow-lg shadow-brand/30'
                           : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50 hover:border-brand/30'
                     }`}
                  >
                     <span>{f.icon}</span>
                     {f.label}
                     {f.id === 'live' && totalLiveMatches > 0 && (
                        <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 ml-0.5">
                           {totalLiveMatches}
                        </span>
                     )}
                  </button>
               ))}
            </div>

            {/* Search results dropdown */}
            {searchResults && searchQuery && (
               <div className="absolute z-50 max-w-3xl w-full left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl shadow-2xl max-h-[500px] overflow-y-auto">
                  {searchResults.leagues.length > 0 && (
                     <div className="p-3 sm:p-4 border-b border-slate-700/50">
                        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                           <Trophy className="w-4 h-4" />
                           LEAGUES
                        </div>
                        {searchResults.leagues.map((league) => (
                           <Link
                              key={league.id}
                              href={`/leagues/${league.id}`}
                              className="flex items-center gap-3 p-2 sm:p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                              onClick={() => setSearchQuery('')}
                           >
                              {league.logo && (
                                 <img
                                    src={league.logo}
                                    alt={league.name}
                                    className="w-7 h-7 object-contain flex-shrink-0"
                                 />
                              )}
                              <div className="flex-1 min-w-0">
                                 <div className="font-medium text-sm truncate">
                                    {league.name}
                                 </div>
                                 <div className="text-xs text-slate-500">
                                    {league.country}
                                 </div>
                              </div>
                              {isMajorLeague(league) && (
                                 <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                              )}
                           </Link>
                        ))}
                     </div>
                  )}
                  {searchResults.teams.length > 0 && (
                     <div className="p-3 sm:p-4 border-b border-slate-700/50">
                        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                           <Users className="w-4 h-4" />
                           TEAMS
                        </div>
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
                                    className="w-7 h-7 object-contain flex-shrink-0"
                                 />
                              ) : (
                                 <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {team.name.substring(0, 2).toUpperCase()}
                                 </div>
                              )}
                              <div className="font-medium text-sm truncate">
                                 {team.name}
                              </div>
                           </Link>
                        ))}
                     </div>
                  )}
                  {searchResults.matches.length > 0 && (
                     <div className="p-3 sm:p-4">
                        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                           <Play className="w-4 h-4" />
                           MATCHES
                        </div>
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
                  )}
                  {searchResults.leagues.length === 0 &&
                     searchResults.teams.length === 0 &&
                     searchResults.matches.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">
                           No results for "{searchQuery}"
                        </div>
                     )}
               </div>
            )}
         </div>

         {/* ── Favorites ─────────────────────────────────────────────────── */}
         {favoriteLeagues.length > 0 && (
            <div id="favorites-section" className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                     <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold">
                     Your Favorites
                  </h2>
               </div>
               <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {favoriteLeagues.map((league) => (
                     <Link key={league.id} href={`/leagues/${league.id}`}>
                        <div className="group relative bg-gradient-to-b from-pink-900/20 to-slate-900/80 border border-pink-500/30 rounded-xl p-4 hover:border-pink-400/50 transition-all hover:scale-[1.02] text-center">
                           <button
                              onClick={(e) => handleFavorite(league.id, e)}
                              className="absolute top-2 right-2 z-10"
                           >
                              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                           </button>
                           <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center p-2 mx-auto mb-2">
                              {league.logo ? (
                                 <img
                                    src={league.logo}
                                    alt={league.name}
                                    className="w-full h-full object-contain"
                                 />
                              ) : (
                                 <span className="text-xs font-bold text-slate-400">
                                    {league.name.slice(0, 2)}
                                 </span>
                              )}
                           </div>
                           <h3 className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-pink-400 transition-colors">
                              {league.name}
                           </h3>
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         )}

         {/* ── Major Tournament Spotlight ────────────────────────────────── */}
         <TournamentSpotlight matches={spotlightMatches} />

         {/* ── Live Matches ──────────────────────────────────────────────── */}
         {(activeFilter === 'all' || activeFilter === 'live') &&
            liveMatches.length > 0 && (
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
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                                       Live Matches
                                    </h2>
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                                       <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                       </span>
                                       <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
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
                              className="hidden sm:flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 font-bold px-4 py-2 rounded-xl text-sm transition-all"
                           >
                              View All Live <ChevronRight className="w-4 h-4" />
                           </Link>
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                     {liveMatches.map((match) => (
                        <Link key={match.id} href={`/match/${match.id}`}>
                           <div className="group relative bg-gradient-to-br from-navy/90 to-navy-dark/95 border-2 border-red-500/30 hover:border-red-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg">
                              <div className="absolute top-3 right-3 z-10">
                                 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg">
                                    <span className="relative flex h-2 w-2">
                                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                       <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                    </span>
                                    <span className="text-xs font-bold text-white uppercase">
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
                                       {isMajorLeague(match.league) && (
                                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                       )}
                                    </div>
                                 )}
                                 <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
                                    <div className="text-right min-w-0">
                                       <div className="flex justify-end mb-2">
                                          {match.homeTeam.logo ? (
                                             <img
                                                src={match.homeTeam.logo}
                                                alt={match.homeTeam.name}
                                                className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                                             />
                                          ) : (
                                             <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-700 rounded-xl flex items-center justify-center text-base sm:text-xl font-bold">
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
                                       <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                                          {match.score || '0-0'}
                                       </div>
                                    </div>
                                    <div className="text-left min-w-0">
                                       <div className="flex justify-start mb-2">
                                          {match.awayTeam.logo ? (
                                             <img
                                                src={match.awayTeam.logo}
                                                alt={match.awayTeam.name}
                                                className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                                             />
                                          ) : (
                                             <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-700 rounded-xl flex items-center justify-center text-base sm:text-xl font-bold">
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

         {/* ── Top Leagues rail ──────────────────────────────────────────── */}
         {(activeFilter === 'all' || activeFilter === 'top') && (
            <MajorLeaguesRail
               leagues={categorized.majors}
               favorites={favorites}
               onToggleFavorite={handleFavorite}
            />
         )}

         {/* ── Leagues by category ───────────────────────────────────────── */}
         {activeFilter === 'all' && (
            <div className="space-y-8">
               {categorized.categories.map(({ meta, leagues }) => (
                  <LeagueCategorySection
                     key={meta.id}
                     meta={meta}
                     icon={CATEGORY_ICONS[meta.id]}
                     leagues={leagues}
                     favorites={favorites}
                     onToggleFavorite={handleFavorite}
                  />
               ))}
            </div>
         )}

         {/* Filtered leagues view */}
         {activeFilter !== 'all' &&
            activeFilter !== 'live' &&
            activeFilter !== 'top' && (
               <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                     {filteredLeagues.length} leagues found
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                     {displayedLeagues.map((league) => (
                        <Link key={league.id} href={`/leagues/${league.id}`}>
                           <div className="group relative bg-gradient-to-b from-slate-900/40 to-slate-900/80 border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-brand/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                              <button
                                 onClick={(e) => handleFavorite(league.id, e)}
                                 className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <Heart
                                    className={`w-3 h-3 ${favorites.includes(league.id) ? 'text-pink-400 fill-pink-400' : 'text-slate-600 hover:text-pink-400'}`}
                                 />
                              </button>
                              <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center p-2 mx-auto mb-2 group-hover:scale-110 transition-transform">
                                 {league.logo ? (
                                    <img
                                       src={league.logo}
                                       alt={league.name}
                                       className="w-full h-full object-contain"
                                    />
                                 ) : (
                                    <span>{league.name.charAt(0)}</span>
                                 )}
                              </div>
                              <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-brand text-center transition-colors">
                                 {league.name}
                              </h3>
                              {league.country && (
                                 <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mt-0.5">
                                    <Globe className="w-3 h-3" />
                                    <span className="line-clamp-1">
                                       {league.country}
                                    </span>
                                 </div>
                              )}
                           </div>
                        </Link>
                     ))}
                  </div>
                  {filteredLeagues.length > 12 && (
                     <button
                        onClick={() => setShowAllLeagues(!showAllLeagues)}
                        className="w-full py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
                     >
                        {showAllLeagues
                           ? 'Show Less'
                           : `Show All ${filteredLeagues.length} Leagues`}
                     </button>
                  )}
               </div>
            )}

         {/* ── Upcoming Matches ──────────────────────────────────────────── */}
         {(activeFilter === 'all' || activeFilter === 'upcoming') &&
            upcomingMatches.length > 0 && (
               <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand to-brand-hover rounded-xl flex items-center justify-center">
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
                        className="text-brand hover:text-brand-hover text-xs sm:text-sm font-medium flex items-center gap-1"
                     >
                        View All <ChevronRight className="w-4 h-4" />
                     </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                     {upcomingMatches.map((match) => (
                        <Link key={match.id} href={`/match/${match.id}`}>
                           <div className="group bg-gradient-to-br from-navy/85 to-navy-dark/90 border border-navy-light/40 hover:border-brand/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
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
                                    <span className="font-semibold text-xs sm:text-sm truncate group-hover:text-brand transition-colors">
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
                                    <span className="font-semibold text-xs sm:text-sm truncate group-hover:text-brand transition-colors">
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
                                       ).toLocaleDateString('en-US', {
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
                                       {isMajorLeague(match.league) && (
                                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                       )}
                                    </div>
                                 )}
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            )}

         {/* ── CTA ───────────────────────────────────────────────────────── */}
         <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="relative bg-gradient-to-br from-navy via-navy-light/40 to-navy backdrop-blur-xl border border-navy-light/30 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
               <div className="max-w-2xl mx-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
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
                     <button className="bg-brand hover:bg-brand-hover text-white font-bold px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base rounded-xl shadow-lg shadow-brand/30 transition-all duration-300 hover:scale-105">
                        View Pricing Plans
                     </button>
                  </Link>
               </div>
            </div>
         </div>

         <style jsx>{`
            @keyframes shimmer {
               100% {
                  transform: translateX(100%);
               }
            }
         `}</style>
      </div>
   );
}
