'use client';

import { useState, useEffect, useCallback } from 'react';
import {
   X,
   Search,
   Download,
   Globe,
   Loader2,
   CheckSquare,
   Square,
   AlertCircle,
   RefreshCw,
   Trophy,
   ChevronDown,
} from 'lucide-react';
import { apiGet, apiPost } from '@/shared/api/base';

interface ApiLeague {
   apiLeagueId: number;
   name: string;
   logo: string | null;
   country: string;
}

interface LeagueApiBrowserProps {
   isOpen: boolean;
   onClose: () => void;
   onImported: () => void;
}

const PAGE_SIZE = 100;

export function LeagueApiBrowser({
   isOpen,
   onClose,
   onImported,
}: LeagueApiBrowserProps) {
   const [leagues, setLeagues] = useState<ApiLeague[]>([]);
   const [filtered, setFiltered] = useState<ApiLeague[]>([]);
   const [search, setSearch] = useState('');
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

   const fetchPage = useCallback(async (page: number, append: boolean) => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
         const data = await apiGet<{
            success: boolean;
            data: ApiLeague[];
            pagination: {
               total: number;
               hasMore: boolean;
               page: number;
               limit: number;
            };
         }>(`/api/admin/leagues/api?page=${page}&limit=${PAGE_SIZE}`);

         const items = data.data ?? [];
         const pagination = data.pagination as any;

         if (append) {
            setLeagues((prev) => {
               const existing = new Set(prev.map((l) => l.apiLeagueId));
               const newItems = items.filter(
                  (l) => !existing.has(l.apiLeagueId)
               );
               return [...prev, ...newItems];
            });
         } else {
            setLeagues(items);
            setImportResults(null);
         }

         setHasMore(pagination?.hasMore ?? items.length === PAGE_SIZE);
         setTotalAvailable(pagination?.total ?? null);
         setCurrentPage(page);
      } catch (e: any) {
         setError(e?.message || 'Failed to fetch leagues from Football API');
      } finally {
         setLoading(false);
         setLoadingMore(false);
      }
   }, []);

   useEffect(() => {
      if (isOpen) {
         setSelected(new Set());
         setSearch('');
         setImportResults(null);
         setCurrentPage(1);
         setHasMore(false);
         fetchPage(1, false);
      }
   }, [isOpen, fetchPage]);

   useEffect(() => {
      const q = search.toLowerCase();
      setFiltered(
         q
            ? leagues.filter(
                 (l) =>
                    l.name.toLowerCase().includes(q) ||
                    (l.country ?? '').toLowerCase().includes(q)
              )
            : leagues
      );
   }, [search, leagues]);

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
         setSelected(new Set(filtered.map((l) => l.apiLeagueId)));
      }
   };

   const handleLoadMore = () => {
      fetchPage(currentPage + 1, true);
   };

   const handleImport = async () => {
      if (selected.size === 0) return;
      setImporting(true);
      setError(null);
      let success = 0;
      let skipped = 0;

      for (const id of selected) {
         const league = leagues.find((l) => l.apiLeagueId === id);
         if (!league) continue;
         try {
            await apiPost('/api/admin/leagues', {
               name: league.name,
               country: league.country || undefined,
               logo: league.logo || undefined,
               apiLeagueId: league.apiLeagueId,
            });
            success++;
         } catch {
            skipped++;
         }
      }

      setImporting(false);
      setImportResults({ success, skipped });
      setSelected(new Set());
      if (success > 0) onImported();
   };

   if (!isOpen) return null;

   const allFilteredSelected =
      filtered.length > 0 && filtered.every((l) => selected.has(l.apiLeagueId));

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => !importing && onClose()}
         />
         <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center">
                     <Trophy className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                     <h2 className="text-lg font-bold">
                        Import Leagues from API
                     </h2>
                     <p className="text-xs text-slate-500">
                        {loading
                           ? 'Fetching from Football API…'
                           : totalAvailable != null
                             ? `${leagues.length} of ${totalAvailable} leagues loaded`
                             : `${leagues.length} leagues loaded`}
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  disabled={importing}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
               >
                  <X className="w-4 h-4" />
               </button>
            </div>

            {/* Search + controls */}
            <div className="p-4 border-b border-slate-700/30 flex-shrink-0 space-y-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Search by name or country…"
                     className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
                  />
               </div>
               <div className="flex items-center justify-between text-sm">
                  <button
                     onClick={toggleAll}
                     disabled={loading || filtered.length === 0}
                     className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                  >
                     {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand" />
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
                     <Loader2 className="w-8 h-8 text-brand animate-spin" />
                     <p className="text-sm text-slate-400">
                        Fetching from Football API…
                     </p>
                  </div>
               )}

               {error && !loading && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                     <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                     <div>
                        <p className="text-sm text-red-400 font-medium">
                           {error}
                        </p>
                        <button
                           onClick={() => fetchPage(1, false)}
                           className="mt-2 flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 transition-colors"
                        >
                           <RefreshCw className="w-3.5 h-3.5" /> Retry
                        </button>
                     </div>
                  </div>
               )}

               {importResults && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
                     ✅ Imported {importResults.success} league(s)
                     {importResults.skipped > 0 &&
                        `, ${importResults.skipped} already existed`}
                  </div>
               )}

               {!loading &&
                  !error &&
                  filtered.length === 0 &&
                  leagues.length > 0 && (
                     <div className="text-center py-12 text-slate-500">
                        No leagues match your search
                     </div>
                  )}

               {!loading && filtered.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     {filtered.map((league) => {
                        const isSelected = selected.has(league.apiLeagueId);
                        return (
                           <button
                              key={league.apiLeagueId}
                              onClick={() => toggleSelect(league.apiLeagueId)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                                 isSelected
                                    ? 'bg-brand/15 border-brand/50'
                                    : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/50'
                              }`}
                           >
                              <div className="flex-shrink-0">
                                 {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-brand" />
                                 ) : (
                                    <Square className="w-4 h-4 text-slate-600" />
                                 )}
                              </div>
                              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                 {league.logo ? (
                                    <img
                                       src={league.logo}
                                       alt={league.name}
                                       className="w-7 h-7 object-contain"
                                       onError={(e) => {
                                          (
                                             e.target as HTMLImageElement
                                          ).style.display = 'none';
                                       }}
                                    />
                                 ) : (
                                    <Globe className="w-4 h-4 text-slate-500" />
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium text-white truncate">
                                    {league.name}
                                 </p>
                                 {league.country && (
                                    <p className="text-xs text-slate-500 truncate">
                                       {league.country}
                                    </p>
                                 )}
                              </div>
                              <span className="text-xs text-slate-600 flex-shrink-0">
                                 #{league.apiLeagueId}
                              </span>
                           </button>
                        );
                     })}
                  </div>
               )}

               {/* Load More button */}
               {!loading && !error && hasMore && !search && (
                  <div className="mt-4 flex justify-center">
                     <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 hover:border-brand/40 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50"
                     >
                        {loadingMore ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                           <ChevronDown className="w-4 h-4" />
                        )}
                        {loadingMore
                           ? 'Loading…'
                           : `Load More${totalAvailable ? ` (${totalAvailable - leagues.length} remaining)` : ''}`}
                     </button>
                  </div>
               )}

               {search && hasMore && (
                  <p className="mt-3 text-center text-xs text-slate-500">
                     Clear search and scroll down to load more leagues from the
                     API.
                  </p>
               )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-700/50 flex-shrink-0">
               <button
                  onClick={onClose}
                  disabled={importing}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-sm transition-all disabled:opacity-50"
               >
                  Close
               </button>
               <button
                  onClick={handleImport}
                  disabled={importing || selected.size === 0}
                  className="flex items-center gap-2 px-5 py-2 bg-brand hover:bg-brand disabled:bg-brand/50 disabled:opacity-50 rounded-xl text-sm font-medium transition-all"
               >
                  {importing ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                     <Download className="w-4 h-4" />
                  )}
                  {importing
                     ? 'Importing…'
                     : `Import ${selected.size > 0 ? selected.size : ''} League${selected.size !== 1 ? 's' : ''}`}
               </button>
            </div>
         </div>
      </div>
   );
}
