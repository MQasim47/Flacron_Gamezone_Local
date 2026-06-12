import { streamRepository } from '../repositories/stream.repository.js';
import type { SportSrcDetail } from './sportSrc.service.js';

export async function upsertSportSrcStream(
   dbMatchId: string,
   detail: SportSrcDetail
) {
   const primaryUrl = detail.stream_url;

   if (!primaryUrl) {
      await streamRepository.markNoStream(dbMatchId);
      return 0;
   }

   const sources = [
      detail.stream_url,
      detail.stream_url_2,
      detail.stream_url_3,
   ].filter(Boolean) as string[];

   const streamData = {
      type: 'EMBED' as const,
      provider: 'sportsrc',
      url: primaryUrl,
      isActive: true,
      youtubeVideoId: null,
      streamTitle: `${detail.home_team} vs ${detail.away_team}`,
      streamSources: JSON.stringify(sources),
   };

   await streamRepository.upsert(dbMatchId, streamData, {
      ...streamData,
      lastCheckedAt: new Date(),
   });

   return sources.length;
}
