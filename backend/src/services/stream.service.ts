import { streamRepository } from '../repositories/stream.repository.js';
import { matchRepository } from '../repositories/match.repository.js';
import { youtubeService } from './youtube.service.js';
import { sportSrcService } from './sportSrc.service.js';
import { config } from '../config/index.js';
import { upsertSportSrcStream } from './sportSrcStream.helper.js';

export const streamService = {
   getActiveStreams() {
      return streamRepository.findActiveStreams();
   },

   async getStreamStatus(matchId: string) {
      const match = await matchRepository.findByIdWithTeams(matchId);
      if (!match) throw Object.assign(new Error('Not found'), { status: 404 });

      // If we already have an active stream, return it with all sources
      if (match.stream?.isActive && match.stream?.url) {
         const sources = parseStreamSources(
            (match.stream as any).streamSources
         );
         return {
            found: true,
            stream: {
               url: match.stream.url,
               youtubeVideoId: (match.stream as any).youtubeVideoId,
               streamTitle: (match.stream as any).streamTitle,
               sources, // redundant sources for frontend switcher
            },
         };
      }

      // No active stream — try to find one for live matches
      if (match.status === 'LIVE') {
         if (
            config.footballDataProvider === 'sportsrc' &&
            (match as any).apiMatchSlug
         ) {
            // SportSRC path: fetch detail endpoint for embed URLs
            findAndSaveSportSrcStream(
               match.id,
               (match as any).apiMatchSlug
            ).catch(console.error);
         } else {
            // Fallback: YouTube search
            youtubeService
               .findAndSaveStreamForMatch(match.id)
               .catch(console.error);
         }
      }

      return { found: false };
   },

   upsert(data: {
      matchId: string;
      type: 'EMBED' | 'NONE';
      provider?: string | null;
      url?: string | null;
      youtubeVideoId?: string | null;
      isActive?: boolean;
   }) {
      const resolvedUrl = data.youtubeVideoId
         ? `https://www.youtube.com/embed/${data.youtubeVideoId}?autoplay=1&rel=0`
         : (data.url ?? null);

      return streamRepository.upsert(
         data.matchId,
         {
            type: data.type,
            provider: data.provider ?? (data.youtubeVideoId ? 'youtube' : null),
            url: resolvedUrl,
            isActive: data.isActive ?? data.type === 'EMBED',
            youtubeVideoId: data.youtubeVideoId ?? null,
         },
         {
            type: data.type,
            provider: data.provider ?? (data.youtubeVideoId ? 'youtube' : null),
            url: resolvedUrl,
            isActive: data.isActive ?? data.type === 'EMBED',
            youtubeVideoId: data.youtubeVideoId ?? null,
            lastCheckedAt: new Date(),
         }
      );
   },

   findStreamForMatch(matchId: string) {
      // Admin-triggered manual search — respects active provider
      if (config.footballDataProvider === 'sportsrc') {
         return findAndSaveSportSrcStreamById(matchId);
      }
      return youtubeService.findAndSaveStreamForMatch(matchId);
   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseStreamSources(raw: string | null | undefined): string[] {
   if (!raw) return [];
   try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
   } catch {
      return [];
   }
}

async function findAndSaveSportSrcStream(
   dbMatchId: string,
   slug: string
): Promise<void> {
   const detail = await sportSrcService.getDetail(slug);
   if (!detail) return;

   await upsertSportSrcStream(dbMatchId, detail);
}

async function findAndSaveSportSrcStreamById(dbMatchId: string): Promise<any> {
   const match = await matchRepository.findByIdWithTeams(dbMatchId);
   if (!match) return null;

   const slug = (match as any).apiMatchSlug;
   if (!slug) {
      // No slug — fall back to YouTube
      return youtubeService.findAndSaveStreamForMatch(dbMatchId);
   }

   await findAndSaveSportSrcStream(dbMatchId, slug);
   return streamRepository.findByMatchId(dbMatchId);
}
