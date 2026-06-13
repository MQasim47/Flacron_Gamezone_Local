export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import LiveMatchesClient from '../../page-components/live/ui/LiveMatchesClient';

export const metadata: Metadata = {
   title: 'Live Football Matches | Flacron Gamezone',
   description:
      'Watch live football matches, real-time scores, and streaming availability.',
};

export default async function LiveMatchesPage() {
   let initialMatches: any[] = [];
   let fetchError = false;

   try {
      const baseUrl =
         process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/matches/live`, {
         cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch live matches');
      const data = await res.json();
      // Handle both old array shape and new object shape
      initialMatches = Array.isArray(data) ? data : (data.matches ?? []);
   } catch {
      fetchError = true;
   }

   return (
      <div className="bg-[#0a0e27] flex flex-col min-h-screen">
         <LiveMatchesClient
            initialMatches={initialMatches}
            initialError={fetchError}
         />
      </div>
   );
}
