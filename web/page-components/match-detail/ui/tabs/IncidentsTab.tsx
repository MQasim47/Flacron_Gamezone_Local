'use client';

interface Props {
   incidents: any[];
}

const TYPE_ICON: Record<string, string> = {
   goal: '⚽',
   yellow_card: '🟨',
   red_card: '🟥',
   sub: '🔄',
   period: '🕐',
   card: '🗂️', // Default fallback card icon
};

const TYPE_COLOR: Record<string, string> = {
   goal: 'text-green-400',
   yellow_card: 'text-yellow-400',
   red_card: 'text-red-400',
};

export function IncidentsTab({ incidents }: Props) {
   return (
      <div className="space-y-2">
         {incidents.map((inc: any, i: number) => {
            // 1. Resolve dynamic incident type for mapping styles
            let lookupType = inc.type;

            if (inc.type === 'card' && inc.detail?.card_type) {
               lookupType = `${inc.detail.card_type}_card`; // yields 'yellow_card' or 'red_card'
            }

            // 2. Fetch appropriate visual tokens
            const icon = TYPE_ICON[lookupType] ?? TYPE_ICON[inc.type] ?? '•';
            const colorClass = TYPE_COLOR[lookupType] ?? 'text-slate-400';

            return (
               <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30"
               >
                  {/* Time Badge */}
                  <span className="w-10 text-center text-xs font-black text-slate-400 flex-shrink-0">
                     {inc.time_display ?? (inc.time ? `${inc.time}'` : '—')}
                  </span>

                  {/* Icon/Emoji */}
                  <span
                     className={`text-sm font-black flex-shrink-0 ${colorClass}`}
                  >
                     {icon}
                  </span>

                  {/* Detail Info */}
                  <div className="flex-1 min-w-0">
                     <span className="text-sm text-white font-medium truncate block">
                        {inc.detail?.text ?? inc.player ?? '—'}
                     </span>
                     {inc.detail?.score && (
                        <span className="text-xs text-slate-500">
                           {inc.detail.score.home} – {inc.detail.score.away}
                        </span>
                     )}
                  </div>
               </div>
            );
         })}
      </div>
   );
}
