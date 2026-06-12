import { sportSrcService, SportSrcError } from './sportSrc.service.js';
import { leagueRepository } from '../repositories/league.repository.js';
import { teamRepository } from '../repositories/team.repository.js';
import { matchRepository } from '../repositories/match.repository.js';
import { streamRepository } from '../repositories/stream.repository.js';
import { cacheSet, cacheDel } from '../lib/redis.js';
import { upsertSportSrcStream } from './sportSrcStream.helper.js';

export async function syncLiveFromSportSrc(): Promise<string[]> {
   let fixtures;
   try {
      fixtures = await sportSrcService.getMatches('inprogress');
   } catch (err) {
      if (err instanceof SportSrcError) {
         await cacheSet(
            'sportsrc:last-error',
            { code: err.code, message: err.message },
            60 * 10
         );
         throw err;
      }
      throw err;
   }

   console.log(`[sportSrcSync] Live fixtures from API: ${fixtures.length}`);

   if (fixtures.length === 0) {
      console.warn(
         '[sportSrcSync] API returned 0 fixtures — skipping stale wipe'
      );
      return [];
   }

   await cacheDel('sportsrc:last-error');

   const liveMatchIds: string[] = [];
   const activeSlugs: string[] = [];

   for (const fixture of fixtures) {
      try {
         const slug = fixture.id;
         if (!slug) continue;
         activeSlugs.push(slug);

         // ── Upsert league ──────────────────────────────────────────────────
         const leagueApiId = fixture.league_id
            ? Number(fixture.league_id)
            : null;

         const league = leagueApiId
            ? await leagueRepository.upsertByApiId({
                 apiLeagueId: leagueApiId,
                 name: fixture.league ?? 'Unknown',
                 country: fixture.country ?? null,
                 logo: null,
              })
            : null;

         // ── Upsert teams by name ───────────────────────────────────────────
         const homeTeam = await upsertTeamByName(
            fixture.home_team,
            league?.id ?? null
         );
         const awayTeam = await upsertTeamByName(
            fixture.away_team,
            league?.id ?? null
         );

         if (!homeTeam || !awayTeam) continue;

         const homeScore = fixture.home_score ?? 0;
         const awayScore = fixture.away_score ?? 0;

         // ── Upsert match by slug (clean — no hash needed anymore) ─────────
         const match = await matchRepository.upsertBySlug(
            slug,
            {
               leagueId: league?.id ?? null,
               homeTeamId: homeTeam.id,
               awayTeamId: awayTeam.id,
               kickoffTime: new Date(fixture.kickoff),
               status: 'LIVE',
               score: `${homeScore}-${awayScore}`,
               venue: fixture.venue ?? null,
            },
            {
               status: 'LIVE',
               score: `${homeScore}-${awayScore}`,
            }
         );

         if (!match?.id) continue;
         liveMatchIds.push(match.id);

         // ── Pull stream URLs from detail endpoint ─────────────────────────
         if (fixture.has_stream !== false) {
            saveStreamFromDetail(match.id, slug).catch((err) =>
               console.error(
                  `[sportSrcSync] Stream fetch failed for ${slug}:`,
                  err
               )
            );
         }
      } catch (err) {
         console.error(
            `[sportSrcSync] Error processing fixture ${fixture.id}:`,
            err
         );
      }
   }

   console.log(`[sportSrcSync] Synced ${liveMatchIds.length} live matches`);

   // ── Mark stale live matches as FINISHED ───────────────────────────────────
   if (activeSlugs.length > 0) {
      const result =
         await matchRepository.markStaleLiveAsFinishedBySlugs(activeSlugs);
      console.log(
         `[sportSrcSync] Marked ${result.count} stale LIVE matches as FINISHED`
      );
   }

   return liveMatchIds;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function upsertTeamByName(name: string, leagueId: string | null) {
   const existing = await teamRepository.findFirst({
      name,
      ...(leagueId && { leagueId }),
   });
   if (existing) return existing;
   return teamRepository.create({ name, leagueId, logo: null });
}

async function saveStreamFromDetail(
   dbMatchId: string,
   sportSrcMatchId: string
) {
   const detail = await sportSrcService.getDetail(sportSrcMatchId);
   if (!detail) return;

   const sourceCount = (await upsertSportSrcStream(dbMatchId, detail)) ?? 0;

   console.log(
      `[sportSrcSync] Saved ${sourceCount} stream source(s) for match ${dbMatchId}`
   );
}
