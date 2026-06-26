'use client';

import Link from 'next/link';
import { Crown, ChevronRight, Heart } from 'lucide-react';

interface LeagueItem {
   id: string;
   name: string;
   country: string | null;
   logo: string | null;
}

interface Props {
   leagues: LeagueItem[];
   favorites: string[];
   onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export function MajorLeaguesRail({
   leagues,
   favorites,
   onToggleFavorite,
}: Props) {
   if (leagues.length === 0) return null;

   return (
      <div className="space-y-4 sm:space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
               </div>
               <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Top Leagues</h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                     The competitions everyone's watching
                  </p>
               </div>
            </div>
            <Link
               href="/leagues"
               className="text-brand hover:text-brand-hover text-xs sm:text-sm font-medium flex items-center gap-1"
            >
               View All <ChevronRight className="w-4 h-4" />
            </Link>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {leagues.map((league) => (
               <Link key={league.id} href={`/leagues/${league.id}`}>
                  <div className="group relative bg-gradient-to-b from-yellow-900/20 to-slate-900/80 border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                     <button
                        onClick={(e) => onToggleFavorite(league.id, e)}
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Toggle favorite"
                     >
                        <Heart
                           className={`w-3.5 h-3.5 transition-colors ${
                              favorites.includes(league.id)
                                 ? 'text-pink-400 fill-pink-400'
                                 : 'text-slate-500 hover:text-pink-400'
                           }`}
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
                              <span className="text-lg font-bold text-yellow-400">
                                 {league.name.charAt(0)}
                              </span>
                           )}
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                           <Crown className="w-3 h-3 text-white" />
                        </div>
                     </div>
                     <div className="text-center space-y-1">
                        <h3 className="font-bold text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-yellow-400 transition-colors">
                           {league.name}
                        </h3>
                        {league.country && (
                           <div className="text-xs text-slate-500 line-clamp-1">
                              {league.country}
                           </div>
                        )}
                     </div>
                  </div>
               </Link>
            ))}
         </div>
      </div>
   );
}
