'use client';

import { useEffect, useState } from 'react';
import {
   getMatchesForStreams,
   upsertStream,
   type StreamMatch,
} from '../api/streamsApi';
import { cn } from '@/shared/lib/utils';
import {
   Tv,
   Plus,
   Edit2,
   Check,
   X,
   AlertCircle,
   PlayCircle,
   RefreshCw,
} from 'lucide-react';
import { PaginationControls } from '@/shared/ui/PaginationControls';

interface Stream {
   id: string;
   matchId: string;
   type: 'EMBED' | 'NONE';
   provider: string | null;
   url: string | null;
   isActive: boolean;
}

const ITEMS_PER_PAGE = 10;

function extractMatches(
   resp: Awaited<ReturnType<typeof getMatchesForStreams>>
): StreamMatch[] {
   if (!resp) return [];
   return resp.matches ?? [];
}

export default function AdminStreamsManagement() {
   // All matches fetched from backend (no status filter — backend ignores it)
   const [allFetched, setAllFetched] = useState<StreamMatch[]>([]);
   // Only LIVE matches shown in the table — filtered client-side
   const [liveMatches, setLiveMatches] = useState<StreamMatch[]>([]);
   // Non-FINISHED matches for the "Select match" dropdown in the form
   const [allMatches, setAllMatches] = useState<StreamMatch[]>([]);

   const [loading, setLoading] = useState(true);
   const [loadingMatchesList, setLoadingMatchesList] = useState(false);
   const [error, setError] = useState('');
   const [successMsg, setSuccessMsg] = useState('');
   const [showForm, setShowForm] = useState(false);
   const [editingStream, setEditingStream] = useState<Stream | null>(null);
   const [currentPage, setCurrentPage] = useState(0);
   const [formData, setFormData] = useState<{
      matchId: string;
      type: 'EMBED' | 'NONE';
      provider: string;
      url: string;
      isActive: boolean;
   }>({
      matchId: '',
      type: 'EMBED',
      provider: '',
      url: '',
      isActive: false,
   });

   useEffect(() => {
      loadLiveMatches();
      loadAllSavedMatches();
   }, []);

   useEffect(() => {
      document.body.style.overflow = showForm ? 'hidden' : 'auto';
      return () => {
         document.body.style.overflow = 'auto';
      };
   }, [showForm]);

   /**
    * Fetches all matches and filters to LIVE client-side.
    * The backend's matchService.getPaginated ignores the status param,
    * so we fetch everything with a high limit and filter here.
    */
   async function loadLiveMatches() {
      try {
         setLoading(true);
         setError('');
         // Fetch a large page — status param is passed but backend ignores it,
         // so we filter client-side below.
         const resp = await getMatchesForStreams(1, 10_000);
         const all = extractMatches(resp);
         setAllFetched(all);

         // ← Client-side filter: only keep LIVE matches
         const live = all
            .filter((m) => m.status === 'LIVE')
            .sort(
               (a, b) =>
                  new Date(a.kickoffTime).getTime() -
                  new Date(b.kickoffTime).getTime()
            );

         setLiveMatches(live);
         setCurrentPage(0);
      } catch (e: any) {
         setError(e?.message || 'Failed to load matches');
         setLiveMatches([]);
      } finally {
         setLoading(false);
      }
   }

   async function loadAllSavedMatches() {
      try {
         setLoadingMatchesList(true);
         const resp = await getMatchesForStreams(1, 10_000);
         const matchesData = extractMatches(resp)
            .filter((m) => m.status !== 'FINISHED')
            .sort(
               (a, b) =>
                  new Date(a.kickoffTime).getTime() -
                  new Date(b.kickoffTime).getTime()
            );
         setAllMatches(matchesData);
      } catch {
         setAllMatches([]);
      } finally {
         setLoadingMatchesList(false);
      }
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!formData.matchId) {
         setError('Please select a match');
         return;
      }
      if (formData.type === 'EMBED' && !formData.url) {
         setError('Please provide a stream URL or iframe');
         return;
      }
      try {
         setError('');
         setSuccessMsg('');
         await upsertStream({
            matchId: formData.matchId,
            type: formData.type,
            provider: formData.provider || null,
            url: formData.url || null,
            isActive: formData.isActive,
         });
         setSuccessMsg('✅ Stream saved successfully!');
         setShowForm(false);
         setEditingStream(null);
         resetForm();
         await Promise.all([loadLiveMatches(), loadAllSavedMatches()]);
         setTimeout(() => setSuccessMsg(''), 3000);
      } catch (e: any) {
         setError(e?.message || 'Failed to save stream');
      }
   }

   function resetForm() {
      setFormData({
         matchId: '',
         type: 'EMBED',
         provider: '',
         url: '',
         isActive: false,
      });
   }

   function handleEdit(match: StreamMatch) {
      if (match.stream) {
         setEditingStream(match.stream as Stream);
         setFormData({
            matchId: match.id,
            type: match.stream.type,
            provider: match.stream.provider || '',
            url: match.stream.url || '',
            isActive: match.stream.isActive,
         });
      } else {
         setFormData({
            matchId: match.id,
            type: 'EMBED',
            provider: '',
            url: '',
            isActive: false,
         });
      }
      if (allMatches.length === 0 && !loadingMatchesList) loadAllSavedMatches();
      setShowForm(true);
   }

   function handleCancel() {
      setShowForm(false);
      setEditingStream(null);
      resetForm();
      setError('');
   }

   const getStatusBadge = (status: string) => {
      switch (status) {
         case 'LIVE':
            return (
               <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-bold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  LIVE
               </span>
            );
         case 'UPCOMING':
            return (
               <span className="inline-flex items-center px-2 py-1 rounded-md bg-brand/20 text-brand text-xs font-bold">
                  UPCOMING
               </span>
            );
         case 'FINISHED':
            return (
               <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-700/50 text-slate-400 text-xs font-bold">
                  FINISHED
               </span>
            );
         default:
            return null;
      }
   };

   const totalPages = Math.ceil(liveMatches.length / ITEMS_PER_PAGE);
   const paginated = liveMatches.slice(
      currentPage * ITEMS_PER_PAGE,
      (currentPage + 1) * ITEMS_PER_PAGE
   );

   if (loading) {
      return (
         <div className="flex items-center justify-center py-12">
            <div className="text-center">
               <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
               <p className="text-slate-400">Loading live matches...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-2xl font-bold text-white">
                  Stream Management
               </h2>
               <p className="text-sm text-slate-400 mt-1">
                  Live matches —{' '}
                  <span className="text-red-400 font-semibold">
                     {liveMatches.length} live
                  </span>{' '}
                  ·{' '}
                  <span className="text-green-400 font-semibold">
                     {liveMatches.filter((m) => m.stream?.isActive).length}{' '}
                     streaming
                  </span>
               </p>
            </div>
            <div className="flex items-center gap-2">
               <button
                  onClick={loadLiveMatches}
                  disabled={loading}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 px-3 py-2 rounded-lg text-slate-300 text-sm font-semibold transition"
               >
                  <RefreshCw
                     className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  />
                  Refresh
               </button>
               <button
                  onClick={() => {
                     if (allMatches.length === 0 && !loadingMatchesList)
                        loadAllSavedMatches();
                     resetForm();
                     setShowForm(true);
                  }}
                  className="flex items-center gap-2 bg-brand hover:bg-brand px-4 py-2 rounded-lg text-white font-semibold transition"
               >
                  <Plus className="w-5 h-5" />
                  Add Stream
               </button>
            </div>
         </div>

         {/* Notifications */}
         {successMsg && (
            <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10 flex items-center gap-3">
               <Check className="w-5 h-5 text-green-400" />
               <p className="text-sm text-green-400 font-medium">
                  {successMsg}
               </p>
            </div>
         )}
         {error && (
            <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center gap-3">
               <AlertCircle className="w-5 h-5 text-red-400" />
               <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
         )}

         {/* Form Modal */}
         {showForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/50">
                  <div className="sticky top-0 p-6 rounded-t-2xl bg-gradient-to-r from-brand to-brand-dark">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Tv className="w-6 h-6 text-white" />
                           <h3 className="text-xl font-bold text-white">
                              {editingStream ? 'Edit Stream' : 'Add New Stream'}
                           </h3>
                        </div>
                        <button
                           onClick={handleCancel}
                           className="p-2 rounded hover:bg-white/10 transition"
                        >
                           <X className="w-5 h-5 text-white" />
                        </button>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           Select Match *
                        </label>
                        <select
                           value={formData.matchId}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 matchId: e.target.value,
                              })
                           }
                           className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 text-sm outline-none"
                           required
                        >
                           <option value="">Choose a match...</option>
                           {allMatches.map((match) => (
                              <option key={match.id} value={match.id}>
                                 {match.homeTeam.name} vs {match.awayTeam.name}{' '}
                                 —{' '}
                                 {new Date(match.kickoffTime).toLocaleString()}{' '}
                                 ({match.status})
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
                           value={formData.provider}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 provider: e.target.value,
                              })
                           }
                           placeholder="e.g., YouTube, Twitch"
                           className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 text-sm outline-none"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                           Stream URL or iframe *
                        </label>
                        <textarea
                           value={formData.url}
                           onChange={(e) => {
                              let val = e.target.value;
                              const srcMatch =
                                 val.match(/src=["']([^"']+)["']/);
                              if (srcMatch) val = srcMatch[1];
                              setFormData({ ...formData, url: val });
                           }}
                           placeholder="Paste full iframe code or just the embed URL"
                           className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 text-sm outline-none resize-none"
                           required
                           rows={3}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                           Paste full iframe (YouTube, Twitch, Vimeo, etc.) or
                           the embed URL.
                        </p>
                     </div>

                     <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <input
                           type="checkbox"
                           id="isActive"
                           checked={formData.isActive}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 isActive: e.target.checked,
                              })
                           }
                           className="w-5 h-5 rounded accent-brand"
                        />
                        <label
                           htmlFor="isActive"
                           className="text-sm font-semibold text-slate-300 cursor-pointer"
                        >
                           Stream is active and should be displayed
                        </label>
                     </div>

                     <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                        <button
                           type="button"
                           onClick={handleCancel}
                           className="flex-1 px-6 py-3 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-slate-800 transition text-sm"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           className="flex-1 px-6 py-3 rounded-xl bg-brand hover:bg-brand text-white font-semibold transition text-sm"
                        >
                           {editingStream ? 'Update Stream' : 'Create Stream'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Live Streams Table */}
         <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                     <th className="text-left px-6 py-4 font-medium">Match</th>
                     <th className="text-left px-6 py-4 font-medium hidden md:table-cell">
                        Date & Time
                     </th>
                     <th className="text-left px-6 py-4 font-medium">Status</th>
                     <th className="text-left px-6 py-4 font-medium">Stream</th>
                     <th className="text-left px-6 py-4 font-medium">
                        Actions
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {paginated.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="text-center py-12">
                           <Tv className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                           <p className="text-slate-400 font-semibold">
                              No live matches right now
                           </p>
                           <p className="text-sm text-slate-500 mt-1">
                              Live matches will appear here automatically
                           </p>
                        </td>
                     </tr>
                  ) : (
                     paginated.map((match) => (
                        <tr
                           key={match.id}
                           className={cn(
                              'border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors',
                              match.stream?.isActive
                                 ? 'bg-green-500/5'
                                 : 'bg-transparent'
                           )}
                        >
                           <td className="px-6 py-4">
                              <div className="font-semibold text-sm text-white">
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
                              {getStatusBadge(match.status)}
                           </td>
                           <td className="px-6 py-4">
                              {match.stream ? (
                                 <div className="flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4 text-brand" />
                                    {match.stream.provider && (
                                       <span className="text-xs text-slate-400">
                                          {match.stream.provider}
                                       </span>
                                    )}
                                    <span
                                       className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${
                                          match.stream.isActive
                                             ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                             : 'bg-slate-700/50 text-slate-500 border-slate-600/30'
                                       }`}
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
                                 onClick={() => handleEdit(match)}
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

         {totalPages > 1 && (
            <PaginationControls
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
               itemsPerPage={ITEMS_PER_PAGE}
               totalItems={liveMatches.length}
            />
         )}
      </div>
   );
}
