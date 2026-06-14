import { prisma } from '../lib/prisma.js';
import type { PaginationParams } from '../types/index.js';

export const teamRepository = {
   findAll(query?: string) {
      return prisma.team.findMany({
         where: query
            ? { name: { contains: query, mode: 'insensitive' } }
            : undefined,
         include: {
            venue: true,
            league: true,
            homeMatches: {
               where: { status: 'FINISHED' },
               select: { score: true, homeTeamId: true, awayTeamId: true },
            },
            awayMatches: {
               where: { status: 'FINISHED' },
               select: { score: true, homeTeamId: true, awayTeamId: true },
            },
         },
         orderBy: { name: 'asc' },
      });
   },

   findById(id: string) {
      return prisma.team.findUnique({
         where: { id },
         include: {
            venue: true,
            league: {
               select: { id: true, name: true, country: true, logo: true },
            },
         },
      });
   },

   findByApiId(apiTeamId: number) {
      return prisma.team.findUnique({ where: { apiTeamId } });
   },

   findFirst(where: { apiTeamId?: number; name?: string }) {
      return prisma.team.findFirst({ where });
   },

   findPaginated({ page, limit }: PaginationParams) {
      const skip = (page - 1) * limit;
      return Promise.all([
         prisma.team.findMany({
            include: { league: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
         }),
         prisma.team.count(),
      ]);
   },

   create(data: {
      name: string;
      logo?: string | null;
      apiTeamId?: number | null;
      leagueId?: string | null;
   }) {
      return prisma.team.create({ data, include: { league: true } });
   },

   update(
      id: string,
      data: Partial<{
         name: string;
         logo: string | null;
         apiTeamId: number | null;
         leagueId: string | null;
      }>
   ) {
      return prisma.team.update({
         where: { id },
         data,
         include: { league: true },
      });
   },

   delete(id: string) {
      return prisma.team.delete({ where: { id } });
   },

   upsertByApiId(data: {
      apiTeamId: number;
      name: string;
      logo?: string | null;
      leagueId?: string | null;
   }) {
      return prisma.team.upsert({
         where: { apiTeamId: data.apiTeamId },
         update: { leagueId: data.leagueId },
         create: {
            name: data.name,
            logo: data.logo,
            apiTeamId: data.apiTeamId,
            leagueId: data.leagueId ?? null,
         },
      });
   },
};
