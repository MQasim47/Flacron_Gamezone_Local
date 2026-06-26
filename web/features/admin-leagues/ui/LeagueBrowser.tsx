'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
   Search,
   Plus,
   Edit2,
   Trash2,
   RefreshCw,
   Globe,
   ChevronDown,
   ChevronUp,
   Download,
} from 'lucide-react';
import type { League } from '@/entities/league/model/types';
import { PaginationControls } from '@/shared/ui/PaginationControls';

interface LeagueBrowserProps {
   leagues: League[];
   onEdit: (league: League) => void;
   onDelete: (league: League) => void;
   onAdd: () => void; // opens manual form
   onImportFromApi: () => void; // opens API browser
   onSync: (id: string) => void;
   onBulkSync: () => void;
   syncing: string | null;
   bulkSyncing: boolean;
}

const ITEMS_PER_PAGE = 10;

export function LeagueBrowser({
   leagues,
   onEdit,
   onDelete,
   onAdd,
   onImportFromApi,
   onSync,
   onBulkSync,
   syncing,
   bulkSyncing,
}: LeagueBrowserProps) {
   const [search, setSearch] = useState('');
   const [sortField, setSortField] = useState<'name' | 'country'>('name');
   const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
   const [currentPage, setCurrentPage] = useState(0);

   const filtered = leagues
      .filter(
         (l) =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            (l.country ?? '').toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
         const va = (a[sortField] ?? '').toLowerCase();
         const vb = (b[sortField] ?? '').toLowerCase();
         return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });

   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
   const paginated = filtered.slice(
      currentPage * ITEMS_PER_PAGE,
      (currentPage + 1) * ITEMS_PER_PAGE
   );

   const toggleSort = (field: 'name' | 'country') => {
      if (sortField === field)
         setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      else {
         setSortField(field);
         setSortDir('asc');
      }
      setCurrentPage(0);
   };

   const SortIcon = ({ field }: { field: string }) =>
      sortField === field ? (
         sortDir === 'asc' ? (
            <ChevronUp className="w-3 h-3" />
         ) : (
            <ChevronDown className="w-3 h-3" />
         )
      ) : null;

   return (
      <div className="space-y-4">
         <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input
                  value={search}
                  onChange={(e) => {
                     setSearch(e.target.value);
                     setCurrentPage(0);
                  }}
                  placeholder="Search leagues…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
               />
            </div>
            <div className="flex gap-2">
               <button
                  onClick={onBulkSync}
                  disabled={bulkSyncing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 hover:border-brand/50 rounded-xl text-sm transition-all disabled:opacity-50"
               >
                  <RefreshCw
                     className={`w-4 h-4 ${bulkSyncing ? 'animate-spin' : ''}`}
                  />{' '}
                  Bulk Sync
               </button>
               {/* Import from API — primary CTA */}
               <button
                  onClick={onImportFromApi}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand/20"
               >
                  <Download className="w-4 h-4" /> Import from API
               </button>
               {/* Manual add — secondary */}
               <button
                  onClick={onAdd}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600/50 rounded-xl text-sm font-medium transition-all"
                  title="Add league manually"
               >
                  <Plus className="w-4 h-4" /> Manual
               </button>
            </div>
         </div>
         <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                     <th className="text-left px-4 py-3 font-medium">Logo</th>
                     <th
                        className="text-left px-4 py-3 font-medium cursor-pointer select-none"
                        onClick={() => toggleSort('name')}
                     >
                        <span className="flex items-center gap-1">
                           Name <SortIcon field="name" />
                        </span>
                     </th>
                     <th
                        className="text-left px-4 py-3 font-medium cursor-pointer select-none"
                        onClick={() => toggleSort('country')}
                     >
                        <span className="flex items-center gap-1">
                           <Globe className="w-3 h-3" /> Country{' '}
                           <SortIcon field="country" />
                        </span>
                     </th>
                     <th className="text-right px-4 py-3 font-medium">
                        Actions
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {paginated.length === 0 ? (
                     <tr>
                        <td
                           colSpan={4}
                           className="text-center py-12 text-slate-500"
                        >
                           No leagues found
                        </td>
                     </tr>
                  ) : (
                     paginated.map((league) => (
                        <tr
                           key={league.id}
                           className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                        >
                           <td className="px-4 py-3">
                              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                                 {league.logo ? (
                                    <Image
                                       src={league.logo}
                                       alt={league.name}
                                       width={32}
                                       height={32}
                                       style={{ height: 'auto' }}
                                       className="object-contain"
                                    />
                                 ) : (
                                    <Globe className="w-4 h-4 text-slate-500" />
                                 )}
                              </div>
                           </td>
                           <td className="px-4 py-3 font-medium text-sm">
                              {league.name}
                           </td>
                           <td className="px-4 py-3 text-sm text-slate-400">
                              {league.country ?? '—'}
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                 <button
                                    onClick={() => onSync(league.id)}
                                    disabled={syncing === league.id}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                                    title="Sync"
                                 >
                                    <RefreshCw
                                       className={`w-3.5 h-3.5 text-slate-400 ${syncing === league.id ? 'animate-spin' : ''}`}
                                    />
                                 </button>
                                 <button
                                    onClick={() => onEdit(league)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Edit"
                                 >
                                    <Edit2 className="w-3.5 h-3.5 text-brand" />
                                 </button>
                                 <button
                                    onClick={() => onDelete(league)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Delete"
                                 >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
         {totalPages > 1 && (
            <PaginationControls
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
               itemsPerPage={ITEMS_PER_PAGE}
               totalItems={filtered.length}
            />
         )}
         <p className="text-xs text-slate-500 text-right">
            {filtered.length} of {leagues.length} leagues
         </p>
      </div>
   );
}
