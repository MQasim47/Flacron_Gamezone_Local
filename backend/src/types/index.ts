import type { Request } from 'express';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
   userId: string;
   role: 'USER' | 'ADMIN';
}

export interface AuthenticatedUser {
   id: string;
   email: string;
   role: 'USER' | 'ADMIN';
   subscription?: SubscriptionRecord | null;
}

export interface AuthRequest extends Request {
   user?: AuthenticatedUser;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface SubscriptionRecord {
   id: string;
   status: string;
   plan: string | null;
   stripeCustomerId: string | null;
   stripeSubscriptionId: string | null;
   currentPeriodStart: Date | null;
   currentPeriodEnd: Date | null;
   cancelAtPeriodEnd: boolean;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface MatchContext {
   homeTeam: { name: string; logo: string | null };
   awayTeam: { name: string; logo: string | null };
   league: { name: string; country: string | null } | null;
   kickoffTime: Date;
   venue: string | null;
   status: string;
   score: string | null;
}

export type AILanguage = 'en' | 'fr';
export type AIKind = 'preview' | 'summary';

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
   page: number;
   limit: number;
}

export interface PaginatedResult<T> {
   data: T[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
   };
}

// ─── SportSRC Deep Data ───────────────────────────────────────────────────────

export interface DeepMatchData {
   matchId: string;
   slug: string | null;
}

export interface StreamSourcesPayload {
   primary: string;
   sources: string[]; // all redundant sources including primary
}

export interface LineupsPayload {
   home: {
      formation?: string;
      players: PlayerEntry[];
   };
   away: {
      formation?: string;
      players: PlayerEntry[];
   };
}

export interface PlayerEntry {
   id?: string | number;
   name: string;
   number?: number;
   position?: string;
   photo?: string;
   isSub?: boolean;
}

export interface StatsPayload {
   home: StatBlock;
   away: StatBlock;
}

export interface StatBlock {
   shots?: number;
   shots_on_target?: number;
   possession?: number;
   xg?: number;
   corners?: number;
   fouls?: number;
   yellow_cards?: number;
   red_cards?: number;
   [key: string]: number | string | undefined;
}

export interface IncidentEntry {
   time?: number;
   type?: string; // "goal" | "yellow_card" | "red_card" | "sub"
   team?: string;
   player?: string;
   assist?: string;
   detail?: string;
}

export interface ShotEntry {
   x?: number;
   y?: number;
   z?: number;
   xg?: number;
   xgot?: number;
   player?: string;
   team?: string;
   result?: string; // "goal" | "saved" | "blocked" | "missed"
   blocked_x?: number;
   blocked_y?: number;
}

export interface OddsPayload {
   bookmaker?: string;
   home_win?: { decimal: number; fractional: string };
   draw?: { decimal: number; fractional: string };
   away_win?: { decimal: number; fractional: string };
   [key: string]: unknown;
}

export interface VotesPayload {
   home_win_pct?: number;
   draw_pct?: number;
   away_win_pct?: number;
   btts_yes_pct?: number;
   btts_no_pct?: number;
   total_votes?: number;
}

export interface H2HPayload {
   home_team_wins?: number;
   away_team_wins?: number;
   draws?: number;
   recent_matches?: any[];
}

export interface StandingEntry {
   position?: number;
   team?: string;
   team_logo?: string;
   played?: number;
   won?: number;
   drawn?: number;
   lost?: number;
   goals_for?: number;
   goals_against?: number;
   goal_difference?: number;
   points?: number;
}
