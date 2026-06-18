import { prisma } from '../lib/prisma.js';

export const passwordResetTokenRepository = {
   create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
      return prisma.passwordResetToken.create({ data });
   },

   findValidByHash(tokenHash: string) {
      return prisma.passwordResetToken.findFirst({
         where: {
            tokenHash,
            usedAt: null,
            expiresAt: { gt: new Date() },
         },
      });
   },

   markUsed(id: string) {
      return prisma.passwordResetToken.update({
         where: { id },
         data: { usedAt: new Date() },
      });
   },

   /** Invalidate any previously-issued, still-valid tokens for a user before issuing a new one. */
   invalidateAllForUser(userId: string) {
      return prisma.passwordResetToken.updateMany({
         where: { userId, usedAt: null },
         data: { usedAt: new Date() },
      });
   },

   deleteExpired() {
      return prisma.passwordResetToken.deleteMany({
         where: { expiresAt: { lt: new Date() } },
      });
   },
};
