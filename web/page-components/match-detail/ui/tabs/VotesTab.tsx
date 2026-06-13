// web/page-components/match-detail/ui/tabs/VotesTab.tsx
'use client';

interface Props {
   votes: any;
   homeTeamName: string;
   awayTeamName: string;
}

export function VotesTab({ votes, homeTeamName, awayTeamName }: Props) {
   const mv = votes.match_winner;
   const rows = [
      {
         label: `${homeTeamName} Win`,
         pct: mv?.home?.percent,
         color: 'bg-cyan-500',
      },
      { label: 'Draw', pct: mv?.draw?.percent, color: 'bg-slate-500' },
      {
         label: `${awayTeamName} Win`,
         pct: mv?.away?.percent,
         color: 'bg-purple-500',
      },
   ];

   return (
      <div className="space-y-4">
         {rows.map(({ label, pct, color }) => (
            <div key={label}>
               <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-slate-300">{label}</span>
                  <span className="text-white">
                     {pct != null ? `${pct}%` : '—'}
                  </span>
               </div>
               <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                     className={`h-full ${color} rounded-full transition-all`}
                     style={{ width: `${pct ?? 0}%` }}
                  />
               </div>
            </div>
         ))}
         {mv?.total != null && (
            <p className="text-xs text-slate-500 text-center">
               {mv.total.toLocaleString()} total votes
            </p>
         )}
      </div>
   );
}
