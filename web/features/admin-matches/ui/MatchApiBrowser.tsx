'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
   X,
   Search,
   Download,
   Loader2,
   CheckSquare,
   Square,
   AlertCircle,
   RefreshCw,
   Calendar,
   ChevronDown,
} from 'lucide-react';
import { apiGet, apiPost } from '@/shared/api/base';
import type { League } from '@/entities/league/model/types';
import { Team } from '@/entities/team';

interface ApiMatch {
   apiFixtureId: number;
   leagueId: number;
   leagueName: string;
   leagueLogo?: string;
   homeTeam: { id: number; name: string; logo: string | null };
   awayTeam: { id: number; name: string; logo: string | null };
   kickoffTime: string;
   status: string;
   score: string | null;
   venue: string | null;
   round?: string;
   isFuture?: boolean;
}

interface MatchApiBrowserProps {
   isOpen: boolean;
   onClose: () => void;
   onImported: () => void;
   leagues: League[];
   teams: Team[];
}

const PAGE_SIZE = 100;

export function MatchApiBrowser({
   isOpen,
   onClose,
   onImported,
   leagues,
   teams,
}: MatchApiBrowserProps) {
   const [matches, setMatches] = useState<ApiMatch[]>([]);
   const [filtered, setFiltered] = useState<ApiMatch[]>([]);
   const [search, setSearch] = useState('');
   const [selectedLeagueId, setSelectedLeagueId] = useState('');
   const [selectedDate, setSelectedDate] = useState(
      () => new Date().toISOString().split('T')[0]
   );
   const [statusFilter, setStatusFilter] = useState('');
   const [loading, setLoading] = useState(false);
   const [loadingMore, setLoadingMore] = useState(false);
   const [importing, setImporting] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [selected, setSelected] = useState<Set<number>>(new Set());
   const [importResults, setImportResults] = useState<{
      success: number;
      skipped: number;
   } | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [hasMore, setHasMore] = useState(false);
   const [totalAvailable, setTotalAvailable] = useState<number | null>(null);

   // Track whether this is the very first mount after opening so we don't
   // double-fetch when the filter-change effect also fires on open.
   const didInitRef = useRef(false);

   const fetchPage = useCallback(
      async (page: number, append: boolean) => {
         if (page === 1) setLoading(true);
         else setLoadingMore(true);
         setError(null);

         try {
            const params = new URLSearchParams({
               page: String(page),
               limit: String(PAGE_SIZE),
            });
            if (selectedLeagueId) params.set('leagueId', selectedLeagueId);
            if (selectedDate) params.set('date', selectedDate);
            if (statusFilter) params.set('status', statusFilter);

            const data = await apiGet<{
               success: boolean;
               matches: ApiMatch[];
               pagination?: { total: number; hasMore: boolean };
               total?: number;
            }>(`/api/admin/matches/api?${params}`);

            const items = data.matches ?? [];
            const total = data.pagination?.total ?? data.total ?? null;

            if (append) {
               setMatches((prev) => {
                  const existing = new Set(prev.map((m) => m.apiFixtureId));
                  return [
                     ...prev,
                     ...items.filter((m) => !existing.has(m.apiFixtureId)),
                  ];
               });
            } else {
               setMatches(items);
               setImportResults(null);
               setSelected(new Set());
            }

            setHasMore(data.pagination?.hasMore ?? items.length === PAGE_SIZE);
            setTotalAvailable(total);
            setCurrentPage(page);
         } catch (e: any) {
            setError(e?.message || 'Failed to fetch matches from Football API');
         } finally {
            setLoading(false);
            setLoadingMore(false);
         }
      },
      [selectedLeagueId, selectedDate, statusFilter]
   );

   // ── Open / close: reset state ───────────────────────────────────────────────
   useEffect(() => {
      if (!isOpen) {
         didInitRef.current = false;
         return;
      }
      // Reset on open
      setSelected(new Set());
      setSearch('');
      setImportResults(null);
      setMatches([]);
      setFiltered([]);
      setCurrentPage(1);
      setHasMore(false);
      didInitRef.current = true;
      fetchPage(1, false);
   }, [isOpen, fetchPage]);

   // ── Auto-fetch when filters change (only while open) ───────────────────────
   // We skip the very first run (handled by the open effect above).
   const isFirstFilterRun = useRef(true);
   useEffect(() => {
      if (isFirstFilterRun.current) {
         isFirstFilterRun.current = false;
         return;
      }
      if (!isOpen) return;

      setMatches([]);
      setFiltered([]);
      setCurrentPage(1);
      setHasMore(false);
      setSelected(new Set());
      fetchPage(1, false);
   }, [selectedLeagueId, selectedDate, statusFilter, fetchPage]);

   useEffect(() => {
      if (isOpen) isFirstFilterRun.current = true;
   }, [isOpen]);

   // ── Client-side text search ────────────────────────────────────────────────
   useEffect(() => {
      const q = search.toLowerCase();
      setFiltered(
         q
            ? matches.filter(
                 (m) =>
                    m.homeTeam.name.toLowerCase().includes(q) ||
                    m.awayTeam.name.toLowerCase().includes(q) ||
                    m.leagueName.toLowerCase().includes(q)
              )
            : matches
      );
   }, [search, matches]);

   // ── Helpers ────────────────────────────────────────────────────────────────
   const toggleSelect = (id: number) => {
      setSelected((prev) => {
         const next = new Set(prev);
         if (next.has(id)) next.delete(id);
         else next.add(id);
         return next;
      });
   };

   const toggleAll = () => {
      if (selected.size === filtered.length) {
         setSelected(new Set());
      } else {
         setSelected(new Set(filtered.map((m) => m.apiFixtureId)));
      }
   };

   const handleLoadMore = () => fetchPage(currentPage + 1, true);

   const mapStatus = (apiStatus: string): 'UPCOMING' | 'LIVE' | 'FINISHED' => {
      if (['1H', 'HT', '2H', 'ET', 'P', 'LIVE', 'INT'].includes(apiStatus))
         return 'LIVE';
      if (['FT', 'AET', 'PEN'].includes(apiStatus)) return 'FINISHED';
      return 'UPCOMING';
   };

   const handleImport = async () => {
      if (selected.size === 0) return;
      setImporting(true);
      setError(null);
      let success = 0;
      let skipped = 0;
      const missingLeagues: string[] = [];
      const missingTeams: string[] = [];

      for (const id of selected) {
         const match = matches.find((m) => m.apiFixtureId === id);
         if (!match) continue;

         const league = leagues.find(
            (l) => String(l.apiLeagueId) === String(match.leagueId)
         );

         const homeTeam = teams.find((h) => h.apiTeamId === match.homeTeam.id);
         const awayTeam = teams.find((h) => h.apiTeamId === match.awayTeam.id);

         if (!league) {
            if (!missingLeagues.includes(match.leagueName))
               missingLeagues.push(match.leagueName);
            skipped++;
            continue;
         }

         if (!homeTeam || !awayTeam) {
            if (!homeTeam && !missingTeams.includes(match.homeTeam.name)) {
               missingTeams.push(match.homeTeam.name);
            }
            if (!awayTeam && !missingTeams.includes(match.awayTeam.name)) {
               missingTeams.push(match.awayTeam.name);
            }
            skipped++;
            continue;
         }

         try {
            await apiPost('/api/admin/matches', {
               apiFixtureId: match.apiFixtureId,
               leagueId: league.id,
               homeTeamId: String(homeTeam.id),
               awayTeamId: String(awayTeam.id),
               kickoffTime: match.kickoffTime,
               status: mapStatus(match.status),
               score: match.score || null,
               venue: match.venue || null,
            });
            success++;
         } catch {
            skipped++;
         }
      }

      setImporting(false);
      setImportResults({ success, skipped });

      if (missingLeagues.length > 0 || missingTeams.length > 0) {
         const leagueMsg =
            missingLeagues.length > 0
               ? `Leagues to add: ${missingLeagues.join(', ')}`
               : '';
         const teamMsg =
            missingTeams.length > 0
               ? `Teams to add: ${missingTeams.join(', ')}`
               : '';

         setError(
            `Partial completion. Please add the following to your database: ${[leagueMsg, teamMsg].filter(Boolean).join(' | ')}`
         );
      }

      setSelected(new Set());
      if (success > 0) onImported();
   };

   if (!isOpen) return null;

   const allFilteredSelected =
      filtered.length > 0 &&
      filtered.every((m) => selected.has(m.apiFixtureId));

   const formatDate = (d: string) =>
      new Intl.DateTimeFormat('en-GB', {
         day: '2-digit',
         month: 'short',
         hour: '2-digit',
         minute: '2-digit',
      }).format(new Date(d));

   const statusColors: Record<string, string> = {
      LIVE: 'bg-red-500/20 text-red-400',
      FINISHED: 'bg-green-500/20 text-green-400',
      UPCOMING: 'bg-brand/20 text-brand',
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => !importing && onClose()}
         />
         <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                     <Calendar className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                     <h2 className="text-lg font-bold">
                        Import Matches from API
                     </h2>
                     <p className="text-xs text-slate-500">
                        {loading
                           ? 'Fetching…'
                           : `${matches.length} matches loaded${totalAvailable ? ` of ${totalAvailable}` : ''}`}
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  disabled={importing}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
               >
                  <X className="w-4 h-4" />
               </button>
            </div>

            {/* Filters — changes auto-trigger a new fetch */}
            <div className="p-4 border-b border-slate-700/30 flex-shrink-0 space-y-3">
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                     <label className="block text-xs text-slate-500 mb-1">
                        Date
                     </label>
                     <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm"
                     />
                  </div>
                  <div>
                     <label className="block text-xs text-slate-500 mb-1">
                        Status
                     </label>
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm"
                     >
                        <option value="">All</option>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="LIVE">Live</option>
                        <option value="FINISHED">Finished</option>
                     </select>
                  </div>
                  <div className="col-span-2">
                     <label className="block text-xs text-slate-500 mb-1">
                        League{' '}
                     </label>
                     <select
                        value={selectedLeagueId}
                        onChange={(e) => setSelectedLeagueId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm"
                     >
                        <option value="">All Leagues (today)</option>
                        {leagues
                           .filter((l) => l.apiLeagueId)
                           .map((l) => (
                              <option key={l.id} value={String(l.apiLeagueId)}>
                                 {l.name}
                              </option>
                           ))}
                     </select>
                  </div>
               </div>

               {/* Text search + manual refresh */}
               <div className="flex gap-3">
                  <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search team or league…"
                        className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm"
                     />
                  </div>
                  <button
                     onClick={() => fetchPage(1, false)}
                     disabled={loading}
                     className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                     <RefreshCw
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                     />
                     Refresh
                  </button>
               </div>

               <div className="flex items-center justify-between text-sm">
                  <button
                     onClick={toggleAll}
                     disabled={loading || filtered.length === 0}
                     className="flex items-center gap-2 text-slate-400 hover:text-white"
                  >
                     {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-green-400" />
                     ) : (
                        <Square className="w-4 h-4" />
                     )}
                     {allFilteredSelected ? 'Deselect all' : 'Select all'} (
                     {filtered.length})
                  </button>
                  <span className="text-slate-500">
                     {selected.size} selected
                  </span>
               </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
               {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                     <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                     <p className="text-sm text-slate-400">Fetching matches…</p>
                  </div>
               )}

               {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                     <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                     <p className="text-sm text-red-400 font-medium">{error}</p>
                  </div>
               )}

               {importResults && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
                     ✅ Imported {importResults.success} match(es)
                     {importResults.skipped > 0 &&
                        `, ${importResults.skipped} skipped`}
                  </div>
               )}

               {!loading && filtered.length === 0 && matches.length > 0 && (
                  <p className="text-center py-8 text-slate-500">
                     No matches match your search
                  </p>
               )}

               {!loading && matches.length === 0 && !error && (
                  <p className="text-center py-8 text-slate-500">
                     {selectedLeagueId
                        ? 'No matches found for this league. Try changing the date or status filter.'
                        : 'No matches found. Try a different date.'}
                  </p>
               )}

               <div className="space-y-2">
                  {filtered.map((match) => {
                     const isSelected = selected.has(match.apiFixtureId);
                     const mapped = mapStatus(match.status);
                     return (
                        <button
                           key={match.apiFixtureId}
                           onClick={() => toggleSelect(match.apiFixtureId)}
                           className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                 ? 'bg-green-500/10 border-green-500/40'
                                 : 'bg-slate-800/30 border-slate-700/40 hover:bg-slate-800/50'
                           }`}
                        >
                           {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                           ) : (
                              <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                           )}
                           <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-[120px]">
                                 {match.homeTeam.logo && (
                                    <img
                                       src={match.homeTeam.logo}
                                       className="w-5 h-5"
                                       alt=""
                                    />
                                 )}
                                 <span className="text-sm truncate">
                                    {match.homeTeam.name}
                                 </span>
                              </div>
                              <span className="px-2 text-xs font-bold text-slate-500">
                                 {match.score || 'vs'}
                              </span>
                              <div className="flex items-center gap-1.5 min-w-[120px]">
                                 {match.awayTeam.logo && (
                                    <img
                                       src={match.awayTeam.logo}
                                       className="w-5 h-5"
                                       alt=""
                                    />
                                 )}
                                 <span className="text-sm truncate">
                                    {match.awayTeam.name}
                                 </span>
                              </div>
                           </div>
                           <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs text-slate-500 truncate max-w-[120px]">
                                 {match.leagueName}
                              </span>
                              <span
                                 className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${statusColors[mapped] || 'bg-slate-700 text-slate-400'}`}
                              >
                                 {match.status}
                              </span>
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                 {formatDate(match.kickoffTime)}
                              </span>
                           </div>
                        </button>
                     );
                  })}
               </div>

               {hasMore && !search && !loading && (
                  <div className="mt-4 flex justify-center">
                     <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm"
                     >
                        {loadingMore ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                           <ChevronDown className="w-4 h-4" />
                        )}
                        {loadingMore
                           ? 'Loading…'
                           : `Load More${totalAvailable ? ` (${totalAvailable - matches.length} remaining)` : ''}`}
                     </button>
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-700/50 flex-shrink-0">
               <button
                  onClick={onClose}
                  disabled={importing}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-sm"
               >
                  Close
               </button>
               <button
                  onClick={handleImport}
                  disabled={importing || selected.size === 0}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium disabled:opacity-50"
               >
                  {importing ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                     <Download className="w-4 h-4" />
                  )}
                  Import {selected.size} Match{selected.size !== 1 ? 'es' : ''}
               </button>
            </div>
         </div>
      </div>
   );
}
