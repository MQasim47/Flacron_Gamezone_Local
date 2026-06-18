import type { Metadata } from 'next';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './globals.css';
import { Shell } from '@/widgets/shell/ui/Shell';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export const metadata: Metadata = {
   title: 'FootballZone',
   description: 'Live scores, streams, AI summaries',
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en" suppressHydrationWarning={true}>
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
