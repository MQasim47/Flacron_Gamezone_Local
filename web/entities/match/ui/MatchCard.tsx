import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { formatDateShort, formatDateTime } from '@/shared/lib/format';
import type { Match } from '@/shared/types';

interface Props {
   match: Match;
   /** Highlight this team's result */
   currentTeamName?: string;
   showLeague?: boolean;
   variant?: 'default' | 'compact';
}

export function MatchCard({
   match,
   currentTeamName,
   showLeague = true,
   variant = 'default',
}: Props) {
   const isCompact = variant === 'compact';

   return (
      <Link
         href={`/match/${match.id}`}
         className="group block bg-gradient-to-br from-navy/70 to-navy-dark/80 backdrop-blur-sm border border-navy-light/40 rounded-2xl p-5 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 transition-all duration-300"
      >
         {/* Header row */}
         <div className="flex items-center justify-between mb-4">
            {showLeague && match.league && (
               <span className="text-xs font-semibold px-3 py-1.5 bg-brand/10 text-brand border border-brand/20 rounded-lg truncate max-w-[140px]">
                  {match.league.name}
               </span>
            )}
            <div className="ml-auto flex items-center gap-2">
               <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateShort(match.kickoffTime)}
               </span>
            </div>
         </div>

         {/* Teams + score */}
         <div className="flex items-center gap-3">
            <TeamDisplay
               team={match.homeTeam}
               align="right"
               currentTeamName={currentTeamName}
            />

            <div className="flex-shrink-0 min-w-[80px] text-center">
               {match.status === 'UPCOMING' ? (
                  <div className="space-y-1">
                     <StatusBadge status="UPCOMING" size="sm" />
                     <p className="text-xs text-slate-500">
                        {formatDateTime(match.kickoffTime)}
                     </p>
                  </div>
               ) : (
                  <div className="space-y-1">
                     <p className="text-2xl font-bold text-white">
                        {match.score ?? '–'}
                     </p>
                     <StatusBadge status={match.status} size="sm" />
                  </div>
               )}
            </div>

            <TeamDisplay
               team={match.awayTeam}
               align="left"
               currentTeamName={currentTeamName}
            />
         </div>

         {/* Footer */}
         {!isCompact && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
               {match.venue ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                     <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                     {match.venue.name}
                     {match.venue.city ? `, ${match.venue.city}` : ''}
                  </span>
               ) : (
                  <span />
               )}
               <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
         )}
      </Link>
   );
}

function TeamDisplay({
   team,
   align,
   currentTeamName,
}: {
   team: Match['homeTeam'];
   align: 'left' | 'right';
   currentTeamName?: string;
}) {
   const isHighlighted = currentTeamName && team.name === currentTeamName;

   return (
      <div
         className={`flex-1 flex items-center gap-2 ${
            align === 'right' ? 'flex-row-reverse text-right' : 'text-left'
         }`}
      >
         {team.logo ? (
            <Image
               src={team.logo}
               alt={team.name}
               width={32}
               height={32}
               className="object-contain flex-shrink-0"
               style={{ height: 'auto' }}
            />
         ) : (
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
               {team.name.slice(0, 2).toUpperCase()}
            </div>
         )}
         <span
            className={`text-sm font-semibold truncate group-hover:text-brand-light transition-colors ${
               isHighlighted ? 'text-brand' : 'text-white'
            }`}
         >
            {team.name}
         </span>
      </div>
   );
}
