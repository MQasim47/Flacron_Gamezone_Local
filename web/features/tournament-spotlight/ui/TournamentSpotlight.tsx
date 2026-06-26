'use client';

import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';

interface TeamData {
   name: string;
   logo: string | null;
}
interface League {
   name: string;
   logo?: string | null;
}
interface Match {
   id: string;
   homeTeam: TeamData;
   awayTeam: TeamData;
   league: League | null;
   kickoffTime: string;
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
}

interface Props {
   matches: Match[];
}

export function TournamentSpotlight({ matches }: Props) {
   if (matches.length === 0) return null;
   const tournamentName = matches[0]?.league?.name ?? 'Major Tournament';

   return (
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
                           {tournamentName} Spotlight
                        </h2>
                        <p className="text-xs sm:text-sm text-yellow-300 font-medium mt-0.5">
                           Live tournament coverage
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
            {matches.map((match) => (
               <Link key={match.id} href={`/match/${match.id}`}>
                  <div className="group relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-yellow-500/30 hover:border-yellow-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg">
                     <div className="space-y-3">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                           <TeamSide team={match.homeTeam} align="right" />
                           <div className="text-center min-w-[60px] sm:min-w-[90px]">
                              {match.status === 'LIVE' ? (
                                 <div className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                                    {match.score || '0-0'}
                                 </div>
                              ) : (
                                 <div className="text-xs sm:text-sm font-bold text-slate-300">
                                    {new Date(match.kickoffTime).toLocaleString(
                                       'en-US',
                                       {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                       }
                                    )}
                                 </div>
                              )}
                           </div>
                           <TeamSide team={match.awayTeam} align="left" />
                        </div>
                     </div>
                  </div>
               </Link>
            ))}
         </div>
      </div>
   );
}

function TeamSide({
   team,
   align,
}: {
   team: TeamData;
   align: 'left' | 'right';
}) {
   return (
      <div className={align === 'right' ? 'text-right' : 'text-left'}>
         <div
            className={`flex mb-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}
         >
            {team.logo ? (
               <img
                  src={team.logo}
                  alt={team.name}
                  className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
               />
            ) : (
               <div className="w-10 h-10 sm:w-16 sm:h-16 bg-slate-700 rounded-xl flex items-center justify-center text-base sm:text-xl font-black">
                  {team.name.substring(0, 2)}
               </div>
            )}
         </div>
         <div className="text-xs sm:text-base font-bold text-white truncate">
            {team.name}
         </div>
      </div>
   );
}
