'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Plus, Edit2, Trash2, Download } from 'lucide-react';
import type { Team } from '@/entities/team/model/types';
import { PaginationControls } from '@/shared/ui/PaginationControls';

interface TeamBrowserProps {
   teams: Team[];
   onEdit: (team: Team) => void;
   onDelete: (team: Team) => void;
   onAdd: () => void; // manual form
   onImportFromApi: () => void; // API browser
}

const ITEMS_PER_PAGE = 10;

export function TeamBrowser({
   teams,
   onEdit,
   onDelete,
   onAdd,
   onImportFromApi,
}: TeamBrowserProps) {
   const [search, setSearch] = useState('');
   const [currentPage, setCurrentPage] = useState(0);

   const filtered = teams.filter(
      (t) =>
         t.name.toLowerCase().includes(search.toLowerCase()) ||
         (t.league?.name ?? '').toLowerCase().includes(search.toLowerCase())
   );

   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
   const paginated = filtered.slice(
      currentPage * ITEMS_PER_PAGE,
      (currentPage + 1) * ITEMS_PER_PAGE
   );

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
                  placeholder="Search teams…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
               />
            </div>
            <div className="flex gap-2">
               {/* Import from API — primary CTA */}
               <button
                  onClick={onImportFromApi}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/20"
               >
                  <Download className="w-4 h-4" /> Import from API
               </button>
               {/* Manual add — secondary */}
               <button
                  onClick={onAdd}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600/50 rounded-xl text-sm font-medium transition-all"
                  title="Add team manually"
               >
                  <Plus className="w-4 h-4" /> Manual
               </button>
            </div>
         </div>
         <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                     <th className="text-left px-4 py-3">Logo</th>
                     <th className="text-left px-4 py-3">Name</th>
                     <th className="text-left px-4 py-3 hidden sm:table-cell">
                        League
                     </th>
                     <th className="text-left px-4 py-3 hidden md:table-cell">
                        API ID
                     </th>
                     <th className="text-right px-4 py-3">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {paginated.length === 0 ? (
                     <tr>
                        <td
                           colSpan={5}
                           className="text-center py-12 text-slate-500"
                        >
                           No teams found
                        </td>
                     </tr>
                  ) : (
                     paginated.map((team) => (
                        <tr
                           key={team.id}
                           className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                        >
                           <td className="px-4 py-3">
                              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                                 {team.logo ? (
                                    <Image
                                       src={team.logo}
                                       alt={team.name}
                                       width={32}
                                       height={32}
                                       style={{ height: 'auto' }}
                                       className="object-contain"
                                    />
                                 ) : (
                                    <span className="text-xs font-bold text-slate-400">
                                       {team.name.slice(0, 2)}
                                    </span>
                                 )}
                              </div>
                           </td>
                           <td className="px-4 py-3 font-medium text-sm">
                              {team.name}
                           </td>
                           <td className="px-4 py-3 text-sm text-slate-400 hidden sm:table-cell">
                              {team.league?.name ?? '—'}
                           </td>
                           <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                              {team.apiTeamId ?? '—'}
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                 <button
                                    onClick={() => onEdit(team)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
                                    title="Edit"
                                 >
                                    <Edit2 className="w-3.5 h-3.5 text-brand" />
                                 </button>
                                 <button
                                    onClick={() => onDelete(team)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
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
            {filtered.length} of {teams.length} teams
         </p>
      </div>
   );
}
