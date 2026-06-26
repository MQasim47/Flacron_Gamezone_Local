// web/shared/lib/leagueCategories.ts
//
// Single source of truth for:
//  - which leagues count as "Major/Top Leagues" (and their display order)
//  - which of the 6 client-requested categories every other league falls into
//
// Colors/icons are intentionally NOT here — that's Part 8 (color scheme).
// This file only decides WHAT goes WHERE, not how it looks.

export type LeagueCategoryId =
   | 'top_european'
   | 'international_club'
   | 'americas'
   | 'africa'
   | 'asia_middle_east'
   | 'other';

export interface LeagueCategoryMeta {
   id: LeagueCategoryId;
   label: string;
   icon: string; // emoji placeholder, swap for real icons later if you want
}

export const CATEGORY_ORDER: LeagueCategoryId[] = [
   'top_european',
   'international_club',
   'americas',
   'africa',
   'asia_middle_east',
   'other',
];

export const LEAGUE_CATEGORY_META: Record<
   LeagueCategoryId,
   LeagueCategoryMeta
> = {
   top_european: {
      id: 'top_european',
      label: 'Top European Leagues',
      icon: '🇪🇺',
   },
   international_club: {
      id: 'international_club',
      label: 'International Club Competitions',
      icon: '🏆',
   },
   americas: { id: 'americas', label: 'Americas', icon: '🌎' },
   africa: { id: 'africa', label: 'Africa', icon: '🌍' },
   asia_middle_east: {
      id: 'asia_middle_east',
      label: 'Asia & Middle East',
      icon: '🌏',
   },
   other: { id: 'other', label: 'Other Live Leagues', icon: '⚽' },
};

export interface LeagueLike {
   id: string;
   name: string;
   country?: string | null;
}

interface LeagueRule {
   key: string;
   category: LeagueCategoryId;
   /** Set ONLY for the client's "Major Leagues" list. Lower = shown earlier. */
   majorRank?: number;
   names: RegExp[];
   /** Optional country anchor — disambiguates things like "Serie A" (Italy vs Brazil) */
   countries?: RegExp[];
}

// ─────────────────────────────────────────────────────────────────────────
// IMPORTANT: order matters. More specific competitions (CAF CL, AFC CL,
// Copa Libertadores) must come BEFORE the generic "champions league" rule,
// or the generic rule will swallow them since it matches first.
// ─────────────────────────────────────────────────────────────────────────
const RULES: LeagueRule[] = [
   // ── Client's exact "Major Leagues" list, in their requested order ──────
   {
      key: 'premier_league',
      category: 'top_european',
      majorRank: 1,
      names: [/premier league/i],
      countries: [/england/i],
   },
   {
      key: 'la_liga',
      category: 'top_european',
      majorRank: 2,
      names: [/\bla ?liga\b/i],
   },
   {
      key: 'serie_a_italy',
      category: 'top_european',
      majorRank: 3,
      names: [/serie a\b/i],
      countries: [/italy/i],
   },
   {
      key: 'bundesliga',
      category: 'top_european',
      majorRank: 4,
      names: [/bundesliga/i],
      countries: [/germany/i],
   },
   {
      key: 'ligue_1',
      category: 'top_european',
      majorRank: 5,
      names: [/ligue 1/i],
   },

   {
      key: 'caf_champions_league',
      category: 'international_club',
      majorRank: 13,
      names: [/caf champions league/i],
   },
   {
      key: 'copa_libertadores',
      category: 'international_club',
      majorRank: 12,
      names: [/libertadores/i],
   },
   {
      key: 'uefa_champions_league',
      category: 'international_club',
      majorRank: 6,
      names: [/champions league/i],
   },
   {
      key: 'uefa_europa_league',
      category: 'international_club',
      majorRank: 7,
      names: [/europa league/i],
   },

   {
      key: 'mls',
      category: 'americas',
      majorRank: 8,
      names: [/major league soccer|\bmls\b/i],
   },
   { key: 'liga_mx', category: 'americas', majorRank: 9, names: [/liga mx/i] },
   {
      key: 'saudi_pro_league',
      category: 'asia_middle_east',
      majorRank: 10,
      names: [/saudi pro league/i],
   },
   {
      key: 'brasileirao',
      category: 'americas',
      majorRank: 11,
      names: [/brasileir[aã]o|campeonato brasileiro|brazil serie a/i],
   },

   // ── Other Top European (same category, not "major") ────────────────────
   { key: 'eredivisie', category: 'top_european', names: [/eredivisie/i] },
   {
      key: 'primeira_liga',
      category: 'top_european',
      names: [/primeira liga/i],
   },
   {
      key: 'scottish_premiership',
      category: 'top_european',
      names: [/scottish premiership/i],
   },
   { key: 'super_lig', category: 'top_european', names: [/s[uü]per lig/i] },

   // ── Other international club competitions ───────────────────────────────
   {
      key: 'conference_league',
      category: 'international_club',
      names: [/conference league/i],
   },
   {
      key: 'copa_sudamericana',
      category: 'international_club',
      names: [/sudamericana/i],
   },
   {
      key: 'caf_confed_cup',
      category: 'international_club',
      names: [/caf confederation cup/i],
   },
   {
      key: 'afc_champions_league',
      category: 'international_club',
      names: [/afc champions league/i],
   },

   // ── Other Americas ───────────────────────────────────────────────────────
   {
      key: 'argentina_primera',
      category: 'americas',
      names: [/primera divisi[oó]n/i],
      countries: [/argentina/i],
   },
   {
      key: 'colombia_primera_a',
      category: 'americas',
      names: [/primera a/i],
      countries: [/colombia/i],
   },
   {
      key: 'chile_primera',
      category: 'americas',
      names: [/primera divisi[oó]n/i],
      countries: [/chile/i],
   },

   // ── Africa ────────────────────────────────────────────────────────────────
   {
      key: 'egypt_premier',
      category: 'africa',
      names: [/egyptian premier league/i],
   },
   {
      key: 'south_africa_psl',
      category: 'africa',
      names: [/premiership/i],
      countries: [/south africa/i],
   },
   {
      key: 'nigeria_npfl',
      category: 'africa',
      names: [/nigeria.*league|npfl/i],
   },
   { key: 'morocco_botola', category: 'africa', names: [/botola/i] },

   // ── Asia & Middle East (non-major) ──────────────────────────────────────
   { key: 'j1_league', category: 'asia_middle_east', names: [/j1 league/i] },
   { key: 'k_league', category: 'asia_middle_east', names: [/k league/i] },
   {
      key: 'chinese_super_league',
      category: 'asia_middle_east',
      names: [/chinese super league/i],
   },
   { key: 'a_league', category: 'asia_middle_east', names: [/a-league/i] },
   {
      key: 'qatar_stars',
      category: 'asia_middle_east',
      names: [/qatar stars league/i],
   },
   {
      key: 'uae_pro_league',
      category: 'asia_middle_east',
      names: [/uae|emirates/i, /pro league/i],
   },
];

function ruleMatches(league: LeagueLike, rule: LeagueRule): boolean {
   const nameOk = rule.names.every((re) => re.test(league.name));
   if (!nameOk) return false;
   if (rule.countries?.length) {
      return rule.countries.some((re) => re.test(league.country ?? ''));
   }
   return true;
}

function resolveRule(league: LeagueLike): LeagueRule | null {
   return RULES.find((rule) => ruleMatches(league, rule)) ?? null;
}

export function categorizeLeague(league: LeagueLike): LeagueCategoryId {
   return resolveRule(league)?.category ?? 'other';
}

export function getMajorRank(league: LeagueLike): number | null {
   return resolveRule(league)?.majorRank ?? null;
}

export function isMajorLeague(league: LeagueLike): boolean {
   return getMajorRank(league) !== null;
}

export interface CategorizedLeagues<T extends LeagueLike> {
   majors: T[];
   categories: { meta: LeagueCategoryMeta; leagues: T[] }[];
}

/**
 * Splits leagues into the "Major Leagues" rail + the 6 category buckets.
 * Majors are pulled OUT of their category bucket so they don't show twice —
 * per the brief: "smaller leagues can still appear under Other Live Matches."
 */
export function getCategorizedLeagues<T extends LeagueLike>(
   leagues: T[]
): CategorizedLeagues<T> {
   const majors = leagues
      .filter(isMajorLeague)
      .sort((a, b) => (getMajorRank(a) ?? 999) - (getMajorRank(b) ?? 999));

   const majorIds = new Set(majors.map((l) => l.id));
   const remaining = leagues.filter((l) => !majorIds.has(l.id));

   const categories = CATEGORY_ORDER.map((catId) => ({
      meta: LEAGUE_CATEGORY_META[catId],
      leagues: remaining
         .filter((l) => categorizeLeague(l) === catId)
         .sort((a, b) => a.name.localeCompare(b.name)),
   })).filter((group) => group.leagues.length > 0);

   return { majors, categories };
}
