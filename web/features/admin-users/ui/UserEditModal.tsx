'use client';

import { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { AdminUser } from '@/shared/types';

interface UserEditModalProps {
   user: AdminUser | null;
   isOpen: boolean;
   onClose: () => void;
   onSave: (role: string) => Promise<void>;
   saving: boolean;
}

export function UserEditModal({
   user,
   isOpen,
   onClose,
   onSave,
   saving,
}: UserEditModalProps) {
   const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');

   useEffect(() => {
      if (user) setRole(user.role);
   }, [user, isOpen]);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !saving && onClose()}
         />
         <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center">
                     <User className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                     <h2 className="text-lg font-bold">Edit User</h2>
                     <p className="text-xs text-slate-500 truncate max-w-36">
                        {user?.email}
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  disabled={saving}
                  className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50"
               >
                  <X className="w-4 h-4" />
               </button>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Role
               </label>
               <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
               >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
               </select>
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
                  onClick={() => onSave(role)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand disabled:bg-brand/50 rounded-xl text-sm font-medium disabled:opacity-50"
               >
                  <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Saving…' : 'Save'}
               </button>
            </div>
         </div>
      </div>
   );
}
