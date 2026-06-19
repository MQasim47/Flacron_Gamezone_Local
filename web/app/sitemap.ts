import { MetadataRoute } from 'next';

const BASE_URL = 'https://flacrongamezone.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
   const now = new Date();

   // Static pages
   const staticPages: MetadataRoute.Sitemap = [
      {
         url: BASE_URL,
         lastModified: now,
         changeFrequency: 'always',
         priority: 1.0,
      },
      {
         url: `${BASE_URL}/live`,
         lastModified: now,
         changeFrequency: 'always',
         priority: 0.9,
      },
      {
         url: `${BASE_URL}/matches`,
         lastModified: now,
         changeFrequency: 'always',
         priority: 0.9,
      },
      {
         url: `${BASE_URL}/leagues`,
         lastModified: now,
         changeFrequency: 'daily',
         priority: 0.8,
      },
      {
         url: `${BASE_URL}/teams`,
         lastModified: now,
         changeFrequency: 'daily',
         priority: 0.8,
      },
      {
         url: `${BASE_URL}/pricing`,
         lastModified: now,
         changeFrequency: 'weekly',
         priority: 0.7,
      },
      {
         url: `${BASE_URL}/contact`,
         lastModified: now,
         changeFrequency: 'monthly',
         priority: 0.5,
      },
      {
         url: `${BASE_URL}/privacy`,
         lastModified: now,
         changeFrequency: 'monthly',
         priority: 0.3,
      },
      {
         url: `${BASE_URL}/terms`,
         lastModified: now,
         changeFrequency: 'monthly',
         priority: 0.3,
      },
   ];

   // Fetch dynamic pages from your API
   let leaguePages: MetadataRoute.Sitemap = [];
   let teamPages: MetadataRoute.Sitemap = [];
   let matchPages: MetadataRoute.Sitemap = [];

   try {
      const API_BASE =
         process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

      // Leagues
      const leaguesRes = await fetch(`${API_BASE}/api/leagues`, {
         next: { revalidate: 3600 },
      });
      if (leaguesRes.ok) {
         const data = await leaguesRes.json();
         const leagues = data.leagues ?? [];
         leaguePages = leagues.map((league: { id: string }) => ({
            url: `${BASE_URL}/leagues/${league.id}`,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 0.7,
         }));
      }

      // Teams
      const teamsRes = await fetch(`${API_BASE}/api/teams?limit=500`, {
         next: { revalidate: 3600 },
      });
      if (teamsRes.ok) {
         const teamsData = await teamsRes.json();
         const teams = Array.isArray(teamsData)
            ? teamsData
            : (teamsData.teams ?? []);
         teamPages = teams.map((team: { id: string }) => ({
            url: `${BASE_URL}/teams/${team.id}`,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 0.6,
         }));
      }

      // Recent/upcoming matches
      const matchesRes = await fetch(`${API_BASE}/api/matches?limit=200`, {
         next: { revalidate: 1800 },
      });
      if (matchesRes.ok) {
         const matchesData = await matchesRes.json();
         const matches = Array.isArray(matchesData)
            ? matchesData
            : (matchesData.matches ?? []);
         matchPages = matches.map((match: { id: string }) => ({
            url: `${BASE_URL}/match/${match.id}`,
            lastModified: now,
            changeFrequency: 'always' as const,
            priority: 0.8,
         }));
      }
   } catch {
      // If API is down during build, sitemap still works with static pages
   }

   return [...staticPages, ...leaguePages, ...teamPages, ...matchPages];
}
