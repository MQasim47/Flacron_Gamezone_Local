/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'media.api-sports.io',
         },
         {
            protocol: 'https',
            hostname: 'cdn.sportmonks.com',
         },
         { protocol: 'https', hostname: 'api.sportsrc.org' },
         { protocol: 'https', hostname: '*.sportsrc.org' },
      ],
   },
};
export default nextConfig;
