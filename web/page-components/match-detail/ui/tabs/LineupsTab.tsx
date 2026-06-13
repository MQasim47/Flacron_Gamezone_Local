'use client';

interface Props {
   lineups: any;
   homeTeamName: string;
   awayTeamName: string;
}

export function LineupsTab({ lineups, homeTeamName, awayTeamName }: Props) {
   return (
      <div className="grid md:grid-cols-2 gap-6">
         {(['home', 'away'] as const).map((side) => {
            const lineup = lineups[side];
            if (!lineup) return null;
            const teamName = side === 'home' ? homeTeamName : awayTeamName;
            const players = [
               ...(lineup.start_xi ?? []).map((p: any) => ({
                  ...p,
                  isSub: false,
               })),
               ...(lineup.subs ?? []).map((p: any) => ({ ...p, isSub: true })),
            ];

            return (
               <div
                  key={side}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
               >
                  <div className="flex items-center justify-between mb-3">
                     <h4 className="font-black text-white text-sm uppercase">
                        {teamName}
                     </h4>
                     {lineup.formation && (
                        <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                           {lineup.formation}
                        </span>
                     )}
                  </div>
                  {lineup.coach && (
                     <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/50">
                        {lineup.coach.photo && (
                           <img
                              src={lineup.coach.photo}
                              alt={lineup.coach.name}
                              className="w-6 h-6 rounded-full object-cover"
                           />
                        )}
                        <span className="text-xs text-slate-400 font-semibold">
                           Coach: {lineup.coach.name}
                        </span>
                     </div>
                  )}
                  <div className="space-y-2">
                     {players.map((player: any, i: number) => (
                        <div
                           key={i}
                           className={`flex items-center gap-3 p-2 rounded-lg ${player.isSub ? 'opacity-60' : ''}`}
                        >
                           {player.photo ? (
                              <img
                                 src={player.photo}
                                 alt={player.name}
                                 className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                           ) : (
                              <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                                 {player.number ?? i + 1}
                              </span>
                           )}
                           <span className="text-xs text-slate-500 w-5 flex-shrink-0">
                              #{player.number}
                           </span>
                           <span className="text-sm text-white font-medium flex-1 truncate">
                              {player.name}
                              {player.is_captain && (
                                 <span className="ml-1 text-yellow-400 text-xs">
                                    ©
                                 </span>
                              )}
                           </span>
                           {player.position && (
                              <span className="text-xs text-slate-500 flex-shrink-0">
                                 {player.position}
                              </span>
                           )}
                           {player.isSub && (
                              <span className="text-xs text-yellow-500 flex-shrink-0">
                                 SUB
                              </span>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            );
         })}
      </div>
   );
}
