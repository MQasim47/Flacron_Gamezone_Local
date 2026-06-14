import Link from 'next/link';
import Image from 'next/image';

interface Team {
   id: string;
   name: string;
   logo: string | null;
   apiTeamId: number | null;
}

interface Venue {
   id: string;
   name: string;
   city: string | null;
}

interface SimpleMatchCardProps {
   id: string;
   homeTeam: Team;
   awayTeam: Team;
   kickoffTime: string;
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
   venue?: Venue | null;
}

export function SimpleMatchCard({
   id,
   homeTeam,
   awayTeam,
   kickoffTime,
   status,
   score,
   venue,
}: SimpleMatchCardProps) {
   const formatDate = (d: string) =>
      new Intl.DateTimeFormat('en-US', {
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      }).format(new Date(d));

   return (
      <Link
         href={`/match/${id}`}
         className="block bg-card border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 group"
      >
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
               {homeTeam.logo && (
                  <Image
                     src={homeTeam.logo}
                     alt={homeTeam.name}
                     width={32}
                     height={32}
                     style={{ height: 'auto' }}
                     className="rounded"
                  />
               )}
               <span className="font-medium group-hover:text-blue-400 transition-colors">
                  {homeTeam.name}
               </span>
            </div>
            <div className="text-center px-4">
               {(status === 'FINISHED' || status === 'LIVE') && score ? (
                  <>
                     <div className="text-xl font-bold">{score}</div>
                     <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(kickoffTime)}
                     </div>
                     {status === 'LIVE' && (
                        <span className="inline-block px-2 py-1 rounded bg-red-500 text-white text-xs font-bold mt-1 animate-pulse">
                           LIVE
                        </span>
                     )}
                  </>
               ) : (
                  <>
                     <div className="text-sm text-muted-foreground">
                        {formatDate(kickoffTime)}
                     </div>
                     {status === 'LIVE' && (
                        <span className="inline-block px-2 py-1 rounded bg-red-500 text-white text-xs font-bold mt-1 animate-pulse">
                           LIVE
                        </span>
                     )}
                  </>
               )}
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
               <span className="font-medium group-hover:text-blue-400 transition-colors">
                  {awayTeam.name}
               </span>
               {awayTeam.logo && (
                  <Image
                     src={awayTeam.logo}
                     alt={awayTeam.name}
                     width={32}
                     height={32}
                     style={{ height: 'auto' }}
                     className="rounded"
                  />
               )}
            </div>
         </div>
         {venue && (
            <div className="text-xs text-muted-foreground text-center mt-2">
               📍 {venue.name}
               {venue.city ? `, ${venue.city}` : ''}
            </div>
         )}
      </Link>
   );
}
