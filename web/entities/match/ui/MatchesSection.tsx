import { LucideIcon } from 'lucide-react';
import { MatchCard } from './MatchCard';

interface TeamData {
   name: string;
   logo: string | null;
}
interface League {
   name: string;
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
   venue?: Venue | null;
   league: League;
}

const colorStyles = {
   blue: {
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      iconText: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 border-blue-500/20',
      badgeText: 'text-blue-400',
   },
   green: {
      iconBg: 'bg-green-500/10 border-green-500/20',
      iconText: 'text-green-400',
      badgeBg: 'bg-green-500/10 border-green-500/20',
      badgeText: 'text-green-400',
   },
   yellow: {
      iconBg: 'bg-yellow-500/10 border-yellow-500/20',
      iconText: 'text-yellow-400',
      badgeBg: 'bg-yellow-500/10 border-yellow-500/20',
      badgeText: 'text-yellow-400',
   },
   red: {
      iconBg: 'bg-red-500/10 border-red-500/20',
      iconText: 'text-red-400',
      badgeBg: 'bg-red-500/10 border-red-500/20',
      badgeText: 'text-red-400',
   },
} as const;
type ColorVariant = keyof typeof colorStyles;

interface MatchesSectionProps {
   title: string;
   icon: LucideIcon;
   matches: Match[];
   variant: 'upcoming' | 'finished';
   currentTeamName?: string;
   emptyMessage: string;
   iconColor: ColorVariant;
   badgeColor: ColorVariant;
}

export function MatchesSection({
   title,
   icon: Icon,
   matches,
   variant,
   currentTeamName,
   emptyMessage,
   iconColor,
   badgeColor,
}: MatchesSectionProps) {
   const iconStyles = colorStyles[iconColor];
   const badgeStyles = colorStyles[badgeColor];
   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
               <div
                  className={`w-10 h-10 rounded-xl ${iconStyles.iconBg} flex items-center justify-center`}
               >
                  <Icon className={`w-5 h-5 ${iconStyles.iconText}`} />
               </div>
               {title}
            </h2>
            <div
               className={`px-3 py-1.5 rounded-full border ${badgeStyles.badgeBg} flex items-center justify-center`}
            >
               <span
                  className={`text-sm font-semibold ${badgeStyles.badgeText}`}
               >
                  {matches.length}
               </span>
            </div>
         </div>
         <div className="space-y-3">
            {matches.length > 0 ? (
               matches.map((match) => (
                  <MatchCard
                     key={match.id}
                     match={
                        {
                           ...match,
                           league: match.league
                              ? {
                                   id: '',
                                   country: '',
                                   logo: '',
                                   name: match.league.name,
                                }
                              : undefined,
                        } as any
                     }
                     currentTeamName={currentTeamName}
                     variant={variant === 'upcoming' ? 'default' : 'compact'}
                  />
               ))
            ) : (
               <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                     <Icon className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">
                     {emptyMessage}
                  </p>
               </div>
            )}
         </div>
      </div>
   );
}
