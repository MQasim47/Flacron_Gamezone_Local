import type { Request, Response } from 'express';
import { sportSrcService } from '../services/sportSrc.service.js';
import { matchRepository } from '../repositories/match.repository.js';
import { config } from '../config/index.js';

/**
 * Resolves the SportSRC slug from either:
 * - req.params.id being the internal DB match ID  (common case)
 * - req.params.id being the SportSRC slug directly (admin / debug)
 */
async function resolveSlug(id: string): Promise<string | null> {
   // Try as DB id first
   const match = await matchRepository.findById(id);
   if (match) return (match as any).apiMatchSlug ?? null;

   // Treat the id itself as a slug
   const bySlug = await matchRepository.findBySlug(id);
   if (bySlug) return (bySlug as any).apiMatchSlug ?? id;

   // Last resort: pass through as-is (admin may supply raw slug)
   return id;
}

function requireSportSrc(res: Response): boolean {
   if (config.footballDataProvider !== 'sportsrc') {
      res.status(400).json({
         error: 'Deep data is only available when SportSRC is the active provider.',
         provider: config.footballDataProvider,
      });
      return false;
   }
   return true;
}

export const deepDataController = {
   async getLineups(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getLineups(slug);
      if (!data)
         return res.status(404).json({ error: 'Lineups not available' });
      res.json({ success: true, lineups: data });
   },

   async getStats(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getStats(slug);
      if (!data) return res.status(404).json({ error: 'Stats not available' });
      res.json({ success: true, stats: data });
   },

   async getIncidents(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getIncidents(slug);
      if (!data)
         return res.status(404).json({ error: 'Incidents not available' });
      res.json({ success: true, incidents: data });
   },

   async getShotmap(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getShotmap(slug);
      if (!data)
         return res.status(404).json({ error: 'Shotmap not available' });
      res.json({ success: true, shotmap: data });
   },

   async getOdds(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getOdds(slug);
      if (!data) return res.status(404).json({ error: 'Odds not available' });
      res.json({ success: true, odds: data });
   },

   async getVotes(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getVotes(slug);
      if (!data) return res.status(404).json({ error: 'Votes not available' });
      res.json({ success: true, votes: data });
   },

   async getH2H(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getH2H(slug);
      if (!data) return res.status(404).json({ error: 'H2H not available' });
      res.json({ success: true, h2h: data });
   },

   async getLastMatches(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getLastMatches(slug);
      if (!data)
         return res.status(404).json({ error: 'Last matches not available' });
      res.json({ success: true, lastMatches: data });
   },

   async getStanding(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      const leagueId =
         typeof req.query.leagueId === 'string'
            ? req.query.leagueId
            : undefined;

      const data = await sportSrcService.getStanding(
         slug ?? undefined,
         leagueId
      );
      if (!data)
         return res.status(404).json({ error: 'Standing not available' });
      res.json({ success: true, standing: data });
   },

   async getGraph(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getGraph(slug);
      if (!data) return res.status(404).json({ error: 'Graph not available' });
      res.json({ success: true, graph: data });
   },

   async getHighlights(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const data = await sportSrcService.getHighlights(slug);
      if (!data)
         return res.status(404).json({ error: 'Highlights not available' });
      res.json({ success: true, highlights: data });
   },

   /** Convenience: returns all available deep data for a match in one request */
   async getAll(req: Request, res: Response) {
      if (!requireSportSrc(res)) return;
      const slug = await resolveSlug(req.params.id);
      if (!slug) return res.status(404).json({ error: 'Match not found' });

      const [
         lineups,
         stats,
         incidents,
         shotmap,
         odds,
         votes,
         h2h,
         lastMatches,
         graph,
         highlights,
      ] = await Promise.allSettled([
         sportSrcService.getLineups(slug),
         sportSrcService.getStats(slug),
         sportSrcService.getIncidents(slug),
         sportSrcService.getShotmap(slug),
         sportSrcService.getOdds(slug),
         sportSrcService.getVotes(slug),
         sportSrcService.getH2H(slug),
         sportSrcService.getLastMatches(slug),
         sportSrcService.getGraph(slug),
         sportSrcService.getHighlights(slug),
      ]);

      res.json({
         success: true,
         slug,
         lineups: lineups.status === 'fulfilled' ? lineups.value : null,
         stats: stats.status === 'fulfilled' ? stats.value : null,
         incidents: incidents.status === 'fulfilled' ? incidents.value : null,
         shotmap: shotmap.status === 'fulfilled' ? shotmap.value : null,
         odds: odds.status === 'fulfilled' ? odds.value : null,
         votes: votes.status === 'fulfilled' ? votes.value : null,
         h2h: h2h.status === 'fulfilled' ? h2h.value : null,
         lastMatches:
            lastMatches.status === 'fulfilled' ? lastMatches.value : null,
         graph: graph.status === 'fulfilled' ? graph.value : null,
         highlights:
            highlights.status === 'fulfilled' ? highlights.value : null,
      });
   },
};
