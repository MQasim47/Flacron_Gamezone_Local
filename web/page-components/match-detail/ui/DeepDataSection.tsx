// web/page-components/match-detail/ui/DeepDataSection.tsx
'use client';

import { useState } from 'react';
import { Sparkles, Shield, Target } from 'lucide-react';
import { LineupsTab } from './tabs/LineupsTab';
import { StatsTab } from './tabs/StatsTab';
import { IncidentsTab } from './tabs/IncidentsTab';
import { OddsTab } from './tabs/OddsTab';
import { VotesTab } from './tabs/VotesTab';
import { H2HTab } from './tabs/H2HTab';
import { DEEP_TABS } from '../model/matchDetail.constants';
import type { DeepTab, Match } from '../model/matchDetail.types';

interface Props {
   deepData: any;
   deepLoaded: boolean;
   deepLoading: boolean;
   match: Match;
   onLoad: () => void;
}

export function DeepDataSection({
   deepData,
   deepLoaded,
   deepLoading,
   match,
   onLoad,
}: Props) {
   const [deepTab, setDeepTab] = useState<DeepTab>('lineups');

   const tabAvailable: Record<DeepTab, boolean> = {
      lineups: !!deepData?.lineups,
      stats: !!deepData?.stats,
      incidents: !!deepData?.incidents?.length,
      odds: !!deepData?.odds,
      votes: !!deepData?.votes,
      h2h: !!deepData?.h2h,
   };

   return (
      <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl shadow-2xl">
         <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                     <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <h3 className="font-black text-white text-lg uppercase tracking-wide">
                        Deep Match Data
                     </h3>
                     <p className="text-xs text-indigo-400 font-bold">
                        Lineups · Stats · Incidents · Odds
                     </p>
                  </div>
               </div>
               {!deepLoaded && (
                  <button
                     onClick={onLoad}
                     disabled={deepLoading}
                     className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-50 uppercase tracking-wide"
                  >
                     {deepLoading ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
                           Loading…
                        </>
                     ) : (
                        <>
                           <Sparkles className="w-4 h-4" /> Load Data
                        </>
                     )}
                  </button>
               )}
            </div>
         </div>

         {!deepLoaded && !deepLoading && (
            <div className="p-12 text-center">
               <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
               <p className="text-slate-400 text-sm font-semibold">
                  Click "Load Data" to fetch live lineups, stats, incidents,
                  odds and more from SportSRC.
               </p>
            </div>
         )}

         {deepLoaded && deepData && (
            <>
               <div className="flex overflow-x-auto border-b border-slate-700/50 px-2 pt-2 gap-1">
                  {DEEP_TABS.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setDeepTab(tab.id)}
                        disabled={!tabAvailable[tab.id]}
                        className={`flex-shrink-0 px-4 py-2.5 text-xs font-black uppercase tracking-wide rounded-t-lg transition-all relative ${
                           deepTab === tab.id
                              ? 'text-indigo-400'
                              : tabAvailable[tab.id]
                                ? 'text-slate-400 hover:text-white'
                                : 'text-slate-600 cursor-not-allowed'
                        }`}
                     >
                        {tab.label}
                        {!tabAvailable[tab.id] && (
                           <span className="ml-1 text-slate-600">—</span>
                        )}
                        {deepTab === tab.id && (
                           <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t" />
                        )}
                     </button>
                  ))}
               </div>

               <div className="p-6">
                  {deepTab === 'lineups' && deepData.lineups && (
                     <LineupsTab
                        lineups={deepData.lineups}
                        homeTeamName={match.homeTeam.name}
                        awayTeamName={match.awayTeam.name}
                     />
                  )}
                  {deepTab === 'stats' && deepData.stats && (
                     <StatsTab stats={deepData.stats} />
                  )}
                  {deepTab === 'incidents' &&
                     deepData.incidents?.length > 0 && (
                        <IncidentsTab incidents={deepData.incidents} />
                     )}
                  {deepTab === 'odds' && deepData.odds && (
                     <OddsTab
                        odds={deepData.odds}
                        homeTeamName={match.homeTeam.name}
                        awayTeamName={match.awayTeam.name}
                     />
                  )}
                  {deepTab === 'votes' && deepData.votes && (
                     <VotesTab
                        votes={deepData.votes}
                        homeTeamName={match.homeTeam.name}
                        awayTeamName={match.awayTeam.name}
                     />
                  )}
                  {deepTab === 'h2h' && deepData.h2h && (
                     <H2HTab
                        h2h={deepData.h2h}
                        lastMatches={deepData.lastMatches}
                        homeTeamName={match.homeTeam.name}
                        awayTeamName={match.awayTeam.name}
                     />
                  )}
               </div>
            </>
         )}
      </div>
   );
}
