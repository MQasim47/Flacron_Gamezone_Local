'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Sparkles, Search } from 'lucide-react';
import type { useMatchAdmin } from '@/features/admin-matches/hooks/useMatchAdmin';
import type { League, Team, AdminMatch } from '@/shared/types';
import { PaginationControls } from '@/shared/ui/PaginationControls';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { formatDateTime } from '@/shared/lib/format';

type AdminState = ReturnType<typeof useMatchAdmin>;
const EMPTY = {
   homeTeamId: '',
   awayTeamId: '',
   leagueId: '',
   kickoffTime: '',
   venue: '',
   status: 'UPCOMING',
   score: '',
};

interface Props {
   admin: AdminState;
   leagues: League[];
   teams: Team[];
   onConfirmDelete: (
      title: string,
      message: string,
      fn: () => Promise<boolean>
   ) => void;
}

export function MatchTab({ admin, leagues, teams, onConfirmDelete }: Props) {
   const [modal, setModal] = useState(false);
   const [editing, setEditing] = useState<AdminMatch | null>(null);
   const [form, setForm] = useState(EMPTY);
   const [localSearch, setLocalSearch] = useState('');

   const filtered = admin.matches.filter((m) => {
      if (!localSearch) return true;
      const q = localSearch.toLowerCase();
      return (
         m.homeTeam.name.toLowerCase().includes(q) ||
         m.awayTeam.name.toLowerCase().includes(q) ||
         (m.league?.name ?? '').toLowerCase().includes(q)
      );
   });

   const openAdd = () => {
      setEditing(null);
      setForm(EMPTY);
      setModal(true);
   };
   const openEdit = (m: AdminMatch) => {
      setEditing(m);
      setForm({
         homeTeamId: m.homeTeam.id,
         awayTeamId: m.awayTeam.id,
         leagueId: m.league?.id ?? '',
         kickoffTime: new Date(m.kickoffTime).toISOString().slice(0, 16),
         venue: m.venue?.name ?? '',
         status: m.status,
         score: m.score ?? '',
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

   const set = (k: keyof typeof form, v: string) =>
      setForm((f) => ({ ...f, [k]: v }));

   return (
      <div className="space-y-4">
         <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search matches…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
               />
            </div>
            <select
               value={admin.filters.status}
               onChange={(e) => admin.setStatus(e.target.value)}
               className="px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
            >
               <option value="">All Statuses</option>
               <option value="UPCOMING">Upcoming</option>
               <option value="LIVE">Live</option>
               <option value="FINISHED">Finished</option>
            </select>
            <select
               value={admin.filters.leagueId}
               onChange={(e) => admin.setLeague(e.target.value)}
               className="px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
            >
               <option value="">All Leagues</option>
               {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                     {l.name}
                  </option>
               ))}
            </select>
            <button
               onClick={admin.sync}
               disabled={admin.syncing}
               className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 hover:border-brand/50 rounded-xl text-sm transition-all disabled:opacity-50"
            >
               <RefreshCw
                  className={`w-4 h-4 ${admin.syncing ? 'animate-spin' : ''}`}
               />{' '}
               Sync Live
            </button>
            <button
               onClick={openAdd}
               className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium transition-all"
            >
               <Plus className="w-4 h-4" /> Add Match
            </button>
         </div>

         <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                     <th className="text-left px-4 py-3">Match</th>
                     <th className="text-left px-4 py-3 hidden lg:table-cell">
                        League
                     </th>
                     <th className="text-left px-4 py-3 hidden md:table-cell">
                        Kickoff
                     </th>
                     <th className="text-left px-4 py-3">Status</th>
                     <th className="text-right px-4 py-3">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {filtered.length === 0 ? (
                     <tr>
                        <td
                           colSpan={5}
                           className="text-center py-12 text-slate-500"
                        >
                           No matches found
                        </td>
                     </tr>
                  ) : (
                     filtered.map((match) => (
                        <tr
                           key={match.id}
                           className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                        >
                           <td className="px-4 py-3">
                              <div className="font-medium text-sm">
                                 {match.homeTeam.name}{' '}
                                 <span className="text-slate-500 text-xs">
                                    vs
                                 </span>{' '}
                                 {match.awayTeam.name}
                              </div>
                              {match.score && (
                                 <div className="text-xs text-slate-400 mt-0.5">
                                    {match.score}
                                 </div>
                              )}
                           </td>
                           <td className="px-4 py-3 text-sm text-slate-400 hidden lg:table-cell">
                              {match.league?.name ?? '—'}
                           </td>
                           <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">
                              {formatDateTime(match.kickoffTime)}
                           </td>
                           <td className="px-4 py-3">
                              <StatusBadge status={match.status} size="sm" />
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                 <button
                                    onClick={() => admin.generateAI(match.id)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
                                    title="Generate AI"
                                 >
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                 </button>
                                 <button
                                    onClick={() => openEdit(match)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
                                 >
                                    <Edit2 className="w-3.5 h-3.5 text-brand" />
                                 </button>
                                 <button
                                    onClick={() =>
                                       onConfirmDelete(
                                          'Delete Match',
                                          `Delete "${match.homeTeam.name} vs ${match.awayTeam.name}"?`,
                                          () => admin.remove(match.id)
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

         {admin.totalPages > 1 && (
            <PaginationControls
               currentPage={admin.filters.page}
               totalPages={admin.totalPages}
               onPageChange={admin.setPage}
               itemsPerPage={admin.LIMIT}
               totalItems={admin.total}
            />
         )}

         {modal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
               <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => !admin.saving && setModal(false)}
               />
               <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 my-4 animate-in zoom-in-95 duration-200">
                  <h2 className="text-lg font-bold mb-5">
                     {editing ? 'Edit Match' : 'Add Match'}
                  </h2>
                  <div className="space-y-4">
                     {[
                        {
                           key: 'homeTeamId' as const,
                           label: 'Home Team',
                           options: teams,
                        },
                        {
                           key: 'awayTeamId' as const,
                           label: 'Away Team',
                           options: teams,
                        },
                        {
                           key: 'leagueId' as const,
                           label: 'League',
                           options: leagues,
                        },
                     ].map(({ key, label, options }) => (
                        <div key={key}>
                           <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                              {label}
                           </label>
                           <select
                              value={form[key]}
                              onChange={(e) => set(key, e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
                           >
                              <option value="">Select…</option>
                              {options.map((o) => (
                                 <option key={o.id} value={o.id}>
                                    {o.name}
                                 </option>
                              ))}
                           </select>
                        </div>
                     ))}
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           Kickoff Time
                        </label>
                        <input
                           type="datetime-local"
                           value={form.kickoffTime}
                           onChange={(e) => set('kickoffTime', e.target.value)}
                           className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           Venue
                        </label>
                        <input
                           type="text"
                           value={form.venue}
                           onChange={(e) => set('venue', e.target.value)}
                           placeholder="Old Trafford"
                           className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           Status
                        </label>
                        <select
                           value={form.status}
                           onChange={(e) => set('status', e.target.value)}
                           className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
                        >
                           <option value="UPCOMING">Upcoming</option>
                           <option value="LIVE">Live</option>
                           <option value="FINISHED">Finished</option>
                        </select>
                     </div>
                     {(form.status === 'LIVE' ||
                        form.status === 'FINISHED') && (
                        <div>
                           <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                              Score (e.g. 2-1)
                           </label>
                           <input
                              type="text"
                              value={form.score}
                              onChange={(e) => set('score', e.target.value)}
                              placeholder="0-0"
                              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
                           />
                        </div>
                     )}
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
                        disabled={
                           admin.saving ||
                           !form.homeTeamId ||
                           !form.awayTeamId ||
                           !form.kickoffTime
                        }
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
