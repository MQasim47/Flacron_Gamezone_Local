'use client';

import { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import type { AdminMatch } from '@/shared/types';
import type { Team } from '@/entities/team/model/types';
import type { League } from '@/entities/league/model/types';

interface MatchFormData {
   homeTeamId: string;
   awayTeamId: string;
   leagueId: string;
   kickoffTime: string;
   status: string;
   score: string;
}

interface MatchEditModalProps {
   match: AdminMatch | null;
   teams: Team[];
   leagues: League[];
   isOpen: boolean;
   onClose: () => void;
   onSave: (data: MatchFormData) => Promise<void>;
   saving: boolean;
}

export function MatchEditModal({
   match,
   teams,
   leagues,
   isOpen,
   onClose,
   onSave,
   saving,
}: MatchEditModalProps) {
   const [form, setForm] = useState<MatchFormData>({
      homeTeamId: '',
      awayTeamId: '',
      leagueId: '',
      kickoffTime: '',
      status: 'UPCOMING',
      score: '',
   });

   useEffect(() => {
      if (match) {
         setForm({
            homeTeamId: match.homeTeam.id,
            awayTeamId: match.awayTeam.id,
            leagueId: match.league?.id ?? '',
            kickoffTime: new Date(match.kickoffTime).toISOString().slice(0, 16),
            status: match.status,
            score: match.score ?? '',
         });
      } else {
         setForm({
            homeTeamId: '',
            awayTeamId: '',
            leagueId: '',
            kickoffTime: '',
            status: 'UPCOMING',
            score: '',
         });
      }
   }, [match, isOpen]);

   if (!isOpen) return null;

   const set = (key: keyof MatchFormData, value: string) =>
      setForm((f) => ({ ...f, [key]: value }));

   const SelectField = ({
      k,
      label,
      options,
   }: {
      k: keyof MatchFormData;
      label: string;
      options: { value: string; label: string }[];
   }) => (
      <div>
         <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            {label}
         </label>
         <select
            value={form[k]}
            onChange={(e) => set(k, e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 rounded-xl text-sm outline-none"
         >
            <option value="">Select…</option>
            {options.map((o) => (
               <option key={o.value} value={o.value}>
                  {o.label}
               </option>
            ))}
         </select>
      </div>
   );

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
         <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !saving && onClose()}
         />
         <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl my-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                     <Calendar className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-lg font-bold">
                     {match ? 'Edit Match' : 'Add Match'}
                  </h2>
               </div>
               <button
                  onClick={onClose}
                  disabled={saving}
                  className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50"
               >
                  <X className="w-4 h-4" />
               </button>
            </div>
            <div className="space-y-4">
               <SelectField
                  k="homeTeamId"
                  label="Home Team"
                  options={teams.map((t) => ({ value: t.id, label: t.name }))}
               />
               <SelectField
                  k="awayTeamId"
                  label="Away Team"
                  options={teams.map((t) => ({ value: t.id, label: t.name }))}
               />
               <SelectField
                  k="leagueId"
                  label="League"
                  options={leagues.map((l) => ({ value: l.id, label: l.name }))}
               />
               <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                     Kickoff Time
                  </label>
                  <input
                     type="datetime-local"
                     value={form.kickoffTime}
                     onChange={(e) => set('kickoffTime', e.target.value)}
                     className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 rounded-xl text-sm outline-none"
                  />
               </div>
               {match?.venue && (
                  <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Venue (synced automatically)
                     </label>
                     <div className="w-full px-3 py-2.5 bg-slate-800/30 border border-slate-700/50 rounded-xl text-sm text-slate-400">
                        {match.venue.name}
                        {match.venue.city ? `, ${match.venue.city}` : ''}
                     </div>
                  </div>
               )}
               <SelectField
                  k="status"
                  label="Status"
                  options={[
                     { value: 'UPCOMING', label: 'Upcoming' },
                     { value: 'LIVE', label: 'Live' },
                     { value: 'FINISHED', label: 'Finished' },
                  ]}
               />
               {(form.status === 'LIVE' || form.status === 'FINISHED') && (
                  <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Score (e.g. 2-1)
                     </label>
                     <input
                        type="text"
                        value={form.score}
                        onChange={(e) => set('score', e.target.value)}
                        placeholder="0-0"
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 rounded-xl text-sm outline-none"
                     />
                  </div>
               )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
               <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-sm disabled:opacity-50"
               >
                  Cancel
               </button>
               <button
                  onClick={() => onSave(form)}
                  disabled={
                     saving ||
                     !form.homeTeamId ||
                     !form.awayTeamId ||
                     !form.kickoffTime
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 rounded-xl text-sm font-medium disabled:opacity-50"
               >
                  <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Saving…' : 'Save'}
               </button>
            </div>
         </div>
      </div>
   );
}
