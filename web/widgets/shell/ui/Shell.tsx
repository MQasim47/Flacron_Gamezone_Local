'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
   Menu,
   X,
   Search,
   Mail,
   LogOut,
   LayoutDashboard,
   Trophy,
   Play,
   Shield,
   Users,
   Tag,
   Zap,
   Twitter,
   Facebook,
   Github,
   Heart,
   Globe,
} from 'lucide-react';
import { SearchOverlay } from '@/features/search/ui/SearchOverlay';
import { useAuth } from '@/shared/hooks';
import { useScrolled } from '@/shared/hooks';
import { cn } from '@/shared/lib';

interface NavItem {
   href: string;
   label: string;
   icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
   { href: '/', label: 'Home', icon: Zap },
   { href: '/live', label: 'Live', icon: Play },
   { href: '/matches', label: 'Matches', icon: Trophy },
   { href: '/leagues', label: 'Leagues', icon: Shield },
   { href: '/teams', label: 'Teams', icon: Users },
   { href: '/pricing', label: 'Pricing', icon: Tag },
];

const FOOTER_LINKS = {
   Platform: [
      { href: '/live', label: 'Live Matches' },
      { href: '/matches', label: 'All Matches' },
      { href: '/leagues', label: 'Leagues' },
      { href: '/teams', label: 'Teams' },
   ],
   Account: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/login', label: 'Login' },
      { href: '/signup', label: 'Sign Up' },
   ],
   Legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/contact', label: 'Contact Us' },
   ],
};

export function Shell({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const scrolled = useScrolled(20);
   const { user, isAuthenticated, isAdmin, logout } = useAuth();
   const [mobileOpen, setMobileOpen] = useState(false);
   const [searchOpen, setSearchOpen] = useState(false);

   // Listen for programmatic search open
   useEffect(() => {
      const fn = () => setSearchOpen(true);
      window.addEventListener('fgz:open-search', fn as EventListener);
      return () =>
         window.removeEventListener('fgz:open-search', fn as EventListener);
   }, []);

   // Close mobile menu on route change
   useEffect(() => {
      setMobileOpen(false);
   }, [pathname]);

   const isActive = (href: string) =>
      href === '/' ? pathname === '/' : pathname.startsWith(href);

   return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
         <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
         />

         {/* ── Header ─────────────────────────────────────────────── */}
         <header
            className={cn(
               'sticky top-0 z-50 transition-all duration-300',
               scrolled
                  ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-lg'
                  : 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50'
            )}
         >
            <div className="container mx-auto px-4 py-4">
               <div className="flex items-center justify-between">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-3">
                     <Image
                        src="/logo.png"
                        width={48}
                        height={48}
                        alt="Flacron GameZone"
                        className="object-contain"
                     />
                  </Link>

                  {/* Desktop Nav */}
                  <nav className="hidden md:flex items-center gap-1">
                     {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                           key={href}
                           href={href}
                           className={cn(
                              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all',
                              isActive(href)
                                 ? 'text-blue-400 bg-blue-500/10'
                                 : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                           )}
                        >
                           <Icon className="w-4 h-4" />
                           {label}
                        </Link>
                     ))}
                     {isAuthenticated && (
                        <Link
                           href={isAdmin ? '/admin' : '/dashboard'}
                           className={cn(
                              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all',
                              isActive('/dashboard') || isActive('/admin')
                                 ? 'text-blue-400 bg-blue-500/10'
                                 : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                           )}
                        >
                           <LayoutDashboard className="w-4 h-4" />
                           {isAdmin ? 'Admin' : 'Dashboard'}
                        </Link>
                     )}
                  </nav>

                  {/* Right actions */}
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => setSearchOpen(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:shadow-cyan-500/40 hover:scale-105 transition-all"
                     >
                        <Search className="w-4 h-4" />
                        Search
                     </button>
                     <button
                        onClick={() => setSearchOpen(true)}
                        className="md:hidden p-2 hover:bg-blue-500/10 rounded-lg text-blue-400 transition-colors"
                     >
                        <Search className="w-5 h-5" />
                     </button>

                     <Link href="/contact" className="hidden sm:block">
                        <button className="p-2 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-white transition-colors">
                           <Mail className="w-4 h-4" />
                        </button>
                     </Link>

                     {isAuthenticated ? (
                        <button
                           onClick={logout}
                           className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors text-slate-300"
                        >
                           <LogOut className="w-4 h-4" />
                           Logout
                        </button>
                     ) : (
                        <div className="hidden sm:flex items-center gap-2">
                           <Link href="/login">
                              <button className="px-3 py-2 text-sm font-medium hover:bg-blue-500/10 hover:text-blue-400 rounded-xl transition-colors text-slate-300">
                                 Login
                              </button>
                           </Link>
                           <Link href="/signup">
                              <button className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-lg transition-all">
                                 Sign Up
                              </button>
                           </Link>
                        </div>
                     )}

                     <button
                        onClick={() => setMobileOpen((o) => !o)}
                        className="md:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                     >
                        {mobileOpen ? (
                           <X className="w-5 h-5" />
                        ) : (
                           <Menu className="w-5 h-5" />
                        )}
                     </button>
                  </div>
               </div>

               {/* Mobile Nav */}
               {mobileOpen && (
                  <nav className="md:hidden mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-1 animate-in slide-in-from-top-4 duration-300">
                     {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                           key={href}
                           href={href}
                           className={cn(
                              'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all',
                              isActive(href)
                                 ? 'text-blue-400 bg-blue-500/10'
                                 : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                           )}
                        >
                           <Icon className="w-4 h-4" />
                           {label}
                        </Link>
                     ))}
                     {isAuthenticated && (
                        <Link
                           href={isAdmin ? '/admin' : '/dashboard'}
                           className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                        >
                           <LayoutDashboard className="w-4 h-4" />
                           {isAdmin ? 'Admin' : 'Dashboard'}
                        </Link>
                     )}
                     <Link
                        href="/contact"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                     >
                        <Mail className="w-4 h-4" />
                        Contact
                     </Link>
                     <div className="h-px bg-slate-700/50 my-1" />
                     {isAuthenticated ? (
                        <button
                           onClick={logout}
                           className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                        >
                           <LogOut className="w-4 h-4" />
                           Logout
                        </button>
                     ) : (
                        <>
                           <Link
                              href="/login"
                              className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                           >
                              Login
                           </Link>
                           <Link
                              href="/signup"
                              className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                           >
                              Sign Up
                           </Link>
                        </>
                     )}
                  </nav>
               )}
            </div>
         </header>

         {/* ── Main ───────────────────────────────────────────────── */}
         <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

         {/* ── Footer ─────────────────────────────────────────────── */}
         <footer className="bg-slate-900/50 border-t border-slate-800/50 mt-12">
            <div className="container mx-auto px-4 py-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                  {/* Brand */}
                  <div>
                     <Link href="/" className="flex items-center gap-3 mb-4">
                        <Image
                           src="/logo.png"
                           width={48}
                           height={48}
                           alt="Flacron GameZone"
                           className="object-contain"
                        />
                        <div className="font-black leading-none">
                           <span className="text-white">Flacron</span>
                           <br />
                           <span className="text-sm bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                              GameZone
                           </span>
                        </div>
                     </Link>
                     <p className="text-sm text-slate-400 mb-4">
                        Your ultimate destination for live football matches and
                        comprehensive league coverage.
                     </p>
                     <div className="flex gap-2">
                        {[Twitter, Facebook, Github].map((Icon, i) => (
                           <a
                              key={i}
                              href="#"
                              className="w-8 h-8 bg-slate-800/50 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/50 rounded-lg flex items-center justify-center transition-all group"
                           >
                              <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                           </a>
                        ))}
                     </div>
                  </div>

                  {/* Footer links */}
                  {Object.entries(FOOTER_LINKS).map(([section, links]) => (
                     <div key={section}>
                        <h3 className="font-semibold mb-4 text-sm text-white">
                           {section}
                        </h3>
                        <ul className="space-y-2 text-sm">
                           {links.map(({ href, label }) => (
                              <li key={href}>
                                 <Link
                                    href={href}
                                    className="text-slate-400 hover:text-blue-400 transition-colors"
                                 >
                                    {label}
                                 </Link>
                              </li>
                           ))}
                        </ul>
                     </div>
                  ))}
               </div>

               <div className="border-t border-slate-800/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-500">
                     &copy; {new Date().getFullYear()} Flacron GameZone. All
                     rights reserved.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                     <span>Made with</span>
                     <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                     <span>for football fans</span>
                     <Globe className="w-4 h-4 text-blue-400" />
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
}
