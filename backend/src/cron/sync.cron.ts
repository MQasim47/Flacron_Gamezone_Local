import cron from 'node-cron';
import { config } from '../config/index.js';
import { cacheDel, cacheSet } from '../lib/redis.js';
import { FootballApiError } from '../services/footballApi.service.js';
import { matchService } from '../services/match.service.js';
import { SportSrcError } from '../services/sportSrc.service.js';
import { syncLiveFromSportSrc } from '../services/sportSrcSync.service.js';
import { youtubeService } from '../services/youtube.service.js';

let isLiveSyncing = false;

export function startSyncCron() {
   // if (!config.isProduction) return;
   console.log('[cron:sync] Initializing cron jobs...');

   runLiveSync('initial');

   cron.schedule('*/5 * * * *', () => {
      runLiveSync('cron');
   });

   // Only run YouTube refresh when SportSRC is NOT the provider
   // (SportSRC supplies embed URLs directly — no YouTube search needed)
   if (config.footballDataProvider !== 'sportsrc') {
      cron.schedule('*/6 * * * *', async () => {
         try {
            await youtubeService.refreshAllLiveStreams();
            console.log('[cron:youtube] ✓ Live streams refreshed');
         } catch (err) {
            console.error('[cron:youtube] ✗ Error refreshing streams:', err);
         }
      });
   }

   console.log(
      `[cron:sync] Scheduled (provider: ${config.footballDataProvider}, every 5 min)`
   );
}

async function runLiveSync(source: string) {
   if (isLiveSyncing) {
      console.log(`[cron:sync] ${source} → Already running, skipping`);
      return;
   }

   isLiveSyncing = true;
   const startTime = Date.now();

   try {
      console.log(
         `[cron:sync] ${source} → Starting live sync (${config.footballDataProvider})...`
      );

      let ids: string[];

      if (config.footballDataProvider === 'sportsrc') {
         ids = await syncLiveFromSportSrc();
      } else {
         ids = await matchService.syncLiveFromApi();
      }

      const duration = Date.now() - startTime;

      // Clear provider-specific error key on success
      await cacheDel('api-football:last-error');
      await cacheDel('sportsrc:last-error');

      console.log(
         ids.length > 0
            ? `[cron:sync] ${source} ✓ ${ids.length} live matches synced (${duration}ms)`
            : `[cron:sync] ${source} ✓ No live matches right now (${duration}ms)`
      );
   } catch (err) {
      if (err instanceof FootballApiError) {
         console.error(
            `[cron:sync] ${source} ✗ api-football [${err.code}]:`,
            err.message
         );
         await cacheSet(
            'api-football:last-error',
            { code: err.code, message: err.message },
            60 * 10
         );
      } else if (err instanceof SportSrcError) {
         console.error(
            `[cron:sync] ${source} ✗ SportSRC [${err.code}]:`,
            err.message
         );
         await cacheSet(
            'sportsrc:last-error',
            { code: err.code, message: err.message },
            60 * 10
         );
      } else {
         console.error(`[cron:sync] ${source} ✗ Failed:`, err);
      }
   } finally {
      isLiveSyncing = false;
   }
}
