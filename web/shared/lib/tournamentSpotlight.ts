// Detects "is this a major one-off international tournament" so the
// homepage can spotlight it automatically — World Cup today, Euro/Copa
// América/AFCON tomorrow — without ever hardcoding a single name again.

const SPOTLIGHT_PATTERNS: RegExp[] = [
   /world cup/i,
   /uefa euro|european championship/i,
   /copa am[eé]rica/i,
   /africa cup of nations|afcon/i,
   /gold cup/i,
   /nations league finals/i,
   /olympic/i,
];

export function isSpotlightTournament(
   leagueName: string | undefined | null
): boolean {
   if (!leagueName) return false;
   return SPOTLIGHT_PATTERNS.some((re) => re.test(leagueName));
}
