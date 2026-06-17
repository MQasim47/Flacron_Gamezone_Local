'use client';

import { useState } from 'react';
import { StandingsTable } from '@/entities/team/ui/StandingsTable';
import { SimpleMatchCard } from '@/entities/match/ui/SimpleMatchCard';
import { Tabs } from '@/shared/ui/Tabs';
import { EmptyState } from '@/shared/ui/LoadingErrorStates';
import { Calendar, TrendingUp, Trophy } from 'lucide-react';
import { Venue } from '@/shared/types';

type TabId = 'standings' | 'fixtures' | 'results';

interface Team {
   id: string;
   name: string;
   logo: string | null;
   apiTeamId: number | null;
}
interface Match {
   id: string;
   homeTeam: Team;
   awayTeam: Team;
   kickoffTime: string;
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
   venue?: Venue | null;
}
interface StandingTeam {
   team: Team;
   played: number;
   won: number;
   drawn: number;
   lost: number;
   goalsFor: number;
   goalsAgainst: number;
   goalDifference: number;
   points: number;
}
interface StandingsGroup {
   name: string;
   table: StandingTeam[];
}
interface StandingsData {
   hasGroups: boolean;
   table: StandingTeam[];
   groups: StandingsGroup[];
}
interface LeagueData {
   standings: StandingsData | null;
   upcomingMatches: Match[];
   recentMatches: Match[];
}

export default function LeagueDetailsClient({ data }: { data: LeagueData }) {
   const [activeTab, setActiveTab] = useState<TabId>('standings');

   const standings = data?.standings ?? null;
   const upcomingMatches = data?.upcomingMatches ?? [];
   const recentMatches = data?.recentMatches ?? [];
   const standingsCount = standings
      ? standings.hasGroups
         ? standings.groups.reduce((sum, g) => sum + g.table.length, 0)
         : standings.table.length
      : 0;

   const hasStandings = standings
      ? standings.hasGroups
         ? standings.groups.length > 0
         : standings.table.length > 0
      : false;

   const tabs = [
      {
         id: 'standings',
         label: 'Standings',
         icon: Trophy,
         count: standingsCount,
      },
      {
         id: 'fixtures',
         label: 'Fixtures',
         icon: Calendar,
         count: upcomingMatches.length,
      },
      {
         id: 'results',
         label: 'Results',
         icon: TrendingUp,
         count: recentMatches.length,
      },
   ];

   return (
      <>
         <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabId)}
         />
         {activeTab === 'standings' &&
            (!hasStandings ? (
               <EmptyState
                  icon={<Trophy className="w-8 h-8 text-slate-600" />}
                  title="No Standings Available"
                  description="Standings for this league aren't available yet."
               />
            ) : standings!.hasGroups ? (
               <div className="space-y-8">
                  {standings!.groups.map((group) => (
                     <div key={group.name} className="space-y-3">
                        <h3 className="text-lg font-bold text-white">
                           {group.name}
                        </h3>
                        <StandingsTable standings={group.table} />
                     </div>
                  ))}
               </div>
            ) : (
               <StandingsTable standings={standings!.table} />
            ))}
         {activeTab === 'fixtures' && (
            <div className="space-y-3">
               {upcomingMatches.length === 0 ? (
                  <EmptyState
                     icon={<Calendar className="w-8 h-8 text-slate-600" />}
                     title="No Upcoming Fixtures"
                     description="There are no scheduled matches for this league yet."
                  />
               ) : (
                  upcomingMatches.map((match) => (
                     <SimpleMatchCard key={match.id} {...match} />
                  ))
               )}
            </div>
         )}
         {activeTab === 'results' && (
            <div className="space-y-3">
               {recentMatches.length === 0 ? (
                  <EmptyState
                     icon={<TrendingUp className="w-8 h-8 text-slate-600" />}
                     title="No Recent Results"
                     description="There are no finished matches for this league yet."
                  />
               ) : (
                  recentMatches.map((match) => (
                     <SimpleMatchCard key={match.id} {...match} />
                  ))
               )}
            </div>
         )}
      </>
   );
}
