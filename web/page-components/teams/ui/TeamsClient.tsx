'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/shared/api/base';
import { PaginationControls } from '@/shared/ui/PaginationControls';
import {
   Search,
   Trophy,
   Users,
   Shield,
   Award,
   Zap,
   Target,
   AlertCircle,
   RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 12;

interface Team {
   id: string;
   name: string;
   logo: string | null;
   matches?: number;
   wins?: number;
   league?: { name: string } | null;
}

interface Props {
   initialTeams: Team[];
}

export function TeamsClient({ initialTeams }: Props) {
   const [q, setQ] = useState('');
   const [teams, setTeams] = useState<Team[]>(initialTeams);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [currentPage, setCurrentPage] = useState(0);
   const [brokenLogos, setBrokenLogos] = useState<Set<string>>(new Set());

   async function load() {
      setIsLoading(true);
      setError(null);
      try {
         const data = await apiGet<Team[]>(`/api/teams`);
         setTeams(data);
      } catch (error) {
         console.error('Failed to load teams:', error);
         setError(
            error instanceof Error ? error.message : 'Failed to load teams'
         );
      } finally {
         setIsLoading(false);
      }
   }

   // Re-fetch on client for freshness
   useEffect(() => {
      load();
   }, []);

   // Reset page on search
   useEffect(() => {
      setCurrentPage(0);
   }, [q]);

   const filteredTeams = useMemo(
      () =>
         teams.filter(
            (t) =>
               t.name.toLowerCase().includes(q.toLowerCase()) ||
               (t.league?.name || '').toLowerCase().includes(q.toLowerCase())
         ),
      [teams, q]
   );

   const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
   const paginatedTeams = filteredTeams.slice(
      currentPage * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
   );

   const totalMatches = Math.floor(
      teams.reduce((acc, t) => acc + (t.matches || 0), 0) / 2
   );
   const totalWins = teams.reduce((acc, t) => acc + (t.wins || 0), 0);

   const renderGrid = () => {
      // Error state — always replace grid regardless of stale data
      if (error) {
         return (
            <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-red-500/20">
               <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-xl" />
                  <div className="relative w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-red-500/30">
                     <AlertCircle className="w-10 h-10 text-red-400" />
                  </div>
               </div>
               <h3 className="text-lg font-semibold text-slate-300 mb-2">
                  Failed to Load Teams
               </h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                  {error}
               </p>
               <button
                  onClick={load}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand/20 hover:bg-brand/30 border border-brand/30 text-brand rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
               >
                  <RefreshCw
                     className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  {isLoading ? 'Retrying...' : 'Retry'}
               </button>
            </div>
         );
      }

      // Loading state — only show skeleton when there's no data at all
      if (isLoading && teams.length === 0) {
         return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
               {[...Array(12)].map((_, i) => (
                  <div
                     key={i}
                     className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-5 animate-pulse"
                  >
                     <div className="w-20 h-20 bg-slate-700/50 rounded-lg mb-3 mx-auto" />
                     <div className="h-3 bg-slate-700/50 rounded w-3/4 mx-auto mb-2" />
                     <div className="h-2 bg-slate-700/50 rounded w-1/2 mx-auto" />
                  </div>
               ))}
            </div>
         );
      }

      // Teams grid
      if (paginatedTeams.length > 0) {
         return (
            <div
               key={currentPage}
               className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
               {paginatedTeams.map((t, idx) => {
                  const winRate =
                     t.wins && t.matches
                        ? Math.round((t.wins / t.matches) * 100)
                        : 0;
                  const logoFailed = brokenLogos.has(t.id);

                  return (
                     <Link
                        key={t.id}
                        href={`/teams/${t.id}`}
                        className="group bg-gradient-to-b from-navy/40 to-navy-dark/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-brand/50 hover:shadow-xl hover:shadow-brand/10 transition-all duration-300 cursor-pointer relative overflow-hidden block"
                        style={{
                           animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both`,
                        }}
                     >
                        <div
                           className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                           style={{
                              background: `radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08), transparent 70%)`,
                           }}
                        />

                        {/* Team Logo */}
                        <div className="relative mb-4 mx-auto w-24 h-24">
                           <div className="relative group-hover:scale-110 transition-transform duration-300">
                              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center p-3 shadow-xl group-hover:shadow-2xl group-hover:border-brand/30 transition-all">
                                 {t.logo && !logoFailed ? (
                                    <img
                                       src={t.logo}
                                       alt={t.name}
                                       className="w-full h-full object-contain"
                                       onError={() => {
                                          setBrokenLogos((prev) =>
                                             new Set(prev).add(t.id)
                                          );
                                       }}
                                    />
                                 ) : null}
                                 <div
                                    className="w-full h-full flex items-center justify-center font-bold text-3xl text-brand"
                                    style={{
                                       display:
                                          t.logo && !logoFailed
                                             ? 'none'
                                             : 'flex',
                                    }}
                                 >
                                    {t.name.substring(0, 2).toUpperCase()}
                                 </div>
                              </div>

                              {t.wins && t.wins > 0 ? (
                                 <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-0.5">
                                    <Trophy className="w-3 h-3" />
                                    {t.wins}
                                 </div>
                              ) : null}
                           </div>
                        </div>

                        {/* Team Info */}
                        <div className="relative z-10 text-center space-y-1.5">
                           <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-brand transition-colors duration-200">
                              {t.name}
                           </h3>

                           <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                              <Award className="w-3 h-3" />
                              <span className="line-clamp-1">
                                 {t.league?.name || '—'}
                              </span>
                           </div>

                           <div className="flex justify-center gap-3 pt-2 text-xs border-t border-slate-700/50">
                              <div className="text-center">
                                 <div className="font-semibold text-white">
                                    {t.matches || 0}
                                 </div>
                                 <div className="text-slate-500 text-[10px]">
                                    Played
                                 </div>
                              </div>
                              <div className="text-center">
                                 <div className="font-semibold text-brand">
                                    {winRate}%
                                 </div>
                                 <div className="text-slate-500 text-[10px]">
                                    Win Rate
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="absolute inset-0 border border-brand/0 group-hover:border-brand/20 rounded-xl transition-all duration-300 pointer-events-none" />
                     </Link>
                  );
               })}
            </div>
         );
      }

      // Empty state
      return (
         <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-700/50">
            <div className="relative w-20 h-20 mx-auto mb-5">
               <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-brand/5 rounded-full blur-xl" />
               <div className="relative w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700/50">
                  <Users className="w-10 h-10 text-slate-600" />
               </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
               No Teams Found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
               {q
                  ? 'Try adjusting your search terms'
                  : 'Create teams in Admin to get started'}
            </p>
         </div>
      );
   };

   return (
      <>
         <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-dark via-navy to-navy-dark border border-slate-700/50 p-8 md:p-12">
               <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse-slow" />
               <div
                  className="absolute bottom-0 left-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl animate-pulse-slow"
                  style={{ animationDelay: '1s' }}
               />

               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1 space-y-4">
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full text-sm font-medium text-brand">
                        <Zap className="w-4 h-4" />
                        <span>Live Tournament</span>
                     </div>

                     <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        <span className="bg-gradient-to-r from-white via-brand-light to-brand bg-clip-text text-transparent">
                           Compete with the Best
                        </span>
                     </h1>

                     <p className="text-slate-400 text-lg max-w-2xl">
                        Browse all competing teams, track their performance, and
                        follow the action in real-time.
                     </p>

                     <div className="flex flex-wrap gap-4 sm:gap-6 pt-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
                              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
                           </div>
                           <div>
                              <div className="text-xl sm:text-2xl font-bold text-white">
                                 {teams.length}
                              </div>
                              <div className="text-xs sm:text-sm text-slate-400">
                                 Active Teams
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
                              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
                           </div>
                           <div>
                              <div className="text-xl sm:text-2xl font-bold text-white">
                                 {totalMatches}
                              </div>
                              <div className="text-xs sm:text-sm text-slate-400">
                                 Total Matches
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                           </div>
                           <div>
                              <div className="text-xl sm:text-2xl font-bold text-white">
                                 {totalWins}
                              </div>
                              <div className="text-xs sm:text-sm text-slate-400">
                                 Total Wins
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Search */}
                  <div className="w-full md:w-auto md:min-w-[320px]">
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                        <input
                           aria-label="Search teams or leagues"
                           className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 focus:bg-slate-800/70 transition-all duration-300 placeholder:text-slate-500"
                           placeholder="Search teams or leagues..."
                           value={q}
                           onChange={(e) => setQ(e.target.value)}
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Pagination Controls */}
            {!error && filteredTeams.length > ITEMS_PER_PAGE && (
               <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredTeams.length}
               />
            )}

            {renderGrid()}
         </div>

         <style jsx>{`
            @keyframes fadeInUp {
               from {
                  opacity: 0;
                  transform: translateY(20px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            @keyframes pulse-slow {
               0%,
               100% {
                  opacity: 0.3;
               }
               50% {
                  opacity: 0.5;
               }
            }
            .animate-pulse-slow {
               animation: pulse-slow 4s ease-in-out infinite;
            }
         `}</style>
      </>
   );
}
