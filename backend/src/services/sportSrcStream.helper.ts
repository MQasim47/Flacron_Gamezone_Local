import { streamRepository } from '../repositories/stream.repository.js';
import type { SportSrcDetail } from './sportSrc.service.js';

export async function upsertSportSrcStream(
   dbMatchId: string,
   detail: SportSrcDetail
) {
   // New shape: sources[] array with embedUrl
   const sourcesFromArray = (detail.sources ?? [])
      .map((s) => s.embedUrl)
      .filter(Boolean);

   // Legacy flat shape: stream_url, stream_url_2, stream_url_3
   const sourcesFromFlat = [
      detail.stream_url,
      detail.stream_url_2,
      detail.stream_url_3,
   ].filter(Boolean) as string[];

   const sources = sourcesFromArray.length ? sourcesFromArray : sourcesFromFlat;
   const primaryUrl = sources[0] ?? null;

   if (!primaryUrl) {
      await streamRepository.markNoStream(dbMatchId);
      return 0;
   }

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
