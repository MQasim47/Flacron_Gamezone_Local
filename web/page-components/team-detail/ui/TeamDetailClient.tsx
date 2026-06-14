'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/shared/api/base';
import {
   Trophy,
   Clock,
   Shield,
   ArrowLeft,
   Activity,
   TrendingDown,
   Target,
   Flame,
   AlertCircle,
   MapPin,
   Calendar,
   ChevronRight,
   TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface League {
   id: string;
   name: string;
   country: string | null;
   logo: string | null;
}

interface TeamData {
   name: string;
   logo: string | null;
   apiTeamId: number | null;
}

interface Venue {
   id: string;
   name: string;
   city: string | null;
}

interface Match {
   id: string;
   homeTeam: TeamData;
   awayTeam: TeamData;
   kickoffTime: string;
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
   venue: Venue | null;
   league: League;
}

interface TeamDetailsResponse {
   id: string;
   name: string;
   logo: string | null;
   apiTeamId: number | null;
   leagueId: string | null;
   createdAt: string;
   league: League | null;
   homeMatches: Match[];
   awayMatches: Match[];
}

interface Props {
   initialTeam: TeamDetailsResponse | null;
   teamId: string;
}

export function TeamDetailClient({ initialTeam, teamId }: Props) {
   const [team, setTeam] = useState<TeamDetailsResponse | null>(initialTeam);
   const [isLoading, setIsLoading] = useState(!initialTeam);
   const [error, setError] = useState<string | null>(null);
   const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

   // Sync state when the parent provides new server data
   useEffect(() => {
      if (initialTeam) {
         setTeam(initialTeam);
         setIsLoading(false);
         setError(null);
      }
   }, [initialTeam]);

   async function loadTeam() {
      setIsLoading(true);
      setError(null);
      try {
         const data = await apiGet<TeamDetailsResponse>(`/api/teams/${teamId}`);
         setTeam(data);
      } catch (err) {
         console.error('Error loading team:', err);
         setError(err instanceof Error ? err.message : 'Failed to load team');
      } finally {
         setIsLoading(false);
      }
   }

   useEffect(() => {
      if (!initialTeam) {
         loadTeam();
      }
   }, [teamId]);
   if (isLoading && !team) {
      return (
         <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-cyan-500/20 rounded-2xl">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.1),transparent)]"></div>
               <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-cyan-500/30">
                     <Shield className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-slate-300 font-bold text-xl">
                     ⚡ Loading team data...
                  </p>
               </div>
            </div>
         </div>
      );
   }

   if (error || !team) {
      return (
         <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-slate-900/90 to-red-900/30 border-2 border-red-500/30 rounded-2xl">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.1),transparent)]"></div>
               <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-500/30">
                     <AlertCircle className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-red-400 font-bold text-xl mb-4">
                     ⚠️ {error || 'Team not found'}
                  </p>
                  <Link
                     href="/teams"
                     className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                     <ArrowLeft className="w-5 h-5" />
                     Back to Teams
                  </Link>
               </div>
            </div>
         </div>
      );
   }

   // Statistics
   const allMatches = [
      ...(team.homeMatches || []),
      ...(team.awayMatches || []),
   ];
   const hasMatches = allMatches.length > 0;

   const upcomingMatches = allMatches
      .filter((m) => m.status === 'UPCOMING' || m.status === 'LIVE')
      .sort(
         (a, b) =>
            new Date(a.kickoffTime).getTime() -
            new Date(b.kickoffTime).getTime()
      );

   const pastMatches = allMatches
      .filter((m) => m.status === 'FINISHED')
      .sort(
         (a, b) =>
            new Date(b.kickoffTime).getTime() -
            new Date(a.kickoffTime).getTime()
      );

   const wins = pastMatches.filter((m) => {
      if (!m.score) return false;
      const [home, away] = m.score.split('-').map(Number);
      return (
         (m.homeTeam.name === team.name && home > away) ||
         (m.awayTeam.name === team.name && away > home)
      );
   }).length;

   const draws = pastMatches.filter((m) => {
      if (!m.score) return false;
      const [home, away] = m.score.split('-').map(Number);
      return home === away;
   }).length;

   const scoredMatches = pastMatches.filter((m) => m.score != null).length;
   const losses = scoredMatches - wins - draws;
   const winRate =
      scoredMatches > 0 ? Math.round((wins / scoredMatches) * 100) : 0;

   const lastFiveResults = pastMatches
      .slice(0, 5)
      .map((m) => {
         if (!m.score) return null;
         const [home, away] = m.score.split('-').map(Number);
         if (home === away) return 'D' as const;
         return (m.homeTeam.name === team.name && home > away) ||
            (m.awayTeam.name === team.name && away > home)
            ? ('W' as const)
            : ('L' as const);
      })
      .filter((r): r is 'W' | 'D' | 'L' => r !== null)
      .reverse();

   const getResultBadge = (result: 'W' | 'D' | 'L') => {
      switch (result) {
         case 'W':
            return (
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg border-2 border-green-500/50">
                  <span className="text-xs font-black text-white">W</span>
               </div>
            );
         case 'D':
            return (
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center shadow-lg border-2 border-yellow-500/50">
                  <span className="text-xs font-black text-white">D</span>
               </div>
            );
         case 'L':
            return (
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg border-2 border-red-500/50">
                  <span className="text-xs font-black text-white">L</span>
               </div>
            );
      }
   };

   const getMatchResult = (match: Match): 'W' | 'D' | 'L' | null => {
      if (!match.score || match.status !== 'FINISHED') return null;
      const [home, away] = match.score.split('-').map(Number);
      const isHome = match.homeTeam.name === team.name;
      const teamScore = isHome ? home : away;
      const opponentScore = isHome ? away : home;
      if (teamScore > opponentScore) return 'W';
      if (teamScore < opponentScore) return 'L';
      return 'D';
   };

   return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
         {/* Back Button */}
         <Link
            href="/teams"
            className="group inline-flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 px-4 py-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30"
         >
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/70 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300 shadow-lg">
               <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide">
               Back to Teams
            </span>
         </Link>
         {/* Team Hero Section */}
         <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20">
            <div className="absolute inset-0 opacity-10">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]"></div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(6,182,212,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15),transparent_50%)]"></div>

            <div className="relative z-10 p-6 md:p-10">
               <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Team Logo */}
                  <div className="relative group">
                     <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                     <div className="relative">
                        {team.logo ? (
                           <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-900/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-500/50 shadow-2xl flex items-center justify-center">
                              <img
                                 src={team.logo}
                                 alt={team.name}
                                 className="w-full h-full object-contain"
                              />
                           </div>
                        ) : (
                           <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-cyan-500/50 shadow-2xl">
                              <Shield className="w-20 h-20 text-cyan-400" />
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 text-center md:text-left">
                     <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
                        {team.name}
                     </h1>
                     {team.league && (
                        <div className="inline-flex items-center gap-3 bg-slate-900/70 backdrop-blur-sm rounded-xl px-5 py-3 border border-cyan-500/30 mb-4">
                           {team.league.logo && (
                              <img
                                 src={team.league.logo}
                                 alt={team.league.name}
                                 className="w-6 h-6 object-contain"
                              />
                           )}
                           <div>
                              <div className="text-sm font-black text-white">
                                 {team.league.name}
                              </div>
                              {team.league.country && (
                                 <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {team.league.country}
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {lastFiveResults.length > 0 && (
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                           <span className="text-sm text-slate-400 font-bold uppercase tracking-wide">
                              Recent Form:
                           </span>
                           <div className="flex gap-2">
                              {lastFiveResults.map((result, i) => (
                                 <div key={i}>{getResultBadge(result)}</div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"></div>
         </div>
         {/* No Matches Notice */}
         {!hasMatches && (
            <div className="relative overflow-hidden bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-2 border-yellow-500/30 rounded-2xl p-6 backdrop-blur-sm">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.1),transparent)]"></div>
               <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center flex-shrink-0">
                     <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                     <h3 className="text-lg font-black text-yellow-200 mb-2 uppercase tracking-wide">
                        No Match Data Available
                     </h3>
                     <p className="text-sm text-slate-400 leading-relaxed">
                        This team doesn't have any matches recorded yet.
                        Statistics and match history will appear here once
                        matches are added.
                     </p>
                  </div>
               </div>
            </div>
         )}
         {/* Stats Cards */}
         <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
               icon={Trophy}
               value={wins}
               label="Wins"
               gradient="from-green-600 to-emerald-600"
            />
            <StatCard
               icon={Activity}
               value={draws}
               label="Draws"
               gradient="from-yellow-600 to-orange-600"
            />
            <StatCard
               icon={TrendingDown}
               value={losses}
               label="Losses"
               gradient="from-red-600 to-rose-600"
            />
            <StatCard
               icon={Target}
               value={`${winRate}%`}
               label="Win Rate"
               gradient="from-blue-600 to-cyan-600"
            />
            <StatCard
               icon={Flame}
               value={scoredMatches}
               label="Played"
               gradient="from-purple-600 to-pink-600"
            />
         </div>
         {/* Tabs */}
         <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700/50 rounded-xl sm:rounded-2xl p-1.5 sm:p-2">
            <div className="flex gap-1 sm:gap-2">
               <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 ${
                     activeTab === 'upcoming'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
               >
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                     Upcoming ({upcomingMatches.length})
                  </span>
               </button>
               <button
                  onClick={() => setActiveTab('past')}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 ${
                     activeTab === 'past'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
               >
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Past ({pastMatches.length})</span>
               </button>
            </div>
         </div>
         {/* Upcoming Matches */}
         {activeTab === 'upcoming' && (
            <div className="space-y-4">
               {upcomingMatches.length === 0 ? (
                  <EmptyState
                     icon={<Clock className="w-12 h-12 text-slate-600" />}
                     title="No Upcoming Matches"
                     description="There are no scheduled matches for this team yet."
                  />
               ) : (
                  upcomingMatches.map((match) => (
                     <MatchCard
                        key={match.id}
                        match={match}
                        currentTeam={team.name}
                     />
                  ))
               )}
            </div>
         )}
         {/* Past Matches */}
         {activeTab === 'past' && (
            <div className="space-y-4">
               {pastMatches.length === 0 ? (
                  <EmptyState
                     icon={<TrendingUp className="w-12 h-12 text-slate-600" />}
                     title="No Past Matches"
                     description="This team hasn't played any matches yet."
                  />
               ) : (
                  pastMatches.map((match) => (
                     <MatchCard
                        key={match.id}
                        match={match}
                        currentTeam={team.name}
                        result={getMatchResult(match)}
                     />
                  ))
               )}
            </div>
         )}
      </div>
   );
}

// ─── Sub-components ───────────────────────────────────────────────

function StatCard({
   icon: Icon,
   value,
   label,
   gradient,
}: {
   icon: any;
   value: number | string;
   label: string;
   gradient: string;
}) {
   return (
      <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl p-6 shadow-xl group hover:border-cyan-500/30 transition-all duration-300">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <div className="relative">
            <div
               className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
               <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-sm text-slate-400 font-semibold uppercase tracking-wide">
               {label}
            </div>
         </div>
      </div>
   );
}

function MatchCard({
   match,
   currentTeam,
   result,
}: {
   match: Match;
   currentTeam: string;
   result?: 'W' | 'D' | 'L' | null;
}) {
   const isHome = match.homeTeam.name === currentTeam;
   const isLive = match.status === 'LIVE';
   const isFinished = match.status === 'FINISHED';

   const getBorderColor = () => {
      if (!result) return 'border-cyan-500/30';
      switch (result) {
         case 'W':
            return 'border-green-500/50';
         case 'D':
            return 'border-yellow-500/50';
         case 'L':
            return 'border-red-500/50';
      }
   };

   const getResultBadge = () => {
      if (!result) return null;
      switch (result) {
         case 'W':
            return (
               <div className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-black text-green-400 uppercase">
                     Win
                  </span>
               </div>
            );
         case 'D':
            return (
               <div className="px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-black text-yellow-400 uppercase">
                     Draw
                  </span>
               </div>
            );
         case 'L':
            return (
               <div className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-black text-red-400 uppercase">
                     Loss
                  </span>
               </div>
            );
      }
   };

   return (
      <Link
         href={`/match/${match.id}`}
         className={`group relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 ${getBorderColor()} rounded-2xl p-6 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] block`}
      >
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(6,182,212,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

         <div className="relative">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  {match.league?.logo && (
                     <img
                        src={match.league.logo}
                        alt={match.league.name}
                        className="w-5 h-5 object-contain"
                     />
                  )}
                  <span className="text-sm font-bold text-slate-400">
                     {match.league?.name || 'Unknown League'}
                  </span>
               </div>

               {isLive ? (
                  <div className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                     </span>
                     <span className="text-xs font-black text-red-400 uppercase">
                        Live
                     </span>
                  </div>
               ) : isFinished && result ? (
                  getResultBadge()
               ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-blue-400" />
                     <span className="text-xs font-black text-blue-400 uppercase">
                        Upcoming
                     </span>
                  </div>
               )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
               {/* Home Team */}
               <div
                  className={`flex items-center gap-3 ${isHome ? '' : 'opacity-60'}`}
               >
                  {match.homeTeam.logo ? (
                     <img
                        src={match.homeTeam.logo}
                        alt={match.homeTeam.name}
                        className="w-12 h-12 object-contain"
                     />
                  ) : (
                     <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-slate-600" />
                     </div>
                  )}
                  <div className="flex-1 min-w-0">
                     <div className="font-bold text-white truncate">
                        {match.homeTeam.name}
                     </div>
                     {isHome && (
                        <div className="text-xs text-cyan-400 font-semibold">
                           You
                        </div>
                     )}
                  </div>
               </div>

               {/* Score or Time */}
               <div className="text-center min-w-[80px]">
                  {isFinished && match.score ? (
                     <div className="text-2xl font-black text-white">
                        {match.score}
                     </div>
                  ) : isLive && match.score ? (
                     <div className="text-2xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                        {match.score}
                     </div>
                  ) : (
                     <div className="text-sm text-slate-400 font-semibold">
                        {new Date(match.kickoffTime).toLocaleString('en-US', {
                           month: 'short',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit',
                        })}
                     </div>
                  )}
               </div>

               {/* Away Team */}
               <div
                  className={`flex items-center gap-3 flex-row-reverse ${!isHome ? '' : 'opacity-60'}`}
               >
                  {match.awayTeam.logo ? (
                     <img
                        src={match.awayTeam.logo}
                        alt={match.awayTeam.name}
                        className="w-12 h-12 object-contain"
                     />
                  ) : (
                     <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-slate-600" />
                     </div>
                  )}
                  <div className="flex-1 min-w-0 text-right">
                     <div className="font-bold text-white truncate">
                        {match.awayTeam.name}
                     </div>
                     {!isHome && (
                        <div className="text-xs text-cyan-400 font-semibold">
                           You
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {match.venue && (
               <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400 font-semibold">
                     {match.venue.name}
                     {match.venue.city ? `, ${match.venue.city}` : ''}
                  </span>
               </div>
            )}
         </div>

         <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <ChevronRight className="w-6 h-6 text-cyan-400" />
         </div>
         <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      </Link>
   );
}

function EmptyState({
   icon,
   title,
   description,
}: {
   icon: React.ReactNode;
   title: string;
   description: string;
}) {
   return (
      <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl p-12 text-center">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(100,116,139,0.1),transparent)]"></div>
         <div className="relative">
            <div className="w-24 h-24 bg-slate-800/70 rounded-2xl flex items-center justify-center mx-auto mb-6">
               {icon}
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">
               {title}
            </h3>
            <p className="text-sm text-slate-400 font-semibold max-w-md mx-auto">
               {description}
            </p>
         </div>
      </div>
   );
}
