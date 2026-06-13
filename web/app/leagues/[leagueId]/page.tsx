import type { Metadata } from 'next';
import { BackButton } from '@/shared/ui/BackButton';
import { LeagueHeader } from '@/entities/league/ui/LeagueHeader';
import { ErrorState } from '@/shared/ui/LoadingErrorStates';
import LeagueDetailsClient from '../../../page-components/league-details/ui/LeagueDetailsClient';

interface Team {
   id: string;
   name: string;
   logo: string | null;
   apiTeamId: number | null;
}
interface Match {
   id: string;
   homeTeam: Team;
   awayTeam: Team;
   kickoffTime: string;
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
   venue: string | null;
}
interface StandingTeam {
   team: Team;
   played: number;
   won: number;
   drawn: number;
   lost: number;
   goalsFor: number;
   goalsAgainst: number;
   goalDifference: number;
   points: number;
}
interface LeagueDetailsResponse {
   league: {
      id: string;
      name: string;
      country: string | null;
      logo: string | null;
   };
   standings: StandingTeam[];
   upcomingMatches: Match[];
   recentMatches: Match[];
}

interface LeagueDetailsPageProps {
   params: { leagueId: string };
}

export async function generateMetadata({
   params,
}: LeagueDetailsPageProps): Promise<Metadata> {
   try {
      const baseUrl =
         process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      const res = await fetch(`${baseUrl}/api/leagues/${params.leagueId}`, {
         next: { revalidate: 60 },
      });
      if (!res.ok) throw new Error();
      const data: LeagueDetailsResponse = await res.json();
      return {
         title: `${data.league.name} Standings & Fixtures | Flacron Gamezone`,
         description: `View standings, fixtures and results for ${data.league.name}.`,
      };
   } catch {
      return { title: 'League Details | Flacron Gamezone' };
   }
}

export default async function LeagueDetailsPage({
   params,
}: LeagueDetailsPageProps) {
   let data: LeagueDetailsResponse | null = null;
   let fetchError: string | null = null;

   try {
      const baseUrl =
         process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      const res = await fetch(`${baseUrl}/api/leagues/${params.leagueId}`, {
         next: { revalidate: 60 },
      });
      if (!res.ok) throw new Error('Failed to fetch league details');
      data = await res.json();
   } catch (error) {
      fetchError =
         error instanceof Error
            ? error.message
            : 'Failed to load league details';
   }

   return (
      <div className="space-y-6">
         <BackButton href="/leagues" label="Back to Leagues" />
         {fetchError ? (
            <ErrorState error={fetchError} />
         ) : data ? (
            <>
               <LeagueHeader league={data.league} />
               <LeagueDetailsClient data={data} />
            </>
         ) : null}
      </div>
   );
}
