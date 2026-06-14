import cron from 'node-cron';
import { config } from '../config/index.js';
import { cacheDel, cacheSet } from '../lib/redis.js';
import { FootballApiError } from '../services/footballApi.service.js';
import { matchService } from '../services/match.service.js';
import { SportSrcError } from '../services/sportSrc.service.js';
import {
   syncLiveFromSportSrc,
   syncUpcomingFromSportSrc,
} from '../services/sportSrcSync.service.js';
import { youtubeService } from '../services/youtube.service.js';

let isLiveSyncing = false;
let isUpcomingSyncing = false;

export function startSyncCron() {
   // if (!config.isProduction) return;
   console.log('[cron:sync] Initializing cron jobs...');

   // ── Live sync: runs immediately on boot, then every 5 min ─────────────────
   runLiveSync('initial');
   cron.schedule('*/5 * * * *', () => {
      runLiveSync('cron');
   });

   // ── Upcoming sync: runs immediately on boot, then every 6 hours ───────────
   // Upcoming schedules are published daily; hourly polling is wasteful.
   // We sync today + next 2 days so the DB always has a 3-day horizon.
   if (config.footballDataProvider === 'sportsrc') {
      runUpcomingSync('initial');
      // At 00:05, 06:05, 12:05, 18:05 UTC
      cron.schedule('5 0,6,12,18 * * *', () => {
         runUpcomingSync('cron');
      });
   }

   // ── YouTube stream refresh (legacy — only when NOT using SportSRC) ─────────
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
      `[cron:sync] Scheduled (provider: ${config.footballDataProvider})`
   );
}

// ─── Live sync ────────────────────────────────────────────────────────────────

async function runLiveSync(source: string) {
   if (isLiveSyncing) {
      console.log(`[cron:sync:live] ${source} → Already running, skipping`);
      return;
   }

   isLiveSyncing = true;
   const startTime = Date.now();

   try {
      console.log(
         `[cron:sync:live] ${source} → Starting (${config.footballDataProvider})...`
      );

      let ids: string[];
      if (config.footballDataProvider === 'sportsrc') {
         ids = await syncLiveFromSportSrc();
      } else {
         ids = await matchService.syncLiveFromApi();
      }

      const duration = Date.now() - startTime;
      await cacheDel('api-football:last-error');
      await cacheDel('sportsrc:last-error');

      console.log(
         ids.length > 0
            ? `[cron:sync:live] ${source} ✓ ${ids.length} live matches synced (${duration}ms)`
            : `[cron:sync:live] ${source} ✓ No live matches right now (${duration}ms)`
      );
   } catch (err) {
      if (err instanceof FootballApiError) {
         console.error(
            `[cron:sync:live] ${source} ✗ api-football [${err.code}]:`,
            err.message
         );
         await cacheSet(
            'api-football:last-error',
            { code: err.code, message: err.message },
            60 * 10
         );
      } else if (err instanceof SportSrcError) {
         console.error(
            `[cron:sync:live] ${source} ✗ SportSRC [${err.code}]:`,
            err.message
         );
         await cacheSet(
            'sportsrc:last-error',
            { code: err.code, message: err.message },
            60 * 10
         );
      } else {
         console.error(`[cron:sync:live] ${source} ✗ Failed:`, err);
      }
   } finally {
      isLiveSyncing = false;
   }
}

// ─── Upcoming sync ────────────────────────────────────────────────────────────

async function runUpcomingSync(source: string) {
   if (isUpcomingSyncing) {
      console.log(`[cron:sync:upcoming] ${source} → Already running, skipping`);
      return;
   }

   isUpcomingSyncing = true;
   const startTime = Date.now();

   try {
      console.log(`[cron:sync:upcoming] ${source} → Starting...`);
      const ids = await syncUpcomingFromSportSrc(2); // today + 2 days ahead
      const duration = Date.now() - startTime;
      console.log(
         `[cron:sync:upcoming] ${source} ✓ ${ids.length} upcoming matches upserted (${duration}ms)`
      );
   } catch (err) {
      if (err instanceof SportSrcError) {
         console.error(
            `[cron:sync:upcoming] ${source} ✗ SportSRC [${err.code}]:`,
            err.message
         );
      } else {
         console.error(`[cron:sync:upcoming] ${source} ✗ Failed:`, err);
      }
   } finally {
      isUpcomingSyncing = false;
   }
}
