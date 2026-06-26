import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronRight } from 'lucide-react';
import type { League } from '@/shared/types';

interface Props {
   league: League;
   index?: number;
}

export function LeagueCard({ league, index = 0 }: Props) {
   return (
      <Link
         href={`/leagues/${league.id}`}
         style={{ animationDelay: `${index * 80}ms` }}
         className="group animate-in fade-in duration-700"
      >
         <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-navy/85 to-navy-dark/90 backdrop-blur-sm border border-navy-light/40 group-hover:border-brand/50 p-6 flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10">
            {/* Logo */}
            <div className="flex items-center justify-center flex-1 mb-4">
               <div className="relative bg-navy-light/20 rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                  {league.logo ? (
                     <Image
                        src={league.logo}
                        alt={league.name}
                        width={64}
                        height={64}
                        className="object-contain w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg"
                        style={{ height: 'auto' }}
                     />
                  ) : (
                     <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-600 rounded-xl flex items-center justify-center text-xl font-bold text-slate-300">
                        {league.name.slice(0, 2).toUpperCase()}
                     </div>
                  )}
               </div>
            </div>

            {/* Info */}
            <div className="text-center space-y-1.5 mb-4">
               <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-2 text-white group-hover:text-brand-light transition-colors">
                  {league.name}
               </h3>
               {league.country && (
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 group-hover:text-brand transition-colors">
                     <MapPin className="w-3.5 h-3.5" />
                     <span className="text-xs font-medium uppercase tracking-wide">
                        {league.country}
                     </span>
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/10 group-hover:border-brand/30 transition-colors">
               <div className="flex items-center justify-center gap-1.5 text-sm text-slate-400 group-hover:text-brand transition-colors">
                  <span className="font-medium">View League</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         </div>
      </Link>
   );
}
