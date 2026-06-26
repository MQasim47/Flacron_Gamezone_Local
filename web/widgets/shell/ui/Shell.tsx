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

         {/* ── Header (real glass effect — translucent, not solid) ───── */}
         <header
            className={cn(
               'sticky top-0 z-50 transition-all duration-300 border-b',
               scrolled
                  ? 'bg-navy/60 backdrop-blur-2xl border-white/10 shadow-lg shadow-black/30'
                  : 'bg-navy/35 backdrop-blur-xl border-white/5'
            )}
         >
            <div className="container mx-auto px-4 py-3">
               <div className="flex items-center justify-between gap-3">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-3">
                     <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-white/10">
                        <Image
                           src="/logo.png"
                           width={40}
                           height={40}
                           alt="Flacron GameZone"
                           className="object-contain"
                        />
                     </span>
                  </Link>

                  {/* Desktop Nav — compact glass pill, not spread across the bar */}
                  <nav className="hidden md:flex items-center gap-0.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5">
                     {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                           key={href}
                           href={href}
                           className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap',
                              isActive(href)
                                 ? 'bg-brand text-white shadow-md shadow-brand/30'
                                 : 'text-slate-200 hover:text-white hover:bg-white/10'
                           )}
                        >
                           <Icon className="w-3.5 h-3.5" />
                           {label}
                        </Link>
                     ))}
                     {isAuthenticated && (
                        <Link
                           href={isAdmin ? '/admin' : '/dashboard'}
                           className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap',
                              isActive('/dashboard') || isActive('/admin')
                                 ? 'bg-brand text-white shadow-md shadow-brand/30'
                                 : 'text-slate-200 hover:text-white hover:bg-white/10'
                           )}
                        >
                           <LayoutDashboard className="w-3.5 h-3.5" />
                           {isAdmin ? 'Admin' : 'Dashboard'}
                        </Link>
                     )}
                  </nav>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                     <button
                        onClick={() => setSearchOpen(true)}
                        className="hidden md:flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105"
                     >
                        <Search className="w-4 h-4" />
                        Search
                     </button>
                     <button
                        onClick={() => setSearchOpen(true)}
                        className="md:hidden p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
                     >
                        <Search className="w-5 h-5" />
                     </button>

                     <Link href="/contact" className="hidden sm:block">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors">
                           <Mail className="w-4 h-4" />
                        </button>
                     </Link>

                     {isAuthenticated ? (
                        <button
                           onClick={logout}
                           className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors text-slate-200"
                        >
                           <LogOut className="w-4 h-4" />
                           Logout
                        </button>
                     ) : (
                        <div className="hidden sm:flex items-center gap-2">
                           <Link href="/login">
                              <button className="px-3 py-2 text-sm font-medium hover:bg-brand/10 hover:text-brand rounded-xl transition-colors text-slate-200">
                                 Sign In
                              </button>
                           </Link>
                           <Link href="/signup">
                              <button className="px-4 py-2 text-sm font-bold bg-brand hover:bg-brand-hover text-white rounded-full shadow-lg shadow-brand/20 transition-all">
                                 Go Premium
                              </button>
                           </Link>
                        </div>
                     )}

                     <button
                        onClick={() => setMobileOpen((o) => !o)}
                        className="md:hidden p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
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
                  <nav className="md:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-1 animate-in slide-in-from-top-4 duration-300">
                     {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                           key={href}
                           href={href}
                           className={cn(
                              'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all',
                              isActive(href)
                                 ? 'bg-brand text-white'
                                 : 'text-slate-200 hover:text-white hover:bg-white/5'
                           )}
                        >
                           <Icon className="w-4 h-4" />
                           {label}
                        </Link>
                     ))}
                     {isAuthenticated && (
                        <Link
                           href={isAdmin ? '/admin' : '/dashboard'}
                           className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                           <LayoutDashboard className="w-4 h-4" />
                           {isAdmin ? 'Admin' : 'Dashboard'}
                        </Link>
                     )}
                     <Link
                        href="/contact"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                     >
                        <Mail className="w-4 h-4" />
                        Contact
                     </Link>
                     <div className="h-px bg-white/10 my-1" />
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
                              className="px-4 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                           >
                              Sign In
                           </Link>
                           <Link
                              href="/signup"
                              className="px-4 py-3 text-sm font-bold text-white bg-brand hover:bg-brand-hover rounded-xl transition-all mx-4 text-center"
                           >
                              Go Premium
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
         <footer className="bg-navy border-t border-navy-light/30 mt-12">
            <div className="container mx-auto px-4 py-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                  {/* Brand */}
                  <div>
                     <Link href="/" className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-white/10">
                           <Image
                              src="/logo.png"
                              width={40}
                              height={40}
                              alt="Flacron GameZone"
                              className="object-contain"
                           />
                        </span>
                        <div className="font-black leading-none">
                           <span className="text-white">Flacron</span>
                           {/* ... */}
                        </div>
                     </Link>
                     <p className="text-sm text-slate-300 mb-4">
                        Your ultimate destination for live football matches and
                        comprehensive league coverage.
                     </p>
                     <div className="flex gap-2">
                        {[Twitter, Facebook, Github].map((Icon, i) => (
                           <a
                              key={i}
                              href="#"
                              className="w-8 h-8 bg-white/5 hover:bg-brand/20 border border-white/10 hover:border-brand/50 rounded-lg flex items-center justify-center transition-all group"
                           >
                              <Icon className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
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
                                    className="text-slate-300 hover:text-brand transition-colors"
                                 >
                                    {label}
                                 </Link>
                              </li>
                           ))}
                        </ul>
                     </div>
                  ))}
               </div>

               <div className="border-t border-navy-light/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-400">
                     &copy; {new Date().getFullYear()} Flacron GameZone. All
                     rights reserved.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                     <span>Made with</span>
                     <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                     <span>for football fans</span>
                     <Globe className="w-4 h-4 text-brand" />
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
}
