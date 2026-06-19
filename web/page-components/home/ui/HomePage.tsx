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
   Star,
   Filter,
   Heart,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

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

// ── Major league priority list ─────────────────────────────────────────────
const MAJOR_LEAGUE_NAMES = [
   'premier league',
   'la liga',
   'serie a',
   'bundesliga',
   'ligue 1',
   'uefa champions league',
   'champions league',
   'uefa europa league',
   'europa league',
   'mls',
   'liga mx',
   'saudi pro league',
   'brasileirao',
   'brasileirão',
   'copa libertadores',
   'caf champions league',
   'eredivisie',
   'primeira liga',
   'super lig',
   'scottish premiership',
];

// League categories for the organized section
const LEAGUE_CATEGORIES = [
   {
      id: 'europe_top',
      label: 'Top European',
      icon: '🏆',
      color: 'from-blue-600 to-indigo-600',
      border: 'border-blue-500/30',
      keywords: [
         'premier league',
         'la liga',
         'serie a',
         'bundesliga',
         'ligue 1',
         'eredivisie',
         'primeira liga',
         'scottish',
      ],
   },
   {
      id: 'europe_cups',
      label: 'European Cups',
      icon: '⭐',
      color: 'from-yellow-600 to-amber-600',
      border: 'border-yellow-500/30',
      keywords: [
         'champions league',
         'europa league',
         'conference league',
         'uefa',
      ],
   },
   {
      id: 'americas',
      label: 'Americas',
      icon: '🌎',
      color: 'from-green-600 to-emerald-600',
      border: 'border-green-500/30',
      keywords: [
         'mls',
         'liga mx',
         'brasileirao',
         'brasileirão',
         'copa libertadores',
         'argentina',
         'colombia',
         'chile',
      ],
   },
   {
      id: 'middle_east',
      label: 'Asia & Middle East',
      icon: '🌏',
      color: 'from-orange-600 to-red-600',
      border: 'border-orange-500/30',
      keywords: [
         'saudi',
         'j1 league',
         'k league',
         'chinese',
         'a-league',
         'uae',
         'qatar',
      ],
   },
   {
      id: 'africa',
      label: 'Africa',
      icon: '🌍',
      color: 'from-purple-600 to-pink-600',
      border: 'border-purple-500/30',
      keywords: [
         'caf',
         'egypt',
         'south africa',
         'nigeria',
         'moroccan',
         'african',
      ],
   },
];

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

function isMajorLeague(name: string): boolean {
   const lower = name.toLowerCase();
   return MAJOR_LEAGUE_NAMES.some((m) => lower.includes(m));
}

function getLeagueCategory(name: string, country: string | null): string {
   const lower = (name + ' ' + (country ?? '')).toLowerCase();
   for (const cat of LEAGUE_CATEGORIES) {
      if (cat.keywords.some((k) => lower.includes(k))) return cat.id;
   }
   return 'other';
}

function sortLeaguesByPriority(leagues: League[]): League[] {
   return [...leagues].sort((a, b) => {
      const aIsMajor = isMajorLeague(a.name);
      const bIsMajor = isMajorLeague(b.name);
      if (aIsMajor && !bIsMajor) return -1;
      if (!aIsMajor && bIsMajor) return 1;
      // Within majors, sort by priority index
      if (aIsMajor && bIsMajor) {
         const aIdx = MAJOR_LEAGUE_NAMES.findIndex((m) =>
            a.name.toLowerCase().includes(m)
         );
         const bIdx = MAJOR_LEAGUE_NAMES.findIndex((m) =>
            b.name.toLowerCase().includes(m)
         );
         return aIdx - bIdx;
      }
      return a.name.localeCompare(b.name);
   });
}

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

const isWorldCupMatch = (m: Match) =>
   !!m.league?.name && /world cup/i.test(m.league.name);

export default function HomePage({
   initialFeaturedLeagues,
   initialLiveMatches,
   initialUpcomingMatches,
}: HomePageProps) {
   const [allLeagues, setAllLeagues] = useState<League[]>(
      sortLeaguesByPriority(initialFeaturedLeagues)
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
   const majorLeagues = allLeagues.filter((l) => isMajorLeague(l.name));
   const otherLeagues = allLeagues.filter((l) => !isMajorLeague(l.name));
   const favoriteLeagues = allLeagues.filter((l) => favorites.includes(l.id));

   // Filter leagues based on active filter
   const getFilteredLeagues = () => {
      if (activeFilter === 'all') return allLeagues;
      if (activeFilter === 'top') return majorLeagues;
      if (activeFilter === 'europe') {
         return allLeagues.filter((l) => {
            const cat = getLeagueCategory(l.name, l.country);
            return cat === 'europe_top' || cat === 'europe_cups';
         });
      }
      if (activeFilter === 'americas') {
         return allLeagues.filter(
            (l) => getLeagueCategory(l.name, l.country) === 'americas'
         );
      }
      if (activeFilter === 'africa') {
         return allLeagues.filter(
            (l) => getLeagueCategory(l.name, l.country) === 'africa'
         );
      }
      if (activeFilter === 'asia') {
         return allLeagues.filter(
            (l) => getLeagueCategory(l.name, l.country) === 'middle_east'
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

   const worldCupLive = allLiveMatches.filter(isWorldCupMatch);
   const worldCupUpcoming = allUpcomingMatches.filter(isWorldCupMatch);
   const worldCupMatches = [...worldCupLive, ...worldCupUpcoming].slice(0, 4);

   const handleFavorite = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFavorites(toggleFavorite(id));
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
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
                        Live scores, streams and AI analysis for Premier League,
                        La Liga, Champions League, MLS and every major
                        competition.
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
                              {allLeagues.length}+
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

         {/* ── Quick Nav Cards ───────────────────────────────────────────── */}
         <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
               {
                  href: '/live',
                  icon: '🔴',
                  label: 'Live',
                  sub: `${totalLiveMatches} now`,
               },
               {
                  href: '/leagues',
                  icon: '🏆',
                  label: 'Top Leagues',
                  sub: 'Major comps',
               },
               {
                  href: '/leagues',
                  icon: '🌍',
                  label: 'All Leagues',
                  sub: `${allLeagues.length} total`,
               },
               {
                  href: '/teams',
                  icon: '👥',
                  label: 'Teams',
                  sub: 'Browse clubs',
               },
               {
                  href: '/matches',
                  icon: '📅',
                  label: 'Fixtures',
                  sub: 'Upcoming',
               },
               {
                  href: '/matches?status=FINISHED',
                  icon: '📊',
                  label: 'Results',
                  sub: 'Recent',
               },
            ].map((item) => (
               <Link key={item.href + item.label} href={item.href}>
                  <div className="group bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-blue-500/40 rounded-xl p-3 text-center transition-all hover:scale-[1.03] cursor-pointer h-full flex flex-col items-center justify-center gap-1">
                     <span className="text-2xl">{item.icon}</span>
                     <p className="text-white font-bold text-xs leading-tight">
                        {item.label}
                     </p>
                     <p className="text-slate-500 text-[10px]">{item.sub}</p>
                  </div>
               </Link>
            ))}
         </div>

         {/* ── Search with filters ───────────────────────────────────────── */}
         <div className="space-y-3">
            <div className="relative max-w-3xl mx-auto">
               <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
               <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search teams, leagues, countries or matches…"
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl pl-11 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
               />
               {isSearching && (
                  <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2">
                     <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
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
                           ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                           : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50 hover:border-blue-500/30'
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
                              {isMajorLeague(league.name) && (
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
            <div className="space-y-4">
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

         {/* ── World Cup Spotlight ───────────────────────────────────────── */}
         {worldCupMatches.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
               <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                  <div className="relative bg-gradient-to-br from-yellow-900/50 via-amber-900/40 to-yellow-900/50 backdrop-blur-xl border border-yellow-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                     <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                           <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                           </div>
                           <div>
                              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                                 World Cup Spotlight
                              </h2>
                              <p className="text-xs sm:text-sm text-yellow-300 font-medium mt-0.5">
                                 🏆 Follow the World Cup action live
                              </p>
                           </div>
                        </div>
                        <Link
                           href="/matches"
                           className="hidden sm:flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 font-bold px-4 py-2 rounded-xl text-sm transition-all"
                        >
                           View All <ChevronRight className="w-4 h-4" />
                        </Link>
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {worldCupMatches.map((match) => (
                     <Link key={match.id} href={`/match/${match.id}`}>
                        <div className="group relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-yellow-500/30 hover:border-yellow-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg">
                           <div className="absolute top-3 right-3 z-10">
                              {getStatusBadge(match.status)}
                           </div>
                           <div className="space-y-3">
                              {match.league && (
                                 <div className="flex items-center gap-2">
                                    {match.league.logo && (
                                       <img
                                          src={match.league.logo}
                                          alt={match.league.name}
                                          className="w-5 h-5 object-contain"
                                       />
                                    )}
                                    <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide truncate">
                                       {match.league.name}
                                    </span>
                                 </div>
                              )}
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 mt-4">
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
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                                       Live Matches
                                    </h2>
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                                       <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
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
                           <div className="group relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-red-500/30 hover:border-red-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg">
                              <div className="absolute top-3 right-3 z-10">
                                 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg">
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
                                       {isMajorLeague(match.league.name) && (
                                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                       )}
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

         {/* ── Major Leagues (always shown first) ───────────────────────── */}
         {(activeFilter === 'all' || activeFilter === 'top') &&
            majorLeagues.length > 0 && (
               <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                           <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                        </div>
                        <div>
                           <h2 className="text-lg sm:text-2xl font-bold">
                              Major Leagues
                           </h2>
                           <p className="text-xs sm:text-sm text-slate-400">
                              Premier League · La Liga · UCL & more
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                     {majorLeagues.slice(0, 12).map((league, idx) => (
                        <Link key={league.id} href={`/leagues/${league.id}`}>
                           <div className="group relative bg-gradient-to-b from-yellow-900/20 to-slate-900/80 border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                              <button
                                 onClick={(e) => handleFavorite(league.id, e)}
                                 className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <Heart
                                    className={`w-3.5 h-3.5 transition-colors ${favorites.includes(league.id) ? 'text-pink-400 fill-pink-400' : 'text-slate-500 hover:text-pink-400'}`}
                                 />
                              </button>
                              <div className="relative mb-3 mx-auto w-14 h-14 sm:w-16 sm:h-16">
                                 <div className="w-full h-full rounded-xl bg-slate-800/50 flex items-center justify-center p-2 sm:p-3 group-hover:scale-110 transition-transform">
                                    {league.logo ? (
                                       <img
                                          src={league.logo}
                                          alt={league.name}
                                          className="w-full h-full object-contain"
                                       />
                                    ) : (
                                       <span className="text-lg font-black text-yellow-400">
                                          {league.name.charAt(0)}
                                       </span>
                                    )}
                                 </div>
                                 <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                                    <Star className="w-3 h-3 text-white fill-white" />
                                 </div>
                              </div>
                              <div className="text-center space-y-1">
                                 <h3 className="font-bold text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-yellow-400 transition-colors">
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
            )}

         {/* ── Leagues by category (when filter is not "top") ───────────── */}
         {activeFilter === 'all' && (
            <div className="space-y-8">
               {LEAGUE_CATEGORIES.map((cat) => {
                  const catLeagues = allLeagues.filter(
                     (l) =>
                        getLeagueCategory(l.name, l.country) === cat.id &&
                        !isMajorLeague(l.name)
                  );
                  if (catLeagues.length === 0) return null;
                  return (
                     <div key={cat.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                           <div
                              className={`w-8 h-8 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-base`}
                           >
                              {cat.icon}
                           </div>
                           <h3 className="text-lg font-bold">{cat.label}</h3>
                           <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                              {catLeagues.length}
                           </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                           {catLeagues.slice(0, 6).map((league) => (
                              <Link
                                 key={league.id}
                                 href={`/leagues/${league.id}`}
                              >
                                 <div
                                    className={`group relative bg-slate-900/40 border ${cat.border} rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer text-center`}
                                 >
                                    <button
                                       onClick={(e) =>
                                          handleFavorite(league.id, e)
                                       }
                                       className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                       <Heart
                                          className={`w-3 h-3 ${favorites.includes(league.id) ? 'text-pink-400 fill-pink-400' : 'text-slate-600 hover:text-pink-400'}`}
                                       />
                                    </button>
                                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center p-2 mx-auto mb-2 group-hover:scale-110 transition-transform">
                                       {league.logo ? (
                                          <img
                                             src={league.logo}
                                             alt={league.name}
                                             className="w-full h-full object-contain"
                                          />
                                       ) : (
                                          <span className="text-sm font-black text-slate-400">
                                             {league.name.slice(0, 2)}
                                          </span>
                                       )}
                                    </div>
                                    <h3 className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-white transition-colors">
                                       {league.name}
                                    </h3>
                                    {league.country && (
                                       <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                                          {league.country}
                                       </div>
                                    )}
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  );
               })}

               {/* Other leagues */}
               {otherLeagues.filter(
                  (l) => getLeagueCategory(l.name, l.country) === 'other'
               ).length > 0 && (
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-500 rounded-xl flex items-center justify-center text-base">
                           ⚽
                        </div>
                        <h3 className="text-lg font-bold">Other Leagues</h3>
                        <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                           {
                              otherLeagues.filter(
                                 (l) =>
                                    getLeagueCategory(l.name, l.country) ===
                                    'other'
                              ).length
                           }
                        </span>
                     </div>
                     <div
                        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 ${!showAllLeagues ? 'max-h-48 overflow-hidden' : ''}`}
                     >
                        {otherLeagues
                           .filter(
                              (l) =>
                                 getLeagueCategory(l.name, l.country) ===
                                 'other'
                           )
                           .map((league) => (
                              <Link
                                 key={league.id}
                                 href={`/leagues/${league.id}`}
                              >
                                 <div className="group bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/60 hover:scale-[1.02] transition-all cursor-pointer text-center">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center p-2 mx-auto mb-2">
                                       {league.logo ? (
                                          <img
                                             src={league.logo}
                                             alt={league.name}
                                             className="w-full h-full object-contain"
                                          />
                                       ) : (
                                          <span className="text-sm font-black text-slate-400">
                                             {league.name.slice(0, 2)}
                                          </span>
                                       )}
                                    </div>
                                    <h3 className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                                       {league.name}
                                    </h3>
                                 </div>
                              </Link>
                           ))}
                     </div>
                  </div>
               )}
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
                           <div className="group relative bg-gradient-to-b from-slate-900/40 to-slate-900/80 border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
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
                              <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-blue-400 text-center transition-colors">
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
                           <div className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 hover:border-blue-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
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
                                       {isMajorLeague(match.league.name) && (
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
            @keyframes shimmer {
               100% {
                  transform: translateX(100%);
               }
            }
         `}</style>
      </div>
   );
}
