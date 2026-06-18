import { prisma } from '../lib/prisma.js';
import { Role } from '@prisma/client';

export const userRepository = {
   findById(id: string) {
      return prisma.user.findUnique({
         where: { id },
         include: { subscription: true },
      });
   },

   findByEmail(email: string) {
      return prisma.user.findUnique({ where: { email } });
   },

   findByEmailWithSubscription(email: string) {
      return prisma.user.findUnique({
         where: { email },
         include: { subscription: true },
      });
   },

   findByGoogleId(googleId: string) {
      return prisma.user.findUnique({
         where: { googleId },
         include: { subscription: true },
      });
   },

   create(data: { email: string; password: string }) {
      return prisma.user.create({ data });
   },

   createWithGoogle(data: {
      email: string;
      googleId: string;
      name?: string | null;
      avatar?: string | null;
   }) {
      return prisma.user.create({
         data: {
            email: data.email,
            googleId: data.googleId,
            name: data.name ?? null,
            avatar: data.avatar ?? null,
            password: null,
         },
      });
   },

   linkGoogleId(
      userId: string,
      data: { googleId: string; name?: string | null; avatar?: string | null }
   ) {
      return prisma.user.update({
         where: { id: userId },
         data: {
            googleId: data.googleId,
            name: data.name ?? undefined,
            avatar: data.avatar ?? undefined,
         },
      });
   },

   updatePassword(userId: string, passwordHash: string) {
      return prisma.user.update({
         where: { id: userId },
         data: { password: passwordHash },
      });
   },

   /** Legacy — returns all users (no pagination). Prefer findPaginated. */
   findAll() {
      return prisma.user.findMany({
         include: { subscription: true },
         orderBy: { createdAt: 'desc' },
      });
   },

   async findPaginated({
      page,
      limit,
      search,
   }: {
      page: number;
      limit: number;
      search?: string;
   }) {
      const skip = (page - 1) * limit;
      const where = search
         ? { email: { contains: search, mode: 'insensitive' as const } }
         : {};

      const [data, total] = await Promise.all([
         prisma.user.findMany({
            where,
            include: { subscription: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
         }),
         prisma.user.count({ where }),
      ]);

      return { data, total };
   },

   update(id: string, data: { role?: string }) {
      return prisma.user.update({
         where: { id },
         // Cast role string to the Prisma-generated Role enum so TypeScript is satisfied
         data: {
            ...(data.role !== undefined && { role: data.role as Role }),
         },
         include: { subscription: true },
      });
   },

   delete(id: string) {
      return prisma.user.delete({ where: { id } });
   },
};
