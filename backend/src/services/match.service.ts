import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { cacheGet, cacheSet } from '../lib/redis.js';
import { leagueRepository } from '../repositories/league.repository.js';
import { matchRepository } from '../repositories/match.repository.js';
import { teamRepository } from '../repositories/team.repository.js';
import type { PaginatedResult, PaginationParams } from '../types/index.js';
import { footballApiService } from './footballApi.service.js';

const MATCHES_CACHE_KEY = 'football:matches';
const MATCHES_TTL = 60 * 2;

export const matchService = {
   getAll(filters: {
      status?: 'LIVE' | 'UPCOMING' | 'FINISHED';
      leagueId?: string;
      teamId?: string;
      date?: string;
   }) {
      return matchRepository.findAll(filters);
   },

   getById(id: string) {
      return matchRepository.findById(id);
   },

   async getByIdForUser(id: string, authHeader?: string) {
      const match = await matchRepository.findById(id);
      if (!match) return null;

      const isPremium = await this._checkPremium(authHeader);
      return {
         ...match,
         stream: match.stream
            ? {
                 ...match.stream,
                 url: isPremium ? match.stream.url : null,
                 type: match.stream.type,
                 isActive: isPremium ? match.stream.isActive : false,
              }
            : null,
         aiTexts: isPremium ? (match as any).aiTexts : [],
      };
   },

   async _checkPremium(authHeader?: string): Promise<boolean> {
      if (!authHeader?.startsWith('Bearer ')) return false;
      try {
         const token = authHeader.slice(7);
         const decoded = jwt.verify(token, config.jwt.secret) as any;
         const { prisma } = await import('../lib/prisma.js');
         const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { subscription: true },
         });
         return (
            user?.role === 'ADMIN' || user?.subscription?.status === 'active'
         );
      } catch {
         return false;
      }
   },

   async getPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
      const [data, total] = await matchRepository.findPaginated(params);
      const skip = (params.page - 1) * params.limit;
      return {
         data,
         pagination: {
            page: params.page,
            limit: params.limit,
            total,
            hasMore: skip + data.length < total,
         },
      };
   },

   async create(data: {
      leagueId?: string | null;
      homeTeamId: string;
      awayTeamId: string;
      kickoffTime: string;
      status?: 'UPCOMING' | 'LIVE' | 'FINISHED';
      score?: string | null;
      venueId?: string | null;
      apiFixtureId?: number | null;
   }) {
      const existing = await matchRepository.findFirst(
         data.apiFixtureId
            ? { apiFixtureId: data.apiFixtureId }
            : {
                 homeTeamId: data.homeTeamId,
                 awayTeamId: data.awayTeamId,
                 kickoffTime: new Date(data.kickoffTime),
              }
      );
      if (existing)
         throw Object.assign(new Error('Match already added'), { status: 400 });

      return matchRepository.create({
         ...data,
         kickoffTime: new Date(data.kickoffTime),
         status: data.status ?? 'UPCOMING',
      });
   },

   async update(id: string, data: any) {
      return matchRepository.update(id, {
         ...('leagueId' in data ? { leagueId: data.leagueId ?? null } : {}),
         ...('homeTeamId' in data ? { homeTeamId: data.homeTeamId } : {}),
         ...('awayTeamId' in data ? { awayTeamId: data.awayTeamId } : {}),
         ...('kickoffTime' in data
            ? { kickoffTime: new Date(data.kickoffTime) }
            : {}),
         ...('status' in data ? { status: data.status } : {}),
         ...('score' in data ? { score: data.score ?? null } : {}),
         ...('venueId' in data ? { venueId: data.venueId ?? null } : {}),
         ...('apiFixtureId' in data
            ? { apiFixtureId: data.apiFixtureId ?? null }
            : {}),
      });
   },

   delete(id: string) {
      return matchRepository.delete(id);
   },

   async getLeagueDetails(leagueId: string) {
      const league = await leagueRepository.findById(leagueId);
      if (!league)
         throw Object.assign(new Error('League not found'), { status: 404 });

      const leagueMatches = matchRepository.findByLeague(leagueId);
      const allTeams = await teamRepository.findAll();
      const leagueTeams = allTeams.filter((t) => t.leagueId === leagueId);

      const [finishedMatches, upcomingMatches, recentMatches] =
         await Promise.all([
            leagueMatches.finished(),
            leagueMatches.upcoming(),
            leagueMatches.recent(),
         ]);

      const standings = this._calculateStandings(leagueTeams, finishedMatches);
      return { league, standings, upcomingMatches, recentMatches };
   },

   async getTeamDetails(teamId: string) {
      const team = await teamRepository.findById(teamId);
      if (!team)
         throw Object.assign(new Error('Team not found'), { status: 404 });

      const byTeam = matchRepository.findByTeam(teamId);
      const [homeMatches, awayMatches] = await Promise.all([
         byTeam.home(),
         byTeam.away(),
      ]);

      return { ...team, homeMatches, awayMatches };
   },

   _calculateStandings(teams: any[], finishedMatches: any[]) {
      const map = new Map<string, any>();
      teams.forEach((t) =>
         map.set(t.id, {
            team: t,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
         })
      );
      finishedMatches.forEach((m) => {
         if (!m.score) return;
         const [h, a] = m.score.split('-').map(Number);
         if (isNaN(h) || isNaN(a)) return;
         const home = map.get(m.homeTeamId);
         const away = map.get(m.awayTeamId);
         if (!home || !away) return;
         home.played++;
         away.played++;
         home.goalsFor += h;
         home.goalsAgainst += a;
         away.goalsFor += a;
         away.goalsAgainst += h;
         if (h > a) {
            home.won++;
            home.points += 3;
            away.lost++;
         } else if (a > h) {
            away.won++;
            away.points += 3;
            home.lost++;
         } else {
            home.drawn++;
            away.drawn++;
            home.points++;
            away.points++;
         }
         home.goalDifference = home.goalsFor - home.goalsAgainst;
         away.goalDifference = away.goalsFor - away.goalsAgainst;
      });
      return Array.from(map.values()).sort((a, b) => {
         if (b.points !== a.points) return b.points - a.points;
         if (b.goalDifference !== a.goalDifference)
            return b.goalDifference - a.goalDifference;
         return b.goalsFor - a.goalsFor;
      });
   },

   async fetchFromApi(params: {
      leagueId: string | null;
      date: string | null;
      status: string | null;
      page: number;
      limit: number;
   }) {
      if (!config.football.key)
         throw Object.assign(new Error('Football API key not configured'), {
            status: 500,
         });

      const { leagueId, date, status, page, limit } = params;
      const dateKey = date ?? 'no-date';
      const cacheKey = `${MATCHES_CACHE_KEY}:${leagueId ?? 'all'}:${dateKey}:${status ?? 'all'}`;

      const cached = await cacheGet<any[]>(cacheKey);
      if (cached) return this._paginate(cached, page, limit);

      const queryParams: any = {};

      if (leagueId) {
         queryParams.league = leagueId;
         queryParams.season = String(this._deriveSeason(date));
      }

      if (status === 'LIVE') {
         queryParams.live = 'all';
      } else {
         if (status)
            queryParams.status =
               { UPCOMING: 'NS', FINISHED: 'FT' }[status] ?? status;

         // KEY FIX: only add a date when the user explicitly chose one,
         // OR when there is no league filter (browsing all leagues for today).
         // Without this, picking a league + no date → "today only" → blank results.
         if (date) {
            queryParams.date = date;
         } else if (!leagueId) {
            queryParams.date = new Date().toISOString().split('T')[0];
         }
         // If leagueId is set and no date chosen, we let the API return the
         // full season fixtures for that league (filtered by season above).
      }

      const { data } = await axios.get(`${config.football.baseUrl}/fixtures`, {
         params: queryParams,
         headers: { 'x-apisports-key': config.football.key },
         timeout: 10_000,
      });

      if (!data?.response)
         throw Object.assign(new Error('Invalid response from Football API'), {
            status: 400,
         });

      const now = new Date();
      let matchesData = data.response.map((item: any) => {
         const hg = item.goals.home;
         const ag = item.goals.away;
         return {
            apiFixtureId: item.fixture.id,
            leagueId: item.league.id,
            leagueName: item.league.name,
            leagueLogo: item.league.logo,
            homeTeam: {
               id: item.teams.home.id,
               name: item.teams.home.name,
               logo: item.teams.home.logo,
            },
            awayTeam: {
               id: item.teams.away.id,
               name: item.teams.away.name,
               logo: item.teams.away.logo,
            },
            kickoffTime: item.fixture.date,
            status: item.fixture.status.short,
            score: hg === null || ag === null ? null : `${hg}-${ag}`,
            venue: item.fixture.venue?.name ?? null,
            round: item.league.round,
            isFuture: new Date(item.fixture.date) > now,
         };
      });

      if (status === 'UPCOMING') {
         matchesData = matchesData.filter(
            (m: any) => m.status === 'NS' && m.isFuture
         );
      }

      // Cache for 2 min when filtered, longer for league-wide results
      const ttl = leagueId && !date ? 60 * 10 : MATCHES_TTL;
      await cacheSet(cacheKey, matchesData, ttl);
      return this._paginate(matchesData, page, limit);
   },

   _deriveSeason(dateStr: string | null): number {
      if (!dateStr) {
         const today = new Date();
         return today.getMonth() >= 6
            ? today.getFullYear()
            : today.getFullYear() - 1;
      }
      const d = new Date(dateStr);
      return d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
   },

   _paginate<T>(arr: T[], page: number, limit: number) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return {
         data: arr.slice(startIndex, endIndex),
         pagination: {
            page,
            limit,
            total: arr.length,
            hasMore: endIndex < arr.length,
         },
      };
   },

   async search(query: string) {
      if (!query) return { leagues: [], teams: [], matches: [] };
      const lq = query.toLowerCase();
      const [allLeagues, teams, matches] = await Promise.all([
         leagueRepository.findAll(),
         teamRepository.findAll(query),
         matchRepository.search(query),
      ]);
      return {
         leagues: allLeagues
            .filter((l) => l.name.toLowerCase().includes(lq))
            .slice(0, 10),
         teams,
         matches,
      };
   },

   async syncLiveFromApi(): Promise<string[]> {
      const apiData = await footballApiService.getLiveFixturesCached();
      const fixtures = apiData?.response ?? [];

      console.log(
         `[syncLiveFromApi] Total fixtures from API: ${fixtures.length}`
      );

      if (fixtures.length === 0) {
         console.warn(
            '[syncLiveFromApi] API returned 0 fixtures — skipping stale wipe'
         );
         return [];
      }

      const liveMatchIds: string[] = [];
      let processed = 0;

      for (const fixture of fixtures) {
         try {
            const fixtureId = fixture.fixture?.id;
            if (!fixtureId) continue;

            const home = fixture.teams?.home;
            const away = fixture.teams?.away;
            if (!home?.id || !away?.id) continue;

            const league = fixture.league?.id
               ? await leagueRepository.upsertByApiId({
                    apiLeagueId: fixture.league.id,
                    name: fixture.league.name ?? 'Unknown',
                    country: fixture.league.country,
                    logo: fixture.league.logo,
                 })
               : null;

            const homeTeam = await teamRepository.upsertByApiId({
               apiTeamId: home.id,
               name: home.name ?? 'Unknown',
               logo: home.logo,
               leagueId: league?.id ?? null,
            });

            const awayTeam = await teamRepository.upsertByApiId({
               apiTeamId: away.id,
               name: away.name ?? 'Unknown',
               logo: away.logo,
               leagueId: league?.id ?? null,
            });

            if (homeTeam && awayTeam) {
               const match = await matchRepository.upsertByApiFixtureId(
                  fixtureId,
                  {
                     apiFixtureId: fixtureId,
                     leagueId: league?.id ?? null,
                     homeTeamId: homeTeam.id,
                     awayTeamId: awayTeam.id,
                     kickoffTime: new Date(fixture.fixture.date),
                     status: 'LIVE',
                     score: `${fixture.goals?.home ?? 0}-${fixture.goals?.away ?? 0}`,
                     venue: fixture.fixture?.venue?.name,
                  },
                  {
                     status: 'LIVE',
                     score: `${fixture.goals?.home ?? 0}-${fixture.goals?.away ?? 0}`,
                  }
               );

               if (match?.id) {
                  liveMatchIds.push(match.id);
                  processed++;
               }
            }
         } catch (err) {
            console.error(
               `[syncLiveFromApi] Error on fixture ${fixture.fixture?.id}:`,
               err
            );
         }
      }

      console.log(
         `[syncLiveFromApi] Successfully processed ${processed} fixtures → ${liveMatchIds.length} live matches`
      );

      const currentLiveApiIds = fixtures
         .map((f: { fixture: { id: any } }) => f.fixture?.id)
         .filter((id: any): id is number => typeof id === 'number');

      // Only mark stale if we got a meaningful response from the API
      // Threshold: only wipe if API returned at least 1 fixture
      // This prevents a quota/outage from clearing all live matches
      if (currentLiveApiIds.length > 0) {
         const result =
            await matchRepository.markStaleLiveAsFinished(currentLiveApiIds);
         console.log(
            `[syncLiveFromApi] Marked ${result.count} stale LIVE matches as FINISHED`
         );
      }

      return liveMatchIds;
   },
};
