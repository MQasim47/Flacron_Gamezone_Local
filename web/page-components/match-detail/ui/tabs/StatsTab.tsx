'use client';

interface Props {
   stats: any;
}

export function StatsTab({ stats }: Props) {
   const period = stats.all ?? stats.h2 ?? stats.h1 ?? null;

   if (!period) {
      return (
         <div className="text-center py-10">
            <p className="text-slate-400 text-sm font-semibold">
               No stats available yet for this match.
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-3">
         {Object.entries(period.home || {}).map(([key, homeVal]) => {
            const awayVal = (period.away || {})[key];
            if (homeVal == null && awayVal == null) return null;
            const label = key
               .replace(/_/g, ' ')
               .replace(/\b\w/g, (c: string) => c.toUpperCase());
            const h = Number(homeVal) || 0;
            const a = Number(awayVal) || 0;
            const total = h + a || 1;
            return (
               <div
                  key={key}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30"
               >
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                     <span className="text-cyan-400">
                        {String(homeVal ?? 0)}
                     </span>
                     <span className="text-slate-400 uppercase tracking-wide">
                        {label}
                     </span>
                     <span className="text-purple-400">
                        {String(awayVal ?? 0)}
                     </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-700">
                     <div
                        className="bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                        style={{ width: `${(h / total) * 100}%` }}
                     />
                     <div className="bg-gradient-to-r from-purple-400 to-purple-500 transition-all flex-1" />
                  </div>
               </div>
            );
         })}
      </div>
   );
}
