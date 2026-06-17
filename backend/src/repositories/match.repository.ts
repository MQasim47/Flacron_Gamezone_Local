import { prisma } from '../lib/prisma.js';
import type { PaginationParams } from '../types/index.js';

const matchIncludes = {
   league: true,
   homeTeam: true,
   awayTeam: true,
   venue: true,
   stream: true,
} as const;

const matchIncludesFull = {
   ...matchIncludes,
   aiTexts: true,
} as const;

export const matchRepository = {
   async findAll(filters: {
      status?: 'LIVE' | 'UPCOMING' | 'FINISHED';
      leagueId?: string;
      teamId?: string;
      date?: string;
   }) {
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.leagueId) where.leagueId = filters.leagueId;
      if (filters.teamId)
         where.OR = [
            { homeTeamId: filters.teamId },
            { awayTeamId: filters.teamId },
         ];
      if (filters.date) {
         const parsedDate = new Date(filters.date + 'T00:00:00.000Z');
         if (Number.isNaN(parsedDate.getTime())) {
            throw Object.assign(
               new Error('Invalid date format. Use YYYY-MM-DD'),
               { status: 400 }
            );
         }
         where.kickoffTime = {
            gte: parsedDate,
            lte: new Date(filters.date + 'T23:59:59.999Z'),
         };
      }
      return prisma.match.findMany({
         where,
         include: matchIncludes,
         orderBy: { kickoffTime: 'asc' },
      });
   },

   findById(id: string) {
      return prisma.match.findUnique({
         where: { id },
         include: matchIncludesFull,
      });
   },

   findByIdWithTeams(id: string) {
      return prisma.match.findUnique({
         where: { id },
         include: {
            homeTeam: true,
            awayTeam: true,
            venue: true,
            stream: true,
            league: true,
         },
      });
   },

   findBySlug(slug: string) {
      return prisma.match.findUnique({
         where: { apiMatchSlug: slug },
         include: matchIncludesFull,
      });
   },

   findByApiFixtureId(apiFixtureId: number) {
      return prisma.match.findUnique({ where: { apiFixtureId } });
   },

   findFirst(where: any) {
      return prisma.match.findFirst({ where });
   },

   findLive() {
      return prisma.match.findMany({
         where: { status: 'LIVE' },
         include: matchIncludes,
         orderBy: { kickoffTime: 'asc' },
      });
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

   findRecentlyFinished(sinceMs: number) {
      return prisma.match.findMany({
         where: {
            status: 'FINISHED',
            updatedAt: { gte: new Date(Date.now() - sinceMs) },
         },
         include: { aiTexts: true },
      });
   },

   findUpcomingInDays(days: number) {
      return prisma.match.findMany({
         where: {
            status: 'UPCOMING',
            kickoffTime: {
               gte: new Date(),
               lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            },
         },
         include: { aiTexts: true },
      });
   },

   findByLeague(leagueId: string) {
      return {
         finished: () =>
            prisma.match.findMany({
               where: { leagueId, status: 'FINISHED', score: { not: null } },
               include: { homeTeam: true, awayTeam: true },
            }),
         upcoming: (take = 10) =>
            prisma.match.findMany({
               where: { leagueId, status: { in: ['UPCOMING', 'LIVE'] } },
               include: {
                  homeTeam: {
                     select: {
                        id: true,
                        name: true,
                        logo: true,
                        apiTeamId: true,
                     },
                  },
                  awayTeam: {
                     select: {
                        id: true,
                        name: true,
                        logo: true,
                        apiTeamId: true,
                     },
                  },
               },
               orderBy: { kickoffTime: 'asc' },
               take,
            }),
         recent: (take = 10) =>
            prisma.match.findMany({
               where: { leagueId, status: 'FINISHED' },
               include: {
                  homeTeam: {
                     select: {
                        id: true,
                        name: true,
                        logo: true,
                        apiTeamId: true,
                     },
                  },
                  awayTeam: {
                     select: {
                        id: true,
                        name: true,
                        logo: true,
                        apiTeamId: true,
                     },
                  },
               },
               orderBy: { kickoffTime: 'desc' },
               take,
            }),
      };
   },

   findByTeam(teamId: string) {
      const base = {
         include: {
            homeTeam: {
               select: { id: true, name: true, logo: true, apiTeamId: true },
            },
            awayTeam: {
               select: { id: true, name: true, logo: true, apiTeamId: true },
            },
            league: {
               select: { id: true, name: true, country: true, logo: true },
            },
            venue: true,
         },
         orderBy: { kickoffTime: 'desc' } as const,
      };
      return {
         home: () =>
            prisma.match.findMany({ where: { homeTeamId: teamId }, ...base }),
         away: () =>
            prisma.match.findMany({ where: { awayTeamId: teamId }, ...base }),
      };
   },

   findPaginated({
      page,
      limit,
      status,
      leagueId,
   }: PaginationParams & {
      status?: 'LIVE' | 'UPCOMING' | 'FINISHED';
      leagueId?: string;
   }) {
      const skip = (page - 1) * limit;
      const where: {
         status?: 'LIVE' | 'UPCOMING' | 'FINISHED';
         leagueId?: string;
      } = {};
      if (status) where.status = status;
      if (leagueId) where.leagueId = leagueId;

      return Promise.all([
         prisma.match.findMany({
            where,
            include: {
               league: true,
               homeTeam: true,
               awayTeam: true,
               venue: true,
               stream: true,
            },
            orderBy: { kickoffTime: 'desc' },
            skip,
            take: limit,
         }),
         prisma.match.count({ where }),
      ]);
   },

   create(data: {
      leagueId?: string | null;
      homeTeamId: string;
      awayTeamId: string;
      kickoffTime: Date;
      status?: 'UPCOMING' | 'LIVE' | 'FINISHED';
      score?: string | null;
      venueId?: string | null; // ← was venue string
      apiFixtureId?: number | null;
      apiMatchSlug?: string | null;
   }) {
      return prisma.match.create({
         data,
         include: { league: true, homeTeam: true, awayTeam: true, venue: true },
      });
   },

   update(id: string, data: Partial<any>) {
      return prisma.match.update({
         where: { id },
         data,
         include: { league: true, homeTeam: true, awayTeam: true, venue: true },
      });
   },

   upsertByApiFixtureId(fixtureId: number, create: any, update: any) {
      return prisma.match.upsert({
         where: { apiFixtureId: fixtureId },
         update,
         create,
      });
   },

   upsertBySlug(slug: string, create: any, update: any) {
      return prisma.match.upsert({
         where: { apiMatchSlug: slug },
         update,
         create: { ...create, apiMatchSlug: slug },
      });
   },

   markStaleLiveAsFinished(currentLiveApiIds: number[]) {
      const validApiIds = currentLiveApiIds.filter((id) => id > 0);
      return prisma.match.updateMany({
         where: {
            status: 'LIVE',
            ...(validApiIds.length > 0
               ? { apiFixtureId: { notIn: validApiIds } }
               : {}),
         },
         data: { status: 'FINISHED' },
      });
   },

   markStaleLiveAsFinishedBySlugs(activeSlugs: string[]) {
      if (!activeSlugs.length) return Promise.resolve({ count: 0 });
      return prisma.match.updateMany({
         where: {
            status: 'LIVE',
            apiMatchSlug: { notIn: activeSlugs },
         },
         data: { status: 'FINISHED' },
      });
   },

   markStaleUpcomingAsFinished() {
      // Matches that were UPCOMING but kickoff was >2.5 hours ago
      const cutoff = new Date(Date.now() - 2.5 * 60 * 60 * 1000);
      return prisma.match.updateMany({
         where: {
            status: 'UPCOMING',
            kickoffTime: { lt: cutoff },
         },
         data: { status: 'FINISHED' },
      });
   },

   countLive() {
      return prisma.match.count({ where: { status: 'LIVE' } });
   },

   delete(id: string) {
      return prisma.match.delete({ where: { id } });
   },

   search(query: string) {
      return prisma.match.findMany({
         where: {
            OR: [
               { homeTeam: { name: { contains: query, mode: 'insensitive' } } },
               { awayTeam: { name: { contains: query, mode: 'insensitive' } } },
            ],
         },
         include: {
            homeTeam: true,
            awayTeam: true,
            league: true,
            venue: true,
            stream: true,
         },
         take: 10,
         orderBy: { kickoffTime: 'desc' },
      });
   },
};
