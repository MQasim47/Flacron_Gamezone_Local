import { apiGet } from './client';

export const getMatchLineups = (matchId: string) =>
   apiGet<{ success: boolean; lineups: any }>(`/api/deep/${matchId}/lineups`);

export const getMatchStats = (matchId: string) =>
   apiGet<{ success: boolean; stats: any }>(`/api/deep/${matchId}/stats`);

export const getMatchIncidents = (matchId: string) =>
   apiGet<{ success: boolean; incidents: any[] }>(
      `/api/deep/${matchId}/incidents`
   );

export const getMatchShotmap = (matchId: string) =>
   apiGet<{ success: boolean; shotmap: any[] }>(`/api/deep/${matchId}/shotmap`);

export const getMatchOdds = (matchId: string) =>
   apiGet<{ success: boolean; odds: any }>(`/api/deep/${matchId}/odds`);

export const getMatchVotes = (matchId: string) =>
   apiGet<{ success: boolean; votes: any }>(`/api/deep/${matchId}/votes`);

export const getMatchH2H = (matchId: string) =>
   apiGet<{ success: boolean; h2h: any }>(`/api/deep/${matchId}/h2h`);

export const getMatchLastMatches = (matchId: string) =>
   apiGet<{ success: boolean; lastMatches: any }>(
      `/api/deep/${matchId}/last-matches`
   );

export const getAllDeepData = (matchId: string) =>
   apiGet<{
      success: boolean;
      slug: string | null;
      lineups: any;
      stats: any;
      incidents: any[];
      odds: any;
      votes: any;
      h2h: any;
      lastMatches: any;
      graph: any;
   }>(`/api/deep/${matchId}/all`);
