export interface Team {
   id: string;
   name: string;
   logo: string | null;
   apiTeamId: number | null;
}

export interface League {
   id: string;
   name: string;
   country: string | null;
   logo: string | null;
   apiLeagueId: number | null;
}

export interface Stream {
   id: string;
   matchId: string;
   type: 'EMBED' | 'NONE';
   provider: string | null;
   url: string | null;
   isActive: boolean;
}

export interface AISummary {
   id: string;
   matchId: string;
   provider: string;
   language: string;
   kind: 'preview' | 'summary';
   content: string;
   createdAt: string;
}

export interface Match {
   id: string;
   apiFixtureId: number | null;
   leagueId: string | null;
   homeTeamId: string;
   awayTeamId: string;
   kickoffTime: string;
   status: 'UPCOMING' | 'LIVE' | 'FINISHED';
   score: string | null;
   venue: string | null;
   league: League | null;
   homeTeam: Team;
   awayTeam: Team;
   stream: Stream | null;
   aiTexts: AISummary[];
}

export type DeepTab =
   | 'lineups'
   | 'stats'
   | 'incidents'
   | 'odds'
   | 'votes'
   | 'h2h';
export type Lang = 'en' | 'fr';
