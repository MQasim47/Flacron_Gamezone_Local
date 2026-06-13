export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import HomePage from '../page-components/home/ui/HomePage';

export const metadata: Metadata = {
   title: 'Flacron Gamezone | Live Football Matches & Scores',
   description:
      'Your ultimate destination for live football matches, comprehensive league coverage, and real-time updates from around the globe.',
};

export default async function RootPage() {
   let featuredLeagues: any[] = [];
   let liveMatches: any[] = [];
   let upcomingMatches: any[] = [];

   const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

   try {
      const [leaguesRes, liveRes, upcomingRes] = await Promise.all([
         fetch(`${baseUrl}/api/leagues`, {
            cache: 'no-store',
         }),
         fetch(`${baseUrl}/api/matches/live`, {
            cache: 'no-store',
         }),
         fetch(`${baseUrl}/api/matches?status=UPCOMING`, {
            cache: 'no-store',
         }),
      ]);

      if (leaguesRes.ok) {
         const data = await leaguesRes.json();
         featuredLeagues = (data.leagues ?? []).slice(0, 8);
      }
      if (liveRes.ok) {
         const data = await liveRes.json();
         // Handle both old array shape and new object shape
         liveMatches = Array.isArray(data) ? data : (data.matches ?? []);
      }
      if (upcomingRes.ok) {
         const data = await upcomingRes.json();
         upcomingMatches = Array.isArray(data) ? data.slice(0, 6) : [];
      }
   } catch {
      // fall through with empty arrays
   }

   return (
      <HomePage
         initialFeaturedLeagues={featuredLeagues}
         initialLiveMatches={liveMatches}
         initialUpcomingMatches={upcomingMatches}
      />
   );
}
