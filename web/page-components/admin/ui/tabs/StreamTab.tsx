'use client';

import { useState } from 'react';
import { Plus, Edit2, RefreshCw, PlayCircle } from 'lucide-react';
import type { useStreamAdmin } from '@/features/admin-streams/hooks/useStreamAdmin';
import type { AdminMatch } from '@/shared/types';
import { StatusBadge } from '@/shared/ui/StatusBadge';

type AdminState = ReturnType<typeof useStreamAdmin>;
const EMPTY = {
   matchId: '',
   type: 'EMBED' as 'EMBED' | 'NONE',
   provider: '',
   url: '',
   isActive: false,
};

export function StreamTab({ admin }: { admin: AdminState }) {
   const [modal, setModal] = useState(false);
   const [form, setForm] = useState(EMPTY);
   const set = (k: keyof typeof form, v: any) =>
      setForm((f) => ({ ...f, [k]: v }));

   const openAdd = () => {
      setForm(EMPTY);
      setModal(true);
   };
   const openEdit = (match: AdminMatch) => {
      setForm({
         matchId: match.id,
         type: (match.stream?.type ?? 'EMBED') as 'EMBED' | 'NONE',
         provider: match.stream?.provider ?? '',
         url: match.stream?.url ?? '',
         isActive: match.stream?.isActive ?? false,
      });
      setModal(true);
   };

   const handleSave = async () => {
      const ok = await admin.save(form);
      if (ok) {
         setModal(false);
         setForm(EMPTY);
      }
   };

   return (
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-xl font-bold text-white">
                  Stream Management
               </h2>
               <p className="text-sm text-slate-400 mt-1">
                  <span className="text-red-400 font-semibold">
                     {admin.liveMatches.length} live
                  </span>
                  {' · '}
                  <span className="text-green-400 font-semibold">
                     {
                        admin.liveMatches.filter((m) => m.stream?.isActive)
                           .length
                     }{' '}
                     streaming
                  </span>
               </p>
            </div>
            <div className="flex gap-2">
               <button
                  onClick={admin.loadLive}
                  disabled={admin.loading}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-slate-300 text-sm transition-all hover:bg-slate-700"
               >
                  <RefreshCw
                     className={`w-4 h-4 ${admin.loading ? 'animate-spin' : ''}`}
                  />{' '}
                  Refresh
               </button>
               <button
                  onClick={admin.bulkSearch}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-slate-300 text-sm transition-all hover:bg-slate-700"
               >
                  Bulk YouTube Search
               </button>
               <button
                  onClick={openAdd}
                  className="flex items-center gap-2 bg-brand hover:bg-brand px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all"
               >
                  <Plus className="w-5 h-5" /> Add Stream
               </button>
            </div>
         </div>

         <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                     <th className="text-left px-6 py-4">Match</th>
                     <th className="text-left px-6 py-4 hidden md:table-cell">
                        Kickoff
                     </th>
                     <th className="text-left px-6 py-4">Status</th>
                     <th className="text-left px-6 py-4">Stream</th>
                     <th className="text-left px-6 py-4">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {admin.liveMatches.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="text-center py-12">
                           <p className="text-slate-400 font-semibold">
                              No live matches right now
                           </p>
                           <p className="text-sm text-slate-500 mt-1">
                              Live matches appear here automatically
                           </p>
                        </td>
                     </tr>
                  ) : (
                     admin.liveMatches.map((match) => (
                        <tr
                           key={match.id}
                           className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                        >
                           <td className="px-6 py-4">
                              <div className="font-semibold text-sm">
                                 {match.homeTeam.name} vs {match.awayTeam.name}
                              </div>
                              {match.league?.name && (
                                 <div className="text-xs text-slate-500">
                                    {match.league.name}
                                 </div>
                              )}
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">
                              {new Date(match.kickoffTime).toLocaleString()}
                           </td>
                           <td className="px-6 py-4">
                              <StatusBadge status={match.status} size="sm" />
                           </td>
                           <td className="px-6 py-4">
                              {match.stream ? (
                                 <div className="flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4 text-brand" />
                                    <span
                                       className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${match.stream.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700/50 text-slate-500 border-slate-600/30'}`}
                                    >
                                       {match.stream.isActive
                                          ? 'Active'
                                          : 'Inactive'}
                                    </span>
                                 </div>
                              ) : (
                                 <span className="text-sm text-slate-500">
                                    No stream
                                 </span>
                              )}
                           </td>
                           <td className="px-6 py-4">
                              <button
                                 onClick={() => openEdit(match)}
                                 className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700/50 hover:border-brand/50 text-brand text-sm font-semibold transition-colors"
                              >
                                 <Edit2 className="w-4 h-4" />
                                 {match.stream ? 'Edit' : 'Add'}
                              </button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>

         {modal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-brand to-brand-dark">
                     <h3 className="text-xl font-bold text-white">
                        Stream Editor
                     </h3>
                  </div>
                  <div className="p-6 space-y-5">
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           Match
                        </label>
                        <select
                           value={form.matchId}
                           onChange={(e) => set('matchId', e.target.value)}
                           className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm outline-none"
                        >
                           <option value="">Choose a match…</option>
                           {admin.allMatches.map((m) => (
                              <option key={m.id} value={m.id}>
                                 {m.homeTeam.name} vs {m.awayTeam.name} (
                                 {m.status})
                              </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           Provider
                        </label>
                        <input
                           type="text"
                           value={form.provider}
                           onChange={(e) => set('provider', e.target.value)}
                           placeholder="YouTube, Twitch…"
                           className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           Stream URL / iframe *
                        </label>
                        <textarea
                           value={form.url}
                           onChange={(e) => {
                              let val = e.target.value;
                              const match = val.match(/src=["']([^"']+)["']/);
                              if (match) val = match[1];
                              set('url', val);
                           }}
                           placeholder="Paste full iframe or embed URL"
                           className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm outline-none resize-none"
                           rows={3}
                        />
                     </div>
                     <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={form.isActive}
                           onChange={(e) => set('isActive', e.target.checked)}
                           className="w-5 h-5 rounded accent-brand"
                        />
                        <span className="text-sm font-semibold text-slate-300">
                           Stream is active
                        </span>
                     </label>
                     <div className="flex gap-3 pt-2">
                        <button
                           onClick={() => setModal(false)}
                           className="flex-1 px-6 py-3 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-slate-800 transition-all text-sm"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleSave}
                           disabled={admin.saving}
                           className="flex-1 px-6 py-3 rounded-xl bg-brand hover:bg-brand text-white font-semibold transition-all text-sm disabled:opacity-50"
                        >
                           {admin.saving ? 'Saving…' : 'Save Stream'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
