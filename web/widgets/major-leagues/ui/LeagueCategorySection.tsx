'use client';

import Link from 'next/link';
import { Heart, type LucideIcon } from 'lucide-react';
import type { LeagueCategoryMeta } from '@/shared/lib/leagueCategories';

interface LeagueItem {
   id: string;
   name: string;
   country: string | null;
   logo: string | null;
}

interface Props {
   meta: LeagueCategoryMeta;
   icon: LucideIcon;
   leagues: LeagueItem[];
   favorites: string[];
   onToggleFavorite: (id: string, e: React.MouseEvent) => void;
   maxVisible?: number;
}

export function LeagueCategorySection({
   meta,
   icon: Icon,
   leagues,
   favorites,
   onToggleFavorite,
   maxVisible = 6,
}: Props) {
   if (leagues.length === 0) return null;

   return (
      <div className="space-y-3">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800/60 border border-slate-700/50 rounded-xl flex items-center justify-center">
               <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold">{meta.label}</h3>
            <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
               {leagues.length}
            </span>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {leagues.slice(0, maxVisible).map((league) => (
               <Link key={league.id} href={`/leagues/${league.id}`}>
                  <div className="group relative bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/40 hover:scale-[1.02] transition-all cursor-pointer text-center">
                     <button
                        onClick={(e) => onToggleFavorite(league.id, e)}
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Toggle favorite"
                     >
                        <Heart
                           className={`w-3 h-3 ${
                              favorites.includes(league.id)
                                 ? 'text-pink-400 fill-pink-400'
                                 : 'text-slate-600 hover:text-pink-400'
                           }`}
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
                     <h4 className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {league.name}
                     </h4>
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
}
