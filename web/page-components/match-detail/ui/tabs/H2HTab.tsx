// web/page-components/match-detail/ui/tabs/H2HTab.tsx
'use client';

interface Props {
   h2h: any;
   lastMatches: any;
   homeTeamName: string;
   awayTeamName: string;
}

export function H2HTab({
   h2h,
   lastMatches,
   homeTeamName,
   awayTeamName,
}: Props) {
   const duel = h2h.team_duel;
   const recent = [...(lastMatches?.home ?? []), ...(lastMatches?.away ?? [])]
      .sort((a: any, b: any) => b.timestamp - a.timestamp)
      .slice(0, 5);

   const summary = [
      { label: homeTeamName, val: duel?.home_wins, color: 'text-cyan-400' },
      { label: 'Draws', val: duel?.draws, color: 'text-slate-400' },
      { label: awayTeamName, val: duel?.away_wins, color: 'text-purple-400' },
   ];

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-3 gap-4 text-center mb-4">
            {summary.map(({ label, val, color }) => (
               <div
                  key={label}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30"
               >
                  <div className={`text-3xl font-black ${color}`}>
                     {val ?? '—'}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-1">
                     {label}
                  </div>
               </div>
            ))}
         </div>
         {recent.length > 0 && (
            <div className="space-y-2">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Recent Matches
               </h4>
               {recent.map((m: any, i: number) => (
                  <div
                     key={i}
                     className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 text-sm"
                  >
                     <span className="text-slate-300 truncate flex-1">
                        {m.home_team?.name ?? '?'}
                     </span>
                     <span className="font-black text-white mx-3 flex-shrink-0">
                        {m.home_score ?? '?'} – {m.away_score ?? '?'}
                     </span>
                     <span className="text-slate-300 truncate flex-1 text-right">
                        {m.away_team?.name ?? '?'}
                     </span>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
