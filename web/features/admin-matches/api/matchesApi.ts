import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/api/client';
import type { AdminMatch } from '@/shared/types';

export const getAdminMatches = (
   page = 1,
   limit = 10,
   status?: string,
   leagueId?: string
) => {
   const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
   });
   if (status) params.set('status', status);
   if (leagueId) params.set('leagueId', leagueId);
   return apiGet<{ matches: AdminMatch[]; pagination: { total: number } }>(
      `/api/admin/matches?${params}`
   ).then((r) => ({ matches: r.matches, total: r.pagination.total }));
};

export const createMatch = (data: {
   homeTeamId: string;
   awayTeamId: string;
   leagueId?: string;
   kickoffTime: string;
}) => apiPost<AdminMatch>('/api/admin/matches', data);

export const updateMatch = (
   id: string,
   data: Partial<{
      kickoffTime: string;
      status: string;
      score: string;
      leagueId: string;
   }>
) => apiPut<AdminMatch>(`/api/admin/matches/${id}`, data);

export const deleteMatch = (id: string) =>
   apiDelete(`/api/admin/matches/${id}`);

export const syncLiveMatches = () =>
   apiPost<{ success: boolean; synced: number; live: number }>(
      '/api/admin/matches/sync-live',
      {}
   );

export const generateMatchAI = (id: string) =>
   apiPost('/api/admin/ai/summary', { matchId: id, language: 'en' });

export const getMatchesFromApi = (params: {
   leagueId?: string;
   date?: string;
   status?: string;
   page?: number;
   limit?: number;
}) => {
   const p = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 100),
   });
   if (params.leagueId) p.set('leagueId', params.leagueId);
   if (params.date) p.set('date', params.date);
   if (params.status) p.set('status', params.status);
   return apiGet<{
      success: boolean;
      matches: any[];
      pagination?: { total: number; hasMore: boolean };
   }>(`/api/admin/matches/api?${p}`);
};
