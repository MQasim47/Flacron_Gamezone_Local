'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Image from 'next/image';
import type { useTeamAdmin } from '@/features/admin-teams/hooks/useTeamAdmin';
import type { League, Team } from '@/shared/types';
import { PaginationControls } from '@/shared/ui/PaginationControls';

type AdminState = ReturnType<typeof useTeamAdmin>;
const EMPTY = { name: '', leagueId: '', logo: '', apiTeamId: '' };
const ITEMS = 10;

interface Props {
   admin: AdminState;
   leagues: League[];
   onConfirmDelete: (
      title: string,
      message: string,
      fn: () => Promise<boolean>
   ) => void;
}

export function TeamTab({ admin, leagues, onConfirmDelete }: Props) {
   const [search, setSearch] = useState('');
   const [page, setPage] = useState(0);
   const [modal, setModal] = useState(false);
   const [editing, setEditing] = useState<Team | null>(null);
   const [form, setForm] = useState(EMPTY);

   const filtered = admin.teams.filter(
      (t) =>
         t.name.toLowerCase().includes(search.toLowerCase()) ||
         (t.league?.name ?? '').toLowerCase().includes(search.toLowerCase())
   );
   const totalPages = Math.ceil(filtered.length / ITEMS);
   const paginated = filtered.slice(page * ITEMS, (page + 1) * ITEMS);

   const openAdd = () => {
      setEditing(null);
      setForm(EMPTY);
      setModal(true);
   };
   const openEdit = (t: Team) => {
      setEditing(t);
      setForm({
         name: t.name,
         leagueId: t.leagueId ?? '',
         logo: t.logo ?? '',
         apiTeamId: String(t.apiTeamId ?? ''),
      });
      setModal(true);
   };

   const handleSave = async () => {
      const ok = await admin.save(form, editing?.id);
      if (ok) {
         setModal(false);
         setForm(EMPTY);
      }
   };

   return (
      <div className="space-y-4">
         <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input
                  value={search}
                  onChange={(e) => {
                     setSearch(e.target.value);
                     setPage(0);
                  }}
                  placeholder="Search teams…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
               />
            </div>
            <button
               onClick={openAdd}
               className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-all"
            >
               <Plus className="w-4 h-4" /> Add Team
            </button>
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
                                       className="object-contain"
                                       style={{ height: 'auto' }}
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
                           <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                 <button
                                    onClick={() => openEdit(team)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
                                 >
                                    <Edit2 className="w-3.5 h-3.5 text-brand" />
                                 </button>
                                 <button
                                    onClick={() =>
                                       onConfirmDelete(
                                          'Delete Team',
                                          `Delete "${team.name}"?`,
                                          () => admin.remove(team.id, team.name)
                                       )
                                    }
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
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

         {modal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => !admin.saving && setModal(false)}
               />
               <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
                  <h2 className="text-lg font-bold mb-5">
                     {editing ? 'Edit Team' : 'Add Team'}
                  </h2>
                  <div className="space-y-4">
                     {[
                        {
                           key: 'name' as const,
                           label: 'Team Name',
                           placeholder: 'Arsenal FC',
                        },
                        {
                           key: 'logo' as const,
                           label: 'Logo URL',
                           placeholder: 'https://…',
                        },
                        {
                           key: 'apiTeamId' as const,
                           label: 'API Team ID',
                           placeholder: '42',
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
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           League
                        </label>
                        <select
                           value={form.leagueId}
                           onChange={(e) =>
                              setForm((f) => ({
                                 ...f,
                                 leagueId: e.target.value,
                              }))
                           }
                           className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
                        >
                           <option value="">No league</option>
                           {leagues.map((l) => (
                              <option key={l.id} value={l.id}>
                                 {l.name}
                              </option>
                           ))}
                        </select>
                     </div>
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
                        className="px-4 py-2 bg-brand hover:bg-brand disabled:bg-brand/50 rounded-xl text-sm font-medium disabled:opacity-50"
                     >
                        {admin.saving ? 'Saving…' : 'Save'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
