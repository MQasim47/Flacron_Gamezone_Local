'use client';

interface Props {
   odds: any;
   homeTeamName: string;
   awayTeamName: string;
}

export function OddsTab({ odds, homeTeamName, awayTeamName }: Props) {
   const liveMarket = odds.markets?.find((m: any) => m.is_live && !m.suspended);
   const preMarket = odds.markets?.find((m: any) => !m.is_live && !m.suspended);
   const market = liveMarket ?? preMarket;

   const getChoice = (name: string) =>
      market?.choices?.find((c: any) => c.name === name);
   const getTrend = (trend: string) =>
      trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';

   const slots = [
      {
         label: homeTeamName,
         choice: getChoice('1'),
         color: 'from-cyan-600 to-blue-600',
      },
      {
         label: 'Draw',
         choice: getChoice('X'),
         color: 'from-slate-600 to-slate-500',
      },
      {
         label: awayTeamName,
         choice: getChoice('2'),
         color: 'from-purple-600 to-pink-600',
      },
   ];

   return (
      <>
         <div className="grid grid-cols-3 gap-4">
            {slots.map(({ label, choice, color }) => (
               <div
                  key={label}
                  className={`bg-gradient-to-br ${color} rounded-xl p-4 text-center shadow-lg`}
               >
                  <div className="text-xs text-white/70 font-semibold uppercase mb-1 truncate">
                     {label}
                  </div>
                  <div className="text-2xl font-black text-white">
                     {choice?.decimal ?? '—'}
                     {choice?.trend && choice.trend !== 'neutral' && (
                        <span className="text-sm ml-1">
                           {getTrend(choice.trend)}
                        </span>
                     )}
                  </div>
                  {choice?.fraction && (
                     <div className="text-xs text-white/60 mt-1">
                        {choice.fraction}
                     </div>
                  )}
               </div>
            ))}
         </div>
         <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            {liveMarket && (
               <span className="text-red-400 font-bold">🔴 Live odds</span>
            )}
            {odds.bookmaker_name && <span>via {odds.bookmaker_name}</span>}
         </div>
      </>
   );
}
