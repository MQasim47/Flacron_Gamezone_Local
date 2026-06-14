import { prisma } from '../lib/prisma.js';

export interface VenueUpsertData {
   name: string;
   city?: string | null;
   country?: string | null;
   image?: string | null;
   capacity?: number | null;
   lat?: number | null;
   lng?: number | null;
}

export const venueRepository = {
   /**
    * Upsert by name + city combo — same stadium won't be duplicated.
    */
   async upsertByNameAndCity(data: VenueUpsertData) {
      const existing = await prisma.venue.findFirst({
         where: {
            name: data.name,
            city: data.city ?? null,
         },
      });

      if (existing) {
         return prisma.venue.update({
            where: { id: existing.id },
            data: {
               country: data.country ?? existing.country,
               image: data.image ?? existing.image,
               capacity: data.capacity ?? existing.capacity,
               lat: data.lat ?? existing.lat,
               lng: data.lng ?? existing.lng,
            },
         });
      }

      return prisma.venue.create({ data });
   },

   findById(id: string) {
      return prisma.venue.findUnique({ where: { id } });
   },
};
