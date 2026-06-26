'use client';

import { useState, useEffect } from 'react';
import { X, Save, Globe } from 'lucide-react';
import type { League } from '@/entities/league/model/types';

interface LeagueFormData {
   name: string;
   country: string;
   logo: string;
   apiLeagueId: string;
}

interface LeagueEditModalProps {
   league: League | null;
   isOpen: boolean;
   onClose: () => void;
   onSave: (data: LeagueFormData) => Promise<void>;
   saving: boolean;
}

export function LeagueEditModal({
   league,
   isOpen,
   onClose,
   onSave,
   saving,
}: LeagueEditModalProps) {
   const [form, setForm] = useState<LeagueFormData>({
      name: '',
      country: '',
      logo: '',
      apiLeagueId: '',
   });

   useEffect(() => {
      if (league) {
         setForm({
            name: league.name,
            country: league.country ?? '',
            logo: league.logo ?? '',
            apiLeagueId: String(league.apiLeagueId ?? ''),
         });
      } else {
         setForm({ name: '', country: '', logo: '', apiLeagueId: '' });
      }
   }, [league, isOpen]);

   if (!isOpen) return null;

   const fields: {
      key: keyof LeagueFormData;
      label: string;
      placeholder: string;
      type?: string;
   }[] = [
      { key: 'name', label: 'League Name', placeholder: 'Premier League' },
      { key: 'country', label: 'Country', placeholder: 'England' },
      { key: 'logo', label: 'Logo URL', placeholder: 'https://…' },
      {
         key: 'apiLeagueId',
         label: 'API League ID',
         placeholder: '39',
         type: 'number',
      },
   ];

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !saving && onClose()}
         />
         <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center">
                     <Globe className="w-5 h-5 text-brand" />
                  </div>
                  <h2 className="text-lg font-bold">
                     {league ? 'Edit League' : 'Add League'}
                  </h2>
               </div>
               <button
                  onClick={onClose}
                  disabled={saving}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
               >
                  <X className="w-4 h-4" />
               </button>
            </div>
            <div className="space-y-4">
               {fields.map(({ key, label, placeholder, type }) => (
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
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none transition-colors"
                     />
                  </div>
               ))}
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
