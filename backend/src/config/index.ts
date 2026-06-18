export const config = {
   port: Number(process.env.PORT ?? 4000),
   nodeEnv: process.env.NODE_ENV ?? 'development',
   isProduction: process.env.NODE_ENV === 'production',

   jwt: {
      secret: process.env.JWT_SECRET ?? 'dev_secret',
      expiresIn: '7d' as const,
   },

   cors: {
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
   },

   db: {
      url: process.env.DATABASE_URL ?? '',
   },

   upstash: {
      url: process.env.UPSTASH_REDIS_REST_URL ?? '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
   },

   stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY ?? '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
      prices: {
         monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',
         yearly: process.env.STRIPE_PRICE_YEARLY ?? '',
      },
   },

   football: {
      // Legacy api-football (kept for fallback)
      key: process.env.API_FOOTBALL_KEY ?? '',
      baseUrl:
         process.env.API_FOOTBALL_BASEURL ??
         'https://v3.football.api-sports.io',
      sportMonksKey: process.env.API_SPORT_MONKS_KEY ?? '',
      sportMonksBaseUrl:
         process.env.API_SPORT_MONKS_BASEURL ??
         'https://api.sportmonks.com/v3/football',
   },

   // SportSRC Enterprise — primary provider
   sportSrc: {
      key: process.env.SPORT_SRC_KEY ?? '',
      baseUrl: process.env.SPORT_SRC_BASEURL ?? 'https://api.sportsrc.org/v2',
   },

   // Entity Sport — additional deep data
   entitySport: {
      key: process.env.ENTITY_SPORT_KEY ?? '',
      baseUrl:
         process.env.ENTITY_SPORT_BASEURL ??
         'https://restapi.entitysport.com/v2',
   },

   // Which provider to use for live sync & match browsing
   // "sportsrc" | "api-football"
   footballDataProvider: (() => {
      const provider = process.env.FOOTBALL_DATA_PROVIDER ?? 'sportsrc';
      if (provider !== 'sportsrc' && provider !== 'api-football') {
         throw new Error(
            `Invalid FOOTBALL_DATA_PROVIDER: ${provider}. Must be "sportsrc" or "api-football"`
         );
      }
      return provider as 'sportsrc' | 'api-football';
   })(),

   ai: {
      openaiKey: process.env.OPENAI_API_KEY ?? '',
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
   },

   youtube: {
      apiKey: process.env.YOUTUBE_API_KEY ?? '',
   },

   google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
   },

   passwordReset: {
      ttlMinutes: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? 30),
      fromEmail:
         process.env.PASSWORD_RESET_FROM_EMAIL ?? 'noreply@flacrongamezone.com',
      fromName: process.env.PASSWORD_RESET_FROM_NAME ?? 'Flacron Gamezone',
   },

   brevo: {
      apiKey: process.env.BREVO_API_KEY ?? '',
   },
};

export function validateConfig() {
   if (config.nodeEnv === 'production' && config.jwt.secret === 'dev_secret') {
      throw new Error('JWT_SECRET must be set in production');
   }
   if (config.port <= 0 || Number.isNaN(config.port)) {
      throw new Error('PORT must be a valid positive number');
   }
   if (!config.db.url) {
      throw new Error('DATABASE_URL is required');
   }
}
