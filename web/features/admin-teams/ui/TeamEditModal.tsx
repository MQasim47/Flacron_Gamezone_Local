'use client';

import { useState, useEffect } from 'react';
import { X, Save, Users } from 'lucide-react';
import type { Team } from '@/entities/team/model/types';
import type { League } from '@/entities/league/model/types';

interface TeamFormData {
   name: string;
   leagueId: string;
   logo: string;
   apiTeamId: string;
}

interface TeamEditModalProps {
   team: Team | null;
   leagues: League[];
   isOpen: boolean;
   onClose: () => void;
   onSave: (data: TeamFormData) => Promise<void>;
   saving: boolean;
}

export function TeamEditModal({
   team,
   leagues,
   isOpen,
   onClose,
   onSave,
   saving,
}: TeamEditModalProps) {
   const [form, setForm] = useState<TeamFormData>({
      name: '',
      leagueId: '',
      logo: '',
      apiTeamId: '',
   });

   useEffect(() => {
      if (team) {
         setForm({
            name: team.name,
            leagueId: team.leagueId ?? '',
            logo: team.logo ?? '',
            apiTeamId: String(team.apiTeamId ?? ''),
         });
      } else {
         setForm({ name: '', leagueId: '', logo: '', apiTeamId: '' });
      }
   }, [team, isOpen]);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !saving && onClose()}
         />
         <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                     <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-lg font-bold">
                     {team ? 'Edit Team' : 'Add Team'}
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
                           setForm((f) => ({ ...f, [key]: e.target.value }))
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
                        setForm((f) => ({ ...f, leagueId: e.target.value }))
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
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-sm transition-all disabled:opacity-50"
               >
                  Cancel
               </button>
               <button
                  onClick={() => onSave(form)}
                  disabled={saving || !form.name.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand disabled:bg-brand/50 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
               >
                  <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Saving…' : 'Save'}
               </button>
            </div>
         </div>
      </div>
   );
}
