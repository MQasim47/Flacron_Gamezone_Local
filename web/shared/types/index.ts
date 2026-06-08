// ─── Core Domain Types ─────────────────────────────────────────────────────

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
  logo: string | null;
  apiLeagueId?: number | null;
}

export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED";

export interface StreamData {
  id?: string;
  matchId?: string;
  type: "EMBED" | "NONE";
  provider: string | null;
  url: string | null;
  isActive: boolean;
  youtubeVideoId?: string | null;
  streamTitle?: string | null;
  lastCheckedAt?: string | null;
}

export interface AISummary {
  id: string;
  matchId: string;
  provider: string;
  language: string;
  kind: "preview" | "summary";
  content: string;
  createdAt: string;
}

export interface Match {
  id: string;
  apiFixtureId?: number | null;
  leagueId?: string | null;
  homeTeamId?: string;
  awayTeamId?: string;
  kickoffTime: string;
  status: MatchStatus;
  score: string | null;
  venue: string | null;
  league?: LeagueRef | null;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  stream?: StreamData | null;
  aiTexts?: AISummary[];
}

export interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string | null;
  apiLeagueId?: number | null;
}

export interface Team {
  id: string;
  name: string;
  logo: string | null;
  apiTeamId: number | null;
  leagueId?: string | null;
  league?: { id: string; name: string; country: string | null } | null;
  matches?: number;
  wins?: number;
}

// ─── Auth Types ───────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN";

export interface UserSubscription {
  id: string;
  status: string;
  plan: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string | number;
  email: string;
  role: UserRole;
  subscription?: UserSubscription | null;
}

// ─── API Response Types ───────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface LiveMatchesResponse {
  matches: Match[];
  apiError: ApiError | null;
}

export interface SearchResults {
  leagues: League[];
  teams: Team[];
  matches: Match[];
}

// ─── Admin Types ──────────────────────────────────────────────────────────

export interface AdminMatch extends Match {
  stream: StreamData | null;
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  subscription?: {
    id: string;
    status: string;
    plan: string | null;
    stripeSubscriptionId: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
  } | null;
}

export interface AdminStream {
  id?: string;
  matchId?: string;
  type: "EMBED" | "NONE";
  provider: string | null;
  url: string | null;
  isActive: boolean;
  youtubeVideoId?: string | null;
  streamTitle?: string | null;
  match?: {
    id: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    kickoffTime: string;
    status: string;
  };
}

// ─── Standing Types ───────────────────────────────────────────────────────

export interface StandingEntry {
  team: TeamRef;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeagueDetails {
  league: League;
  standings: StandingEntry[];
  upcomingMatches: Match[];
  recentMatches: Match[];
}

export interface TeamDetails extends Team {
  homeMatches: Match[];
  awayMatches: Match[];
}

// ─── Subscription Types ───────────────────────────────────────────────────

export interface SubscriptionInfo {
  status: string;
  plan: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

// ─── UI Helper Types ──────────────────────────────────────────────────────

export type AlertType = "success" | "error" | "info";

export interface AlertMessage {
  text: string;
  type: AlertType;
}

export type MatchResult = "W" | "D" | "L";
export type AILanguage = "en" | "fr";