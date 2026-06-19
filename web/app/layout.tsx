import type { Metadata } from 'next';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './globals.css';
import { Shell } from '@/widgets/shell/ui/Shell';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

const BASE_URL = 'https://flacrongamezone.com';

export const metadata: Metadata = {
   metadataBase: new URL(BASE_URL),
   title: {
      default: 'Flacron GameZone | Live Football Scores, Streams & Stats',
      template: '%s | Flacron GameZone',
   },
   description:
      'Watch live football matches, check real-time scores, follow Premier League, La Liga, Champions League, MLS and more. AI-powered match analysis and HD streams.',
   keywords: [
      'live football',
      'football live scores',
      'watch football online',
      'Premier League live',
      'La Liga live',
      'Champions League live',
      'MLS live',
      'Liga MX live',
      'Saudi Pro League',
      'football streaming',
      'live soccer scores',
      'football results',
      'Flacron GameZone',
   ],
   authors: [{ name: 'Flacron GameZone' }],
   creator: 'Flacron GameZone',
   publisher: 'Flacron GameZone',
   robots: {
      index: true,
      follow: true,
      googleBot: {
         index: true,
         follow: true,
         'max-video-preview': -1,
         'max-image-preview': 'large',
         'max-snippet': -1,
      },
   },
   openGraph: {
      type: 'website',
      locale: 'en_US',
      url: BASE_URL,
      siteName: 'Flacron GameZone',
      title: 'Flacron GameZone | Live Football Scores, Streams & Stats',
      description:
         'Watch live football matches, check real-time scores, follow Premier League, La Liga, Champions League and more.',
      images: [
         {
            url: `${BASE_URL}/og-image.png`,
            width: 1200,
            height: 630,
            alt: 'Flacron GameZone - Live Football',
         },
      ],
   },
   twitter: {
      card: 'summary_large_image',
      title: 'Flacron GameZone | Live Football',
      description:
         'Watch live football, real-time scores and AI match analysis.',
      images: [`${BASE_URL}/og-image.png`],
   },
   alternates: {
      canonical: BASE_URL,
   },
   verification: {
      // Add your Google Search Console verification code here after verifying
      google: 'IaIpsPSWml_uUJqTCHyQh1LDzQyXsuUWBTspqQLMhp4',
   },
   icons: {
      icon: '/icon.png',
   },
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en" suppressHydrationWarning={true}>
         <head>
            {/* Structured Data - Organization */}
            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                     '@context': 'https://schema.org',
                     '@type': 'Organization',
                     name: 'Flacron GameZone',
                     url: BASE_URL,
                     logo: `${BASE_URL}/logo.png`,
                     description:
                        'Live football scores, streams and AI match analysis',
                     sameAs: [],
                  }),
               }}
            />
            {/* Structured Data - WebSite with SearchAction */}
            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                     '@context': 'https://schema.org',
                     '@type': 'WebSite',
                     name: 'Flacron GameZone',
                     url: BASE_URL,
                     potentialAction: {
                        '@type': 'SearchAction',
                        target: {
                           '@type': 'EntryPoint',
                           urlTemplate: `${BASE_URL}/matches?q={search_term_string}`,
                        },
                        'query-input': 'required name=search_term_string',
                     },
                  }),
               }}
            />
         </head>
         <body
            className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
         >
            <GoogleOAuthProvider
               clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
            >
               <Shell>{children}</Shell>
            </GoogleOAuthProvider>
         </body>
      </html>
   );
}
