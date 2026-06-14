export interface TeamRef {
   id: string;
   name: string;
   logo: string | null;
   apiTeamId?: number | null;
}

export interface LeagueRef {
   id: string;
   name: string;
   country: string | null;
   logo: string;
}

export interface Venue {
   id: string;
   name: string;
   city: string | null;
   country: string | null;
   image: string | null;
   capacity: number | null;
   lat: number | null;
   lng: number | null;
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

export interface Match {
   id: string;
   homeTeam: TeamRef;
   awayTeam: TeamRef;
   league: LeagueRef | null;
   kickoffTime: string;
   status: MatchStatus;
   score: string | null;
   venue?: Venue | null;
}

export interface SearchResults {
   leagues: LeagueRef[];
   teams: TeamRef[];
   matches: Match[];
}
