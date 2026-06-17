import { prisma } from '../lib/prisma.js';
import { sportSrcService } from '../services/sportSrc.service.js';

async function main() {
   const today = new Date().toISOString().split('T')[0];
   const scores = await sportSrcService.getScores(today);

   const nameToId = new Map<string, number>();
   for (const m of scores) {
      if (m.league_id) nameToId.set(m.league, Number(m.league_id));
   }

   const leagues = await prisma.league.findMany({
      where: { apiLeagueId: null },
   });

   let updated = 0;
   for (const league of leagues) {
      const apiId = nameToId.get(league.name);
      if (!apiId) continue;

      try {
         await prisma.league.update({
            where: { id: league.id },
            data: { apiLeagueId: apiId },
         });
         updated++;
         console.log(`✓ ${league.name} → apiLeagueId ${apiId}`);
      } catch (err: any) {
         if (err.code === 'P2002') {
            console.warn(
               `⚠ Skipped ${league.name}: apiLeagueId ${apiId} already taken by another league`
            );
         } else {
            throw err;
         }
      }
   }

   console.log(`Backfilled ${updated}/${leagues.length} leagues`);
}

main()
   .catch(console.error)
   .finally(() => prisma.$disconnect());
