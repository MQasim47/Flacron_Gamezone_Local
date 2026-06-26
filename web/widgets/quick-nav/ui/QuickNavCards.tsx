'use client';

import Link from 'next/link';
import {
   Radio,
   Crown,
   Globe,
   Users,
   CalendarClock,
   Heart,
   type LucideIcon,
} from 'lucide-react';

interface NavCardDef {
   href?: string;
   onClick?: () => void;
   icon: LucideIcon;
   label: string;
   sub: string;
   gradient: string;
}

interface Props {
   liveCount: number;
   totalLeagues: number;
   hasFavorites: boolean;
   onFavoritesClick: () => void;
}

export function QuickNavCards({
   liveCount,
   totalLeagues,
   hasFavorites,
   onFavoritesClick,
}: Props) {
   const cards: NavCardDef[] = [
      {
         href: '/live',
         icon: Radio,
         label: 'Live Matches',
         sub: liveCount > 0 ? `${liveCount} now` : 'Watch now',
         gradient: 'from-red-500 to-brand',
      },
      {
         href: '/leagues',
         icon: Crown,
         label: 'Top Leagues',
         sub: 'Major comps',
         gradient: 'from-yellow-500 to-amber-500',
      },
      {
         href: '/leagues',
         icon: Globe,
         label: 'All Leagues',
         sub: `${totalLeagues} total`,
         gradient: 'from-navy to-navy-light',
      },
      {
         href: '/teams',
         icon: Users,
         label: 'Teams',
         sub: 'Browse clubs',
         gradient: 'from-purple-500 to-pink-500',
      },
      {
         href: '/matches?status=UPCOMING',
         icon: CalendarClock,
         label: 'Upcoming',
         sub: 'Fixtures',
         gradient: 'from-brand to-brand-hover',
      },
      {
         onClick: onFavoritesClick,
         icon: Heart,
         label: 'Favorites',
         sub: hasFavorites ? 'Your picks' : 'Pin leagues',
         gradient: 'from-pink-500 to-rose-500',
      },
   ];

   return (
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
         {cards.map((card) => {
            const Icon = card.icon;
            const inner = (
               <div className="group bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-brand/40 rounded-2xl p-4 text-center transition-all hover:scale-[1.04] cursor-pointer h-full flex flex-col items-center justify-center gap-2">
                  <div
                     className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                     <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <p className="text-white font-bold text-xs leading-tight">
                        {card.label}
                     </p>
                     <p className="text-slate-500 text-[10px] mt-0.5">
                        {card.sub}
                     </p>
                  </div>
               </div>
            );

            if (card.href) {
               return (
                  <Link key={card.label} href={card.href} className="h-full">
                     {inner}
                  </Link>
               );
            }
            return (
               <button
                  key={card.label}
                  onClick={card.onClick}
                  className="text-left h-full"
               >
                  {inner}
               </button>
            );
         })}
      </div>
   );
}
