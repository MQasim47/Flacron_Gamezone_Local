import { generateText as sdkGenerateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { config } from '../config/index.js';
import { matchRepository } from '../repositories/match.repository.js';
import { aiSummaryRepository } from '../repositories/aiSummary.repository.js';
import { cacheGet, cacheSet, cacheDel } from '../lib/redis.js';
import type { MatchContext, AILanguage, AIKind } from '../types/index.js';

const AI_CACHE_TTL = 60 * 60 * 24;

export const aiService = {
   async generateText(prompt: string, maxTokens = 500): Promise<string> {
      const res = await sdkGenerateText({
         model: openai(config.ai.model),
         prompt,
         temperature: 0.7,
         maxTokens,
      } as any);

      if (typeof (res as any).text === 'string')
         return (res as any).text.trim();
      return JSON.stringify(res).slice(0, 1000);
   },

   async generateMatchPreview(
      matchId: string,
      language: AILanguage = 'en'
   ): Promise<string> {
      const cacheKey = `ai:preview:${matchId}:${language}`;
      const cached = await cacheGet<string>(cacheKey);
      if (cached) return cached;

      const match = await matchRepository.findByIdWithTeams(matchId);
      if (!match) throw new Error('Match not found');

      const context = this._buildContext(match);
      const prompt = this._buildPreviewPrompt(context, language);
      const text = await this.generateText(prompt, 500);

      await aiSummaryRepository.upsert({
         matchId,
         language,
         kind: 'preview',
         content: text,
         provider: 'ai-sdk',
      });
      await cacheSet(cacheKey, text, AI_CACHE_TTL);
      return text;
   },

   async generateMatchSummary(
      matchId: string,
      language: AILanguage = 'en'
   ): Promise<string> {
      const cacheKey = `ai:summary:${matchId}:${language}`;
      const cached = await cacheGet<string>(cacheKey);
      if (cached) return cached;

      const match = await matchRepository.findByIdWithTeams(matchId);
      if (!match) throw new Error('Match not found');
      if (match.status !== 'FINISHED')
         throw new Error('Cannot generate summary for unfinished match');

      const context = this._buildContext(match);
      const prompt = this._buildSummaryPrompt(context, language);
      const text = await this.generateText(prompt, 600);

      await aiSummaryRepository.upsert({
         matchId,
         language,
         kind: 'summary',
         content: text,
         provider: 'ai-sdk',
      });
      await cacheSet(cacheKey, text, AI_CACHE_TTL);
      return text;
   },

   async getContent(matchId: string, language = 'en') {
      const rows = await aiSummaryRepository.findByMatch(matchId, language);
      return {
         preview: rows.find((r) => r.kind === 'preview')?.content ?? null,
         summary: rows.find((r) => r.kind === 'summary')?.content ?? null,
      };
   },

   async clearCache(matchId: string) {
      const langs: AILanguage[] = ['en', 'fr'];
      const kinds: AIKind[] = ['preview', 'summary'];
      for (const lang of langs)
         for (const kind of kinds)
            await cacheDel(`ai:${kind}:${matchId}:${lang}`);
   },

   _buildContext(match: any): MatchContext {
      return {
         homeTeam: { name: match.homeTeam.name, logo: match.homeTeam.logo },
         awayTeam: { name: match.awayTeam.name, logo: match.awayTeam.logo },
         league: match.league
            ? { name: match.league.name, country: match.league.country }
            : null,
         kickoffTime: match.kickoffTime,
         venue: match.venue
            ? `${match.venue.name}${match.venue.city ? `, ${match.venue.city}` : ''}`
            : null,
         status: match.status,
         score: match.score,
      };
   },

   _buildPreviewPrompt(ctx: MatchContext, language: AILanguage): string {
      const league = ctx.league
         ? `${ctx.league.name}${ctx.league.country ? ` (${ctx.league.country})` : ''}`
         : 'Unknown League';
      const date = ctx.kickoffTime.toLocaleString(
         language === 'fr' ? 'fr-FR' : 'en-US',
         {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
         }
      );
      if (language === 'fr') {
         return `Génère un aperçu de match de football passionnant pour :\n\nMatch : ${ctx.homeTeam.name} vs ${ctx.awayTeam.name}\nCompétition : ${league}\nDate : ${date}${ctx.venue ? `\nStade : ${ctx.venue}` : ''}\n\n3-4 paragraphes, 300-400 mots, ton professionnel.`;
      }
      return `Generate an exciting football match preview for:\n\nMatch: ${ctx.homeTeam.name} vs ${ctx.awayTeam.name}\nCompetition: ${league}\nDate: ${date}${ctx.venue ? `\nVenue: ${ctx.venue}` : ''}\n\n3-4 paragraphs, 300-400 words, professional tone.`;
   },

   _buildSummaryPrompt(ctx: MatchContext, language: AILanguage): string {
      const league = ctx.league
         ? `${ctx.league.name}${ctx.league.country ? ` (${ctx.league.country})` : ''}`
         : 'Unknown League';
      const date = ctx.kickoffTime.toLocaleString(
         language === 'fr' ? 'fr-FR' : 'en-US',
         { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      );
      if (language === 'fr') {
         return `Génère un résumé de match pour :\n\nMatch : ${ctx.homeTeam.name} ${ctx.score ?? 'vs'} ${ctx.awayTeam.name}\nCompétition : ${league}\nDate : ${date}${ctx.venue ? `\nStade : ${ctx.venue}` : ''}\n\n3-4 paragraphes, 350-450 mots, ton enthousiaste.`;
      }
      return `Generate a compelling football match summary for:\n\nMatch: ${ctx.homeTeam.name} ${ctx.score ?? 'vs'} ${ctx.awayTeam.name}\nCompetition: ${league}\nDate: ${date}${ctx.venue ? `\nVenue: ${ctx.venue}` : ''}\n\n3-4 paragraphs, 350-450 words, enthusiastic tone.`;
   },
};
