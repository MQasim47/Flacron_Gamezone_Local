import { prisma } from '../lib/prisma.js';

export const streamRepository = {
   findActiveStreams() {
      return prisma.stream.findMany({
         where: { isActive: true, type: 'EMBED' },
         include: {
            match: {
               include: { homeTeam: true, awayTeam: true },
            },
         },
         orderBy: { lastCheckedAt: 'desc' },
      });
   },

   findAllWithMatch() {
      return prisma.stream.findMany({
         include: {
            match: {
               select: {
                  id: true,
                  kickoffTime: true,
                  status: true,
                  homeTeam: { select: { name: true } },
                  awayTeam: { select: { name: true } },
               },
            },
         },
         orderBy: { lastCheckedAt: 'desc' },
      });
   },

   findByMatchId(matchId: string) {
      return prisma.stream.findUnique({
         where: { matchId },
         include: {
            match: {
               select: {
                  id: true,
                  apiMatchSlug: true,
                  kickoffTime: true,
                  status: true,
                  homeTeam: { select: { name: true } },
                  awayTeam: { select: { name: true } },
               },
            },
         },
      });
   },

   upsert(
      matchId: string,
      create: {
         type: 'EMBED' | 'NONE';
         provider?: string | null;
         url?: string | null;
         isActive?: boolean;
         youtubeVideoId?: string | null;
         streamTitle?: string | null;
         streamSources?: string | null;
      },
      update: {
         type?: 'EMBED' | 'NONE';
         provider?: string | null;
         url?: string | null;
         isActive?: boolean;
         youtubeVideoId?: string | null;
         streamTitle?: string | null;
         streamSources?: string | null;
         lastCheckedAt?: Date;
      }
   ) {
      return prisma.stream.upsert({
         where: { matchId },
         create: { matchId, ...create },
         update,
      });
   },

   saveYoutubeStream(matchId: string, videoId: string, title: string) {
      const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      return prisma.stream.upsert({
         where: { matchId },
         create: {
            matchId,
            type: 'EMBED',
            provider: 'youtube',
            url,
            isActive: true,
            youtubeVideoId: videoId,
            streamTitle: title,
            lastCheckedAt: new Date(),
         },
         update: {
            type: 'EMBED',
            provider: 'youtube',
            url,
            isActive: true,
            youtubeVideoId: videoId,
            streamTitle: title,
            lastCheckedAt: new Date(),
         },
      });
   },

   markNoStream(matchId: string) {
      return prisma.stream.upsert({
         where: { matchId },
         create: {
            matchId,
            type: 'NONE',
            provider: null,
            url: null,
            isActive: false,
            youtubeVideoId: null,
            streamTitle: null,
            lastCheckedAt: new Date(),
         },
         update: {
            isActive: false,
            lastCheckedAt: new Date(),
         },
      });
   },

   deleteByMatchId(matchId: string) {
      return prisma.stream.delete({ where: { matchId } });
   },

   findLiveEligibleForStream(cooldownCutoff: Date) {
      return prisma.match.findMany({
         where: {
            status: 'LIVE',
            OR: [
               { stream: null },
               {
                  stream: {
                     isActive: false,
                     lastCheckedAt: { lt: cooldownCutoff },
                  },
               },
            ],
         },
         select: { id: true, apiMatchSlug: true },
      });
   },
};
