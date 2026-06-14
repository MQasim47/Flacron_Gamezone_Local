import { cacheDel, cacheSet } from '../lib/redis.js';
import { leagueRepository } from '../repositories/league.repository.js';
import { matchRepository } from '../repositories/match.repository.js';
import { teamRepository } from '../repositories/team.repository.js';
import { venueRepository } from '../repositories/venue.repository.js';
import { SportSrcError, sportSrcService } from './sportSrc.service.js';
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
         if (!slug) {
            console.warn(
               '[sportSrcSync] Skipping fixture: missing id',
               fixture
            );
            continue;
         }

         activeSlugs.push(slug);

         // ── Upsert league ──────────────────────────────────────────────────
         const leagueApiId = fixture.league_id
            ? Number(fixture.league_id)
            : null;

         let league = null;

         if (leagueApiId) {
            league = await leagueRepository.upsertByApiId({
               apiLeagueId: leagueApiId,
               name: fixture.league ?? 'Unknown',
               country: fixture.country ?? null,
               logo: fixture.league_logo ?? null,
            });
         } else if (fixture.league) {
            // No numeric ID — find by name or create
            league = await leagueRepository.findFirst({ name: fixture.league });
            if (!league) {
               try {
                  league = await leagueRepository.create({
                     name: fixture.league,
                     country: fixture.country ?? null,
                     logo: fixture.league_logo ?? null,
                     apiLeagueId: null,
                  });
               } catch {
                  // Another process may have created it — try finding again
                  league = await leagueRepository.findFirst({
                     name: fixture.league,
                  });
               }
            } else {
               // Update logo/country if missing
               if (
                  (!league.logo && fixture.league_logo) ||
                  (!league.country && fixture.country)
               ) {
                  league = await leagueRepository.update(league.id, {
                     country: league.country ?? fixture.country ?? null,
                     logo: league.logo ?? fixture.league_logo ?? null,
                  });
               }
            }
         }

         const homeTeam = await upsertTeamByName(
            fixture.home_team,
            league?.id ?? null,
            (fixture as any).home_team_logo ?? null
         );
         if (!homeTeam) {
            console.warn(
               '[sportSrcSync] Skipping fixture: home team not saved',
               { slug, homeTeam: fixture.home_team }
            );
            continue;
         }

         const awayTeam = await upsertTeamByName(
            fixture.away_team,
            league?.id ?? null,
            (fixture as any).away_team_logo ?? null
         );
         if (!awayTeam) {
            console.warn(
               '[sportSrcSync] Skipping fixture: away team not saved',
               { slug, awayTeam: fixture.away_team }
            );
            continue;
         }

         const homeScore = fixture.home_score ?? 0;
         const awayScore = fixture.away_score ?? 0;

         // ── Upsert match by slug ───────────────────────────────────────────
         const match = await matchRepository.upsertBySlug(
            slug,
            {
               leagueId: league?.id ?? null,
               homeTeamId: homeTeam.id,
               awayTeamId: awayTeam.id,
               kickoffTime: new Date(fixture.kickoff),
               status: 'LIVE',
               score: `${homeScore}-${awayScore}`,
            },
            {
               status: 'LIVE',
               score: `${homeScore}-${awayScore}`,
            }
         );

         if (!match?.id) {
            console.warn(
               '[sportSrcSync] Skipping fixture: match upsert returned null',
               { slug }
            );
            continue;
         }

         liveMatchIds.push(match.id);

         // ── Pull stream URLs and venue from detail endpoint ────────────────
         // Always fetch detail to get venue + stream sources
         saveStreamFromDetail(match.id, slug).catch((err) =>
            console.error(
               `[sportSrcSync] Stream fetch failed for ${slug}:`,
               err
            )
         );
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

async function upsertTeamByName(
   name: string,
   leagueId: string | null,
   logo?: string | null
) {
   const existing = await teamRepository.findFirst({
      name,
      ...(leagueId && { leagueId }),
   });
   if (existing) {
      // Backfill logo if missing
      if (!existing.logo && logo) {
         return teamRepository.update(existing.id, { logo });
      }
      return existing;
   }
   return teamRepository.create({ name, leagueId, logo: logo ?? null });
}

async function saveStreamFromDetail(
   dbMatchId: string,
   sportSrcMatchId: string
) {
   const detail = await sportSrcService.getDetail(sportSrcMatchId);
   if (!detail) return;

   // Upsert venue if present
   if (detail.venue) {
      let venueId: string | null = null;

      if (typeof detail.venue === 'string') {
         // Plain string — just store the name
         const venue = await venueRepository.upsertByNameAndCity({
            name: detail.venue,
         });
         venueId = venue.id;
      } else {
         // Rich object from SportSRC
         const v = detail.venue as any;
         const venue = await venueRepository.upsertByNameAndCity({
            name: v.stadium ?? 'Unknown',
            city: v.city ?? null,
            country: v.country ?? null,
            image: v.image ?? null,
            capacity: v.capacity ?? null,
            lat: v.coordinates?.lat ?? null,
            lng: v.coordinates?.lng ?? null,
         });
         venueId = venue.id;
      }

      await matchRepository.update(dbMatchId, { venueId });
   }

   const sourceCount = (await upsertSportSrcStream(dbMatchId, detail)) ?? 0;

   console.log(
      `[sportSrcSync] Saved ${sourceCount} stream source(s) for match ${dbMatchId}`
   );
}

/**
 * Syncs upcoming matches from SportSRC for today + the next `daysAhead` days.
 * Called once or twice daily — upcoming schedules don't need minute-level polling.
 */
export async function syncUpcomingFromSportSrc(
   daysAhead = 2
): Promise<string[]> {
   const dates: string[] = [];
   for (let i = 0; i <= daysAhead; i++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + i);
      dates.push(d.toISOString().split('T')[0]);
   }

   const allMatchIds: string[] = [];

   for (const date of dates) {
      let fixtures;
      try {
         fixtures = await sportSrcService.getMatches('notstarted', date);
      } catch (err) {
         console.error(`[sportSrcSync:upcoming] Failed to fetch ${date}:`, err);
         continue;
      }

      console.log(
         `[sportSrcSync:upcoming] ${date} → ${fixtures.length} upcoming fixtures`
      );

      for (const fixture of fixtures) {
         try {
            const slug = fixture.id;
            if (!slug) continue;

            // ── Upsert league ──────────────────────────────────────────────
            const leagueApiId = fixture.league_id
               ? Number(fixture.league_id)
               : null;
            let league = null;

            if (leagueApiId) {
               league = await leagueRepository.upsertByApiId({
                  apiLeagueId: leagueApiId,
                  name: fixture.league ?? 'Unknown',
                  country: fixture.country ?? null,
                  logo: fixture.league_logo ?? null,
               });
            } else if (fixture.league) {
               league = await leagueRepository.findFirst({
                  name: fixture.league,
               });
               if (!league) {
                  try {
                     league = await leagueRepository.create({
                        name: fixture.league,
                        country: fixture.country ?? null,
                        logo: fixture.league_logo ?? null,
                        apiLeagueId: null,
                     });
                  } catch {
                     league = await leagueRepository.findFirst({
                        name: fixture.league,
                     });
                  }
               }
            }

            // ── Upsert teams ───────────────────────────────────────────────
            const homeTeam = await upsertTeamByName(
               fixture.home_team,
               league?.id ?? null,
               (fixture as any).home_team_logo ?? null
            );
            if (!homeTeam) continue;

            const awayTeam = await upsertTeamByName(
               fixture.away_team,
               league?.id ?? null,
               (fixture as any).away_team_logo ?? null
            );
            if (!awayTeam) continue;

            // ── Upsert match — only create/update if still UPCOMING ────────
            // upsertBySlug uses WHERE apiMatchSlug = slug, so it won't
            // overwrite a match that has already transitioned to LIVE/FINISHED.
            const match = await matchRepository.upsertBySlug(
               slug,
               {
                  leagueId: league?.id ?? null,
                  homeTeamId: homeTeam.id,
                  awayTeamId: awayTeam.id,
                  kickoffTime: new Date(fixture.kickoff),
                  status: 'UPCOMING',
                  score: null,
               },
               {
                  // Only update fields that can legitimately change pre-match.
                  // Crucially, do NOT update status here — a match already
                  // transitioned to LIVE by the live sync must stay LIVE.
                  kickoffTime: new Date(fixture.kickoff),
               }
            );

            if (match?.id) allMatchIds.push(match.id);
         } catch (err) {
            console.error(
               `[sportSrcSync:upcoming] Error processing fixture ${fixture.id}:`,
               err
            );
         }
      }
   }

   console.log(
      `[sportSrcSync:upcoming] Total upserted: ${allMatchIds.length} upcoming matches`
   );
   return allMatchIds;
}
