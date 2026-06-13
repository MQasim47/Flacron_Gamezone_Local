// web/features/admin-streams/api/streamsApi.ts
import { apiGet, apiPut, apiPost, apiDelete } from '@/shared/api/client';
import type { AdminStream, AdminMatch } from '@/shared/types';

export type StreamMatch = AdminMatch;

export const getStreams = () => apiGet<AdminStream[]>('/api/admin/streams');

export const getMatchesForStreams = (page = 1, limit = 50, status?: string) => {
   const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
   });
   if (status) params.set('status', status);
   return apiGet<{ matches: AdminMatch[]; pagination: { total: number } }>(
      `/api/admin/matches?${params}`
   ).then((r) => ({ matches: r.matches, total: r.pagination.total }));
};

export const upsertStream = (data: {
   matchId: string;
   type: 'EMBED' | 'NONE';
   provider?: string | null;
   url?: string | null;
   youtubeVideoId?: string | null;
   isActive?: boolean;
}) => apiPost<AdminStream>('/api/admin/streams', data);

export const updateStream = (
   matchId: string,
   data: Partial<{
      type: 'EMBED' | 'NONE';
      provider: string | null;
      url: string | null;
      isActive: boolean;
      youtubeVideoId: string | null;
   }>
) => apiPut<AdminStream>(`/api/admin/streams/${matchId}`, data);

export const deleteStream = (matchId: string) =>
   apiDelete(`/api/admin/streams/${matchId}`);

export const triggerYoutubeSearch = (matchId: string) =>
   apiPost<{ found: boolean; stream: AdminStream | null }>(
      `/api/admin/streams/${matchId}/youtube-search`,
      {}
   );

export const triggerBulkYoutubeSearch = () =>
   apiPost<{ success: boolean; searched: number; message: string }>(
      '/api/admin/streams/bulk-youtube-search',
      {}
   );
