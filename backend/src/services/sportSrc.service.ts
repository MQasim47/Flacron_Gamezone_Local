import { config } from '../config/index.js';
import { cacheGet, cacheSet } from '../lib/redis.js';

const BASE = config.sportSrc.baseUrl;

// ─── Error class ──────────────────────────────────────────────────────────────

export class SportSrcError extends Error {
   constructor(
      message: string,
      public code:
         | 'NO_KEY'
         | 'QUOTA_EXCEEDED'
         | 'UNAUTHORIZED'
         | 'NOT_FOUND'
         | 'UNKNOWN'
   ) {
      super(message);
      this.name = 'SportSrcError';
   }
}

// ─── Raw response shapes ──────────────────────────────────────────────────────

export interface SportSrcMatch {
   id: string;
   home_team: string;
   away_team: string;
   home_score: number | null;
   away_score: number | null;
   status: string;
   kickoff: string;
   league: string;
   league_id?: string | number;
   league_logo?: string;
   league_flag?: string;
   country?: string;
   venue?: string;
   has_stream?: boolean;
   has_standing?: boolean;
}

export interface SportSrcDetail {
   id: string;
   home_team: string;
   away_team: string;
   home_score: number | null;
   away_score: number | null;
   status: string;
   kickoff: string;
   league: string;
   league_id?: string | number;
   country?: string;
   venue?: string;
   referee?: string;
   stream_url?: string; // primary embed URL
   stream_url_2?: string; // redundancy source 2
   stream_url_3?: string; // redundancy source 3
   [key: string]: unknown;
}

export interface SportSrcLineups {
   home: { formation?: string; players: any[] };
   away: { formation?: string; players: any[] };
}

export interface SportSrcStats {
   home: Record<string, any>;
   away: Record<string, any>;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function get<T>(
   params: Record<string, string>,
   cacheTtl = 30
): Promise<T> {
   if (!config.sportSrc.key) {
      throw new SportSrcError('SportSRC API key not configured', 'NO_KEY');
   }

   const qs = new URLSearchParams(params).toString();
   const url = `${BASE}/?${qs}`;
   const cacheKey = `sportsrc:${qs}`;

   const cached = await cacheGet<T>(cacheKey);
   if (cached) return cached;

   const res = await fetch(url, {
      headers: { 'X-API-KEY': config.sportSrc.key },
      signal: AbortSignal.timeout(15_000),
   });

   if (res.status === 401 || res.status === 403) {
      throw new SportSrcError(
         'SportSRC API key invalid or unauthorised',
         'UNAUTHORIZED'
      );
   }
   if (res.status === 429) {
      throw new SportSrcError(
         'SportSRC daily quota exceeded',
         'QUOTA_EXCEEDED'
      );
   }
   if (res.status === 404) {
      throw new SportSrcError('SportSRC resource not found', 'NOT_FOUND');
   }
   if (!res.ok) {
      throw new SportSrcError(
         `SportSRC HTTP ${res.status}: ${res.statusText}`,
         'UNKNOWN'
      );
   }

   const data = (await res.json()) as T;
   if (cacheTtl > 0) await cacheSet(cacheKey, data, cacheTtl);
   return data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const sportSrcService = {
   /**
    * List matches by status and optional date.
    * status: "inprogress" | "finished" | "notstarted"
    */
   async getMatches(
      status: 'inprogress' | 'finished' | 'notstarted',
      date?: string
   ): Promise<SportSrcMatch[]> {
      const params: Record<string, string> = {
         type: 'matches',
         sport: 'football',
         status,
      };
      if (date) params.date = date;

      const data = await get<{
         success?: boolean;
         data?: Array<{
            league: {
               name: string;
               country: string;
               flag: string;
               logo: string;
            };
            matches: Array<{
               id: string;
               title: string;
               timestamp: number;
               status: string;
               status_detail: string;
               round: string;
               teams: {
                  home: {
                     name: string;
                     code: string;
                     color: string;
                     badge: string;
                  };
                  away: {
                     name: string;
                     code: string;
                     color: string;
                     badge: string;
                  };
               };
               score: {
                  current: { home: number; away: number };
                  period_1: string | null;
                  period_2: string | null;
                  display: string;
               };
            }>;
         }>;
         matches?: SportSrcMatch[];
      }>(params, status === 'inprogress' ? 30 : 120);

      // Legacy flat shape
      if (data.matches) return data.matches;

      // New grouped-by-league shape
      if (data.data && Array.isArray(data.data) && data.data[0]?.league) {
         return data.data.flatMap((group) =>
            group.matches.map((m) => ({
               id: m.id,
               home_team: m.teams.home.name,
               away_team: m.teams.away.name,
               home_score: m.score.current.home,
               away_score: m.score.current.away,
               status: m.status,
               kickoff: new Date(m.timestamp).toISOString(),
               league: group.league.name,
               league_logo: group.league.logo,
               league_flag: group.league.flag,
               country: group.league.country,
               venue: undefined,
               has_stream: false,
               has_standing: false,
            }))
         );
      }

      // Flat data[] shape (original assumption)
      if (data.data) return data.data as unknown as SportSrcMatch[];

      return [];
   },

   /**
    * Lightweight daily scores list — includes has_stream & has_standing flags.
    */
   async getScores(date?: string): Promise<SportSrcMatch[]> {
      const params: Record<string, string> = { type: 'scores' };
      if (date) params.date = date;

      const data = await get<{ data?: SportSrcMatch[] }>(params, 30);
      return data.data ?? [];
   },

   /**
    * Full match detail including stream embed URLs.
    */
   async getDetail(matchId: string): Promise<SportSrcDetail | null> {
      try {
         const data = await get<{ data?: SportSrcDetail }>(
            { type: 'detail', id: matchId },
            20
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Confirmed lineups & formations (Premium).
    */
   async getLineups(matchId: string): Promise<SportSrcLineups | null> {
      try {
         const data = await get<{ data?: SportSrcLineups }>(
            { type: 'lineups', id: matchId },
            60
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Live match statistics (Premium).
    */
   async getStats(matchId: string): Promise<SportSrcStats | null> {
      try {
         const data = await get<{ data?: SportSrcStats }>(
            { type: 'stats', id: matchId },
            20
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Live incidents — goals, cards, subs (Premium).
    */
   async getIncidents(matchId: string): Promise<any[] | null> {
      try {
         const data = await get<{ data?: any[] }>(
            { type: 'incidents', id: matchId },
            15
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Shotmap with X/Y/Z pitch coordinates and xG values (Premium).
    */
   async getShotmap(matchId: string): Promise<any[] | null> {
      try {
         const data = await get<{ data?: any[] }>(
            { type: 'shotmap', id: matchId },
            20
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Betting odds — fractional and decimal (Premium).
    */
   async getOdds(matchId: string): Promise<any | null> {
      try {
         const data = await get<{ data?: any }>(
            { type: 'odds', id: matchId },
            30
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Community votes / predictions (Premium).
    */
   async getVotes(matchId: string): Promise<any | null> {
      try {
         const data = await get<{ data?: any }>(
            { type: 'votes', id: matchId },
            60
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Head-to-head history (Premium).
    */
   async getH2H(matchId: string): Promise<any | null> {
      try {
         const data = await get<{ data?: any }>(
            { type: 'h2h', id: matchId },
            300
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Last matches (form) for both teams (Premium).
    */
   async getLastMatches(matchId: string): Promise<any | null> {
      try {
         const data = await get<{ data?: any }>(
            { type: 'last_matches', id: matchId },
            300
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * League standings by match ID or league ID (Premium).
    */
   async getStanding(matchId?: string, leagueId?: string): Promise<any | null> {
      if (!matchId && !leagueId) return null;
      const params: Record<string, string> = { type: 'standing' };
      if (matchId) params.id = matchId;
      if (leagueId) params.league_id = leagueId;
      try {
         const data = await get<{ data?: any }>(params, 120);
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Momentum / pressure graph (Premium).
    */
   async getGraph(matchId: string): Promise<any | null> {
      try {
         const data = await get<{ data?: any }>(
            { type: 'graph', id: matchId },
            15
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Post-match highlight URLs (Premium).
    */
   async getHighlights(matchId: string): Promise<any | null> {
      try {
         const data = await get<{ data?: any }>(
            { type: 'highlights', id: matchId },
            300
         );
         return data.data ?? null;
      } catch (err) {
         if (err instanceof SportSrcError && err.code === 'NOT_FOUND')
            return null;
         throw err;
      }
   },

   /**
    * Account / quota status.
    */
   async getAccount(): Promise<any> {
      return get<any>({ type: 'account' }, 0);
   },

   /**
    * Normalise a SportSRC status string to the internal MatchStatus enum.
    */
   normaliseStatus(status: string): 'LIVE' | 'UPCOMING' | 'FINISHED' {
      const s = status.toLowerCase();
      if (s === 'inprogress' || s === 'live') return 'LIVE';
      if (s === 'finished' || s === 'ft' || s === 'ended') return 'FINISHED';
      return 'UPCOMING';
   },
};
