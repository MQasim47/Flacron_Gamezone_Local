'use client';

import { useState } from 'react';
import { Search, Edit2, Trash2, XCircle, Shield } from 'lucide-react';
import type { useUserAdmin } from '@/features/admin-users/hooks/useUserAdmin';
import type { AdminUser } from '@/shared/types';
import { PaginationControls } from '@/shared/ui/PaginationControls';

type AdminState = ReturnType<typeof useUserAdmin>;

interface Props {
   admin: AdminState;
   onConfirmDelete: (
      title: string,
      message: string,
      fn: () => Promise<boolean>
   ) => void;
}

export function UserTab({ admin, onConfirmDelete }: Props) {
   const [modal, setModal] = useState(false);
   const [editing, setEditing] = useState<AdminUser | null>(null);
   const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');

   const openEdit = (u: AdminUser) => {
      setEditing(u);
      setRole(u.role);
      setModal(true);
   };

   const handleSave = async () => {
      if (!editing) return;
      const ok = await admin.saveRole(editing.id, role);
      if (ok) {
         setModal(false);
         setEditing(null);
      }
   };

   return (
      <div className="space-y-4">
         <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
               value={admin.search}
               onChange={(e) => admin.onSearchChange(e.target.value)}
               placeholder="Search users…"
               className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-brand/50"
            />
         </div>

         <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
               <thead className="bg-slate-800/50">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                     <th className="text-left px-4 py-3">User</th>
                     <th className="text-left px-4 py-3 hidden sm:table-cell">
                        Role
                     </th>
                     <th className="text-left px-4 py-3 hidden md:table-cell">
                        Subscription
                     </th>
                     <th className="text-right px-4 py-3">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {admin.users.length === 0 ? (
                     <tr>
                        <td
                           colSpan={4}
                           className="text-center py-12 text-slate-500"
                        >
                           No users found
                        </td>
                     </tr>
                  ) : (
                     admin.users.map((user) => (
                        <tr
                           key={user.id}
                           className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                        >
                           <td className="px-4 py-3">
                              <div className="font-medium text-sm">
                                 {user.email}
                              </div>
                              <div className="text-xs text-slate-500">
                                 ID: {String(user.id).slice(0, 8)}…
                              </div>
                           </td>
                           <td className="px-4 py-3 hidden sm:table-cell">
                              <span
                                 className={`text-xs font-semibold px-2 py-1 rounded-lg border ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-slate-700/50 text-slate-400 border-slate-600/30'}`}
                              >
                                 {user.role === 'ADMIN' && (
                                    <Shield className="w-3 h-3 inline mr-1" />
                                 )}
                                 {user.role}
                              </span>
                           </td>
                           <td className="px-4 py-3 hidden md:table-cell">
                              {user.subscription ? (
                                 <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-lg border ${user.subscription.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700/50 text-slate-400 border-slate-600/30'}`}
                                 >
                                    {user.subscription.status}
                                 </span>
                              ) : (
                                 <span className="text-xs text-slate-500">
                                    Free
                                 </span>
                              )}
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                 {user.subscription?.status === 'active' && (
                                    <button
                                       onClick={() =>
                                          onConfirmDelete(
                                             'Cancel Subscription',
                                             `Cancel subscription for "${user.email}"?`,
                                             () => admin.cancelSub(user.id)
                                          )
                                       }
                                       className="p-1.5 hover:bg-slate-700 rounded-lg"
                                       title="Cancel subscription"
                                    >
                                       <XCircle className="w-3.5 h-3.5 text-orange-400" />
                                    </button>
                                 )}
                                 <button
                                    onClick={() => openEdit(user)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
                                 >
                                    <Edit2 className="w-3.5 h-3.5 text-brand" />
                                 </button>
                                 <button
                                    onClick={() =>
                                       onConfirmDelete(
                                          'Delete User',
                                          `Permanently delete "${user.email}"?`,
                                          () => admin.remove(user.id)
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
               currentPage={admin.page}
               totalPages={admin.totalPages}
               onPageChange={admin.setPage}
               itemsPerPage={admin.LIMIT}
               totalItems={admin.total}
            />
         )}

         {modal && editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => !admin.saving && setModal(false)}
               />
               <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
                  <h2 className="text-lg font-bold mb-1">Edit User</h2>
                  <p className="text-xs text-slate-500 mb-5 truncate">
                     {editing.email}
                  </p>
                  <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Role
                     </label>
                     <select
                        value={role}
                        onChange={(e) =>
                           setRole(e.target.value as 'USER' | 'ADMIN')
                        }
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 focus:border-brand/50 rounded-xl text-sm outline-none"
                     >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                     </select>
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
                        disabled={admin.saving}
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
