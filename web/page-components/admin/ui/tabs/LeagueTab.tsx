'use client';

import { useState } from 'react';
import {
   Plus,
   Edit2,
   Trash2,
   RefreshCw,
   Download,
   Search,
   Globe,
} from 'lucide-react';
import Image from 'next/image';
import type { useLeagueAdmin } from '@/features/admin-leagues/hooks/useLeagueAdmin';
import type { League } from '@/shared/types';
import { PaginationControls } from '@/shared/ui/PaginationControls';

type AdminState = ReturnType<typeof useLeagueAdmin>;

interface Props {
   admin: AdminState;
   onConfirmDelete: (
      title: string,
      message: string,
      fn: () => Promise<boolean>
   ) => void;
}

const EMPTY_FORM = { name: '', country: '', logo: '', apiLeagueId: '' };
const ITEMS = 10;

export function LeagueTab({ admin, onConfirmDelete }: Props) {
   const [search, setSearch] = useState('');
   const [page, setPage] = useState(0);
   const [modal, setModal] = useState(false);
   const [editing, setEditing] = useState<League | null>(null);
   const [form, setForm] = useState(EMPTY_FORM);

   const filtered = admin.leagues.filter(
      (l) =>
         l.name.toLowerCase().includes(search.toLowerCase()) ||
         (l.country ?? '').toLowerCase().includes(search.toLowerCase())
   );
   const totalPages = Math.ceil(filtered.length / ITEMS);
   const paginated = filtered.slice(page * ITEMS, (page + 1) * ITEMS);

   const openAdd = () => {
      setEditing(null);
      setForm(EMPTY_FORM);
      setModal(true);
   };
   const openEdit = (l: League) => {
      setEditing(l);
      setForm({
         name: l.name,
         country: l.country ?? '',
         logo: l.logo ?? '',
         apiLeagueId: String(l.apiLeagueId ?? ''),
      });
      setModal(true);
   };

   const handleSave = async () => {
      const ok = await admin.save(form, editing?.id);
      if (ok) {
         setModal(false);
         setForm(EMPTY_FORM);
      }
   };

   return (
      <div className="space-y-4">
         {/* Toolbar */}
         <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input
                  value={search}
                  onChange={(e) => {
                     setSearch(e.target.value);
                     setPage(0);
                  }}
                  placeholder="Search leagues…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
               />
            </div>
            <button
               onClick={admin.bulkSync}
               disabled={admin.bulkSyncing}
               className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 hover:border-brand/50 rounded-xl text-sm transition-all disabled:opacity-50"
            >
               <RefreshCw
                  className={`w-4 h-4 ${admin.bulkSyncing ? 'animate-spin' : ''}`}
               />{' '}
               Bulk Sync
            </button>
            <button
               onClick={openAdd}
               className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand rounded-xl text-sm font-medium transition-all"
            >
               <Plus className="w-4 h-4" /> Add League
            </button>
         </div>

         {/* Table */}
         <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                     <th className="text-left px-4 py-3">Logo</th>
                     <th className="text-left px-4 py-3">Name</th>
                     <th className="text-left px-4 py-3 hidden sm:table-cell">
                        Country
                     </th>
                     <th className="text-right px-4 py-3">Actions</th>
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
                                       className="object-contain"
                                       style={{ height: 'auto' }}
                                    />
                                 ) : (
                                    <Globe className="w-4 h-4 text-slate-500" />
                                 )}
                              </div>
                           </td>
                           <td className="px-4 py-3 font-medium text-sm">
                              {league.name}
                           </td>
                           <td className="px-4 py-3 text-sm text-slate-400 hidden sm:table-cell">
                              {league.country ?? '—'}
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                 <button
                                    onClick={() => admin.sync(league.id)}
                                    disabled={admin.syncing === league.id}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                                 >
                                    <RefreshCw
                                       className={`w-3.5 h-3.5 text-slate-400 ${admin.syncing === league.id ? 'animate-spin' : ''}`}
                                    />
                                 </button>
                                 <button
                                    onClick={() => openEdit(league)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                                 >
                                    <Edit2 className="w-3.5 h-3.5 text-brand" />
                                 </button>
                                 <button
                                    onClick={() =>
                                       onConfirmDelete(
                                          'Delete League',
                                          `Delete "${league.name}"? This cannot be undone.`,
                                          () =>
                                             admin.remove(
                                                league.id,
                                                league.name
                                             )
                                       )
                                    }
                                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
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
               currentPage={page}
               totalPages={totalPages}
               onPageChange={setPage}
               itemsPerPage={ITEMS}
               totalItems={filtered.length}
            />
         )}

         {/* Modal */}
         {modal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => !admin.saving && setModal(false)}
               />
               <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
                  <h2 className="text-lg font-bold mb-5">
                     {editing ? 'Edit League' : 'Add League'}
                  </h2>
                  <div className="space-y-4">
                     {[
                        {
                           key: 'name' as const,
                           label: 'League Name',
                           placeholder: 'Premier League',
                        },
                        {
                           key: 'country' as const,
                           label: 'Country',
                           placeholder: 'England',
                        },
                        {
                           key: 'logo' as const,
                           label: 'Logo URL',
                           placeholder: 'https://…',
                        },
                        {
                           key: 'apiLeagueId' as const,
                           label: 'API League ID',
                           placeholder: '39',
                           type: 'number',
                        },
                     ].map(({ key, label, placeholder, type }) => (
                        <div key={key}>
                           <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                              {label}
                           </label>
                           <input
                              type={type ?? 'text'}
                              value={form[key]}
                              onChange={(e) =>
                                 setForm((f) => ({
                                    ...f,
                                    [key]: e.target.value,
                                 }))
                              }
                              placeholder={placeholder}
                              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
                           />
                        </div>
                     ))}
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                     <button
                        onClick={() => setModal(false)}
                        disabled={admin.saving}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-sm disabled:opacity-50"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSave}
                        disabled={admin.saving || !form.name.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand disabled:bg-brand/50 rounded-xl text-sm font-medium disabled:opacity-50"
                     >
                        {admin.saving ? (
                           <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : null}
                        {admin.saving ? 'Saving…' : 'Save'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
