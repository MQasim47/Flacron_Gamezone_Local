// web/app/leagues/page.tsx
export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { ErrorState } from '@/shared/ui/LoadingErrorStates';
import LeaguesClient from '../../page-components/leagues/ui/LeaguesClient';
import { Trophy, Globe2, Sparkles } from 'lucide-react';

interface League {
   id: string;
   name: string;
   country: string | null;
   logo: string;
}

export const metadata: Metadata = {
   title: 'Premier Football Leagues | Flacron Gamezone',
   description: 'Explore top football leagues from around the world.',
   keywords: ['football leagues', 'soccer leagues', 'premier leagues'],
};

export default async function LeaguesPage() {
   let leagues: League[] = [];
   let fetchError: string | null = null;

   try {
      const baseUrl =
         process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      const res = await fetch(`${baseUrl}/api/leagues`, {
         cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch leagues');
      const data = await res.json();
      if (!data.success) throw new Error('Failed to fetch leagues');
      leagues = data.leagues ?? [];
   } catch (error) {
      fetchError =
         error instanceof Error ? error.message : 'Failed to load leagues';
   }

   return (
      <div className="space-y-8 relative">
         <div className="relative overflow-hidden rounded-3xl">
            <div className="relative bg-gradient-to-br from-navy/90 via-navy-dark/90 to-navy/90 backdrop-blur-xl border border-navy-light/40 rounded-3xl overflow-hidden">
               <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 md:p-12">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="relative bg-gradient-to-br from-brand to-brand-dark p-3 rounded-xl">
                           <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div>
                           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-light to-brand mb-2">
                              Premier Leagues
                           </h1>
                           <p className="text-slate-400 text-sm md:text-base flex items-center gap-2">
                              <Globe2 className="w-4 h-4" />
                              Discover elite football competitions worldwide
                           </p>
                        </div>
                     </div>
                  </div>
                  {!fetchError && (
                     <div className="text-3xl font-bold text-brand flex items-center gap-2">
                        {leagues.length}
                        <Sparkles className="w-5 h-5 text-brand" />
                     </div>
                  )}
               </div>
            </div>
         </div>
         {fetchError ? (
            <ErrorState error={fetchError} />
         ) : (
            <LeaguesClient leagues={leagues} />
         )}
      </div>
   );
}
