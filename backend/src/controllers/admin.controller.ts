import type { Request, Response } from 'express';
import { leagueService } from '../services/league.service.js';
import { teamService } from '../services/team.service.js';
import { matchService } from '../services/match.service.js';
import { streamService } from '../services/stream.service.js';
import { youtubeService } from '../services/youtube.service.js';
import { aiService } from '../services/ai.service.js';
import { aiSummaryRepository } from '../repositories/aiSummary.repository.js';
import { matchRepository } from '../repositories/match.repository.js';
import { streamRepository } from '../repositories/stream.repository.js';
import { userRepository } from '../repositories/user.repository.js';

function pagination(req: Request) {
   const rawPage = Number.parseInt(String(req.query.page ?? '1'), 10);
   const rawLimit = Number.parseInt(String(req.query.limit ?? '100'), 10);
   const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
   const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 100;
   return {
      page,
      limit,
   };
}

// ─── Leagues ──────────────────────────────────────────────────────────────────

export const adminLeagueController = {
   async getFromApi(req: Request, res: Response) {
      const { page, limit } = pagination(req);
      const result = await leagueService.fetchFromApi(page, limit);
      res.json({ success: true, ...result });
   },

   async getSaved(req: Request, res: Response) {
      const result = await leagueService.getPaginated(pagination(req));
      res.json({ leagues: result.data, pagination: result.pagination });
   },

   async create(req: Request, res: Response) {
      const league = await leagueService.create((req as any).validated);
      res.json(league);
   },

   async update(req: Request, res: Response) {
      const league = await leagueService.update(
         req.params.id,
         (req as any).validated
      );
      res.json(league);
   },

   async delete(req: Request, res: Response) {
      await leagueService.delete(req.params.id);
      res.json({ ok: true });
   },

   async syncOne(req: Request, res: Response) {
      // Re-fetch from API and update the stored league record
      const league = await leagueService.getById(req.params.id);
      if (!league) {
         return res.status(404).json({ error: 'League not found' });
      }
      res.json({ success: true, message: `League ${league.name} synced` });
   },

   async bulkSync(req: Request, res: Response) {
      // Trigger a full re-fetch from API — invalidates cache so next request pulls fresh data
      await leagueService.invalidateCache?.();
      res.json({
         success: true,
         message: 'All leagues will be synced on next fetch',
      });
   },
};

// ─── Teams ────────────────────────────────────────────────────────────────────

export const adminTeamController = {
   async getFromApi(req: Request, res: Response) {
      const { page, limit } = pagination(req);
      const leagueId =
         typeof req.query.leagueId === 'string' ? req.query.leagueId : null;
      const result = await teamService.fetchFromApi(leagueId, page, limit);
      res.json({ success: true, ...result });
   },

   async getSaved(req: Request, res: Response) {
      const result = await teamService.getPaginated(pagination(req));
      res.json({ teams: result.data, pagination: result.pagination });
   },

   async create(req: Request, res: Response) {
      const team = await teamService.create((req as any).validated);
      res.status(201).json({
         success: true,
         message: `Added ${(team as any).name}`,
      });
   },

   async update(req: Request, res: Response) {
      const team = await teamService.update(
         req.params.id,
         (req as any).validated
      );
      res.json(team);
   },

   async delete(req: Request, res: Response) {
      await teamService.delete(req.params.id);
      res.json({ ok: true });
   },
};

// ─── Matches ──────────────────────────────────────────────────────────────────

export const adminMatchController = {
   async getFromApi(req: Request, res: Response) {
      const { page, limit } = pagination(req);
      const result = await matchService.fetchFromApi({
         leagueId:
            typeof req.query.leagueId === 'string' && req.query.leagueId.trim()
               ? req.query.leagueId.trim()
               : null,
         date:
            typeof req.query.date === 'string' && req.query.date.trim()
               ? req.query.date.trim()
               : null,
         status:
            typeof req.query.status === 'string' && req.query.status.trim()
               ? req.query.status.trim()
               : null,
         page,
         limit,
      });
      res.json({
         success: true,
         matches: result.data,
         total: result.pagination.total,
         pagination: result.pagination,
      });
   },

   async getSaved(req: Request, res: Response) {
      const rawPage = Number.parseInt(String(req.query.page ?? '1'), 10);
      const rawLimit = Number.parseInt(String(req.query.limit ?? '10'), 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit =
         Number.isFinite(rawLimit) && rawLimit > 0
            ? Math.min(rawLimit, 100)
            : 10;
      const status = req.query.status as string | undefined;
      const leagueId = req.query.leagueId as string | undefined;

      const result = await matchService.getPaginated({
         page,
         limit,
         status,
         leagueId,
      } as any);
      res.json({ matches: result.data, pagination: result.pagination });
   },

   async create(req: Request, res: Response) {
      const match = await matchService.create((req as any).validated);
      res.json(match);
   },

   async update(req: Request, res: Response) {
      const match = await matchService.update(
         req.params.id,
         (req as any).validated
      );
      res.json(match);
   },

   async delete(req: Request, res: Response) {
      await matchService.delete(req.params.id);
      res.json({ ok: true });
   },

   async sync(req: Request, res: Response) {
      const liveIds = await matchService.syncLiveFromApi();
      const liveCount = await matchRepository.countLive();
      res.json({ success: true, synced: liveIds.length, live: liveCount });
   },
};

// ─── Streams ──────────────────────────────────────────────────────────────────

export const adminStreamController = {
   async getAll(req: Request, res: Response) {
      const streams = await streamRepository.findAllWithMatch();
      res.json(streams);
   },

   async getByMatch(req: Request, res: Response) {
      const stream = await streamRepository.findByMatchId(req.params.matchId);
      if (!stream) {
         return res.status(404).json({ error: 'Stream not found' });
      }
      res.json(stream);
   },

   async upsert(req: Request, res: Response) {
      const stream = await streamService.upsert((req as any).validated);
      res.json(stream);
   },

   async updateByMatch(req: Request, res: Response) {
      const { matchId } = req.params;
      const data = (req as any).validated;
      const stream = await streamService.upsert({ matchId, ...data });
      res.json(stream);
   },

   async deleteByMatch(req: Request, res: Response) {
      await streamRepository.deleteByMatchId(req.params.matchId);
      res.json({ ok: true });
   },

   async findForMatch(req: Request, res: Response) {
      const matchId = req.params.matchId ?? req.params.id;
      const { config } = await import('../config/index.js');

      if (config.footballDataProvider === 'sportsrc') {
         const stream = await streamService.findStreamForMatch(matchId);
         if (!stream) {
            return res
               .status(404)
               .json({ found: false, error: 'No stream found for this match' });
         }
         return res.json({ found: true, stream });
      }

      // Legacy YouTube path
      const stream = await streamService.findStreamForMatch(matchId);
      if (!stream) {
         return res
            .status(404)
            .json({ found: false, error: 'No stream found or quota exceeded' });
      }
      res.json({ found: true, stream });
   },

   async bulkYoutubeSearch(req: Request, res: Response) {
      const { config } = await import('../config/index.js');

      if (config.footballDataProvider === 'sportsrc') {
         // With SportSRC, streams come from the detail endpoint during sync.
         // Manual bulk refresh: re-fetch detail for all live matches.
         const liveMatches = await matchRepository.findLive();
         let refreshed = 0;
         for (const match of liveMatches) {
            try {
               await streamService.findStreamForMatch(match.id);
               refreshed++;
            } catch {
               // continue
            }
         }
         return res.json({
            success: true,
            refreshed,
            message: `Refreshed streams for ${refreshed} live matches via SportSRC`,
         });
      }

      // Legacy YouTube bulk search
      const liveMatches = await matchRepository.findLive();
      let searched = 0;
      for (const match of liveMatches) {
         try {
            await youtubeService.findAndSaveStreamForMatch(match.id);
            searched++;
         } catch {
            // continue
         }
      }
      res.json({
         success: true,
         searched,
         message: `Searched ${searched} live matches via YouTube`,
      });
   },
};

// ─── AI ───────────────────────────────────────────────────────────────────────

export const adminAiController = {
   async generatePreview(req: Request, res: Response) {
      const { matchId, language } = (req as any).validated;
      const preview = await aiService.generateMatchPreview(matchId, language);
      res.json({ success: true, preview });
   },

   async generateSummary(req: Request, res: Response) {
      const { matchId, language } = (req as any).validated;
      const summary = await aiService.generateMatchSummary(matchId, language);
      res.json({ success: true, summary });
   },

   async deleteContent(req: Request, res: Response) {
      await aiService.clearCache(req.params.matchId);
      await aiSummaryRepository.deleteByMatch(req.params.matchId);
      res.json({ success: true, message: 'AI content cleared' });
   },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const adminUserController = {
   async getAll(req: Request, res: Response) {
      const rawPage = Number.parseInt(String(req.query.page ?? '1'), 10);
      const rawLimit = Number.parseInt(String(req.query.limit ?? '10'), 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit =
         Number.isFinite(rawLimit) && rawLimit > 0
            ? Math.min(rawLimit, 100)
            : 10;
      const search =
         typeof req.query.search === 'string'
            ? req.query.search.trim()
            : undefined;

      const result = await userRepository.findPaginated({
         page,
         limit,
         search,
      });
      res.json({ users: result.data, total: result.total });
   },

   async update(req: Request, res: Response) {
      const { role } = (req as any).validated;
      const user = await userRepository.update(req.params.id, { role });
      res.json(user);
   },

   async delete(req: Request, res: Response) {
      await userRepository.delete(req.params.id);
      res.json({ ok: true });
   },

   async cancelSubscription(req: Request, res: Response) {
      const { prisma } = await import('../lib/prisma.js');
      await prisma.subscription.updateMany({
         where: { userId: req.params.id, status: 'active' },
         data: { status: 'canceled', cancelAtPeriodEnd: true },
      });
      res.json({ success: true, message: 'Subscription cancelled' });
   },
};
