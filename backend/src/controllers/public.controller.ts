import type { Request, Response } from 'express';
import { config } from '../config/index.js';
import {
   FootballApiError,
   footballApiService,
} from '../services/footballApi.service.js';
import { leagueService } from '../services/league.service.js';
import { matchService } from '../services/match.service.js';
import {
   SportSrcError,
   sportSrcService,
} from '../services/sportSrc.service.js';
import { streamService } from '../services/stream.service.js';
import { teamService } from '../services/team.service.js';

export const publicController = {
   async getLeagues(_req: Request, res: Response) {
      const leagues = await leagueService.getAll();
      res.json({ success: true, leagues });
   },

   async getLeagueById(req: Request, res: Response) {
      const details = await matchService.getLeagueDetails(req.params.id);
      res.json(details);
   },

   async getTeams(req: Request, res: Response) {
      const q = String(req.query.q ?? '').trim();
      const teams = await teamService.getAllWithStats(q || undefined);
      res.json(teams);
   },

   async getTeamById(req: Request, res: Response) {
      const details = await matchService.getTeamDetails(req.params.id);
      res.json(details);
   },

   async getMatches(req: Request, res: Response) {
      const status = String(req.query.status ?? '').toUpperCase() as any;
      const date = String(req.query.date ?? '').trim();
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
         return res
            .status(400)
            .json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      const matches = await matchService.getAll({
         status: ['LIVE', 'UPCOMING', 'FINISHED'].includes(status)
            ? status
            : undefined,
         leagueId: String(req.query.leagueId ?? '') || undefined,
         teamId: String(req.query.teamId ?? '') || undefined,
         date: date || undefined,
      });
      res.json(matches);
   },

   async getLiveMatches(_req: Request, res: Response) {
      const liveMatches = await matchService.getAll({ status: 'LIVE' });

      const { cacheGet } = await import('../lib/redis.js');

      // Read error from whichever provider is active
      const errorKey =
         config.footballDataProvider === 'sportsrc'
            ? 'sportsrc:last-error'
            : 'api-football:last-error';

      const apiError = await cacheGet<{ code: string; message: string }>(
         errorKey
      );

      res.json({ matches: liveMatches, apiError: apiError ?? null });
   },

   async getMatchById(req: Request, res: Response) {
      const match = await matchService.getByIdForUser(
         req.params.id,
         req.headers.authorization
      );
      if (!match) return res.status(404).json({ error: 'Not found' });
      res.json(match);
   },

   async getStreamStatus(req: Request, res: Response) {
      const status = await streamService.getStreamStatus(req.params.id);
      res.json(status);
   },

   async search(req: Request, res: Response) {
      const q = String(req.query.q ?? '').trim();
      const results = await matchService.search(q);
      res.json(results);
   },

   async getApiStatus(_req: Request, res: Response) {
      if (config.footballDataProvider === 'sportsrc') {
         try {
            const account = await sportSrcService.getAccount();
            res.json({ ok: true, provider: 'sportsrc', account, error: null });
         } catch (err) {
            if (err instanceof SportSrcError) {
               res.json({
                  ok: false,
                  provider: 'sportsrc',
                  code: err.code,
                  error: err.message,
               });
            } else {
               res.json({
                  ok: false,
                  provider: 'sportsrc',
                  code: 'UNKNOWN',
                  error: 'Unknown error',
               });
            }
         }
      } else {
         // Legacy api-football path — unchanged
         try {
            await footballApiService.getLiveFixturesCached();
            res.json({ ok: true, provider: 'api-football', error: null });
         } catch (err) {
            if (err instanceof FootballApiError) {
               res.json({
                  ok: false,
                  provider: 'api-football',
                  code: err.code,
                  error: err.message,
               });
            } else {
               res.json({
                  ok: false,
                  provider: 'api-football',
                  code: 'UNKNOWN',
                  error: 'Unknown error',
               });
            }
         }
      }
   },
};
