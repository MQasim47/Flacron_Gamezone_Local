'use client';

import { useState } from 'react';
import { Search, Edit2, Trash2, Shield, XCircle } from 'lucide-react';
import { PaginationControls } from '@/shared/ui/PaginationControls';
import { AdminUser } from '@/shared/types';

interface UserBrowserProps {
   users: AdminUser[];
   onEdit: (user: AdminUser) => void;
   onDelete: (user: AdminUser) => void;
   onCancelSubscription: (user: AdminUser) => void;
   currentPage: number;
   totalPages: number;
   totalItems: number;
   itemsPerPage: number;
   onPageChange: (page: number) => void;
   searchQuery: string;
   onSearchChange: (v: string) => void;
}

export function UserBrowser({
   users,
   onEdit,
   onDelete,
   onCancelSubscription,
   currentPage,
   totalPages,
   totalItems,
   itemsPerPage,
   onPageChange,
   searchQuery,
   onSearchChange,
}: UserBrowserProps) {
   const formatDate = (d?: string | null) =>
      d ? new Date(d).toLocaleDateString('en-GB') : '—';

   return (
      <div className="space-y-4">
         <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
               value={searchQuery}
               onChange={(e) => onSearchChange(e.target.value)}
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
                     <th className="text-left px-4 py-3 hidden lg:table-cell">
                        Expires
                     </th>
                     <th className="text-right px-4 py-3">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {users.length === 0 ? (
                     <tr>
                        <td
                           colSpan={5}
                           className="text-center py-12 text-slate-500"
                        >
                           No users found
                        </td>
                     </tr>
                  ) : (
                     users.map((user) => (
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
                           <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">
                              {formatDate(user.subscription?.currentPeriodEnd)}
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                 {user.subscription?.status === 'active' && (
                                    <button
                                       onClick={() =>
                                          onCancelSubscription(user)
                                       }
                                       className="p-1.5 hover:bg-slate-700 rounded-lg"
                                       title="Cancel subscription"
                                    >
                                       <XCircle className="w-3.5 h-3.5 text-orange-400" />
                                    </button>
                                 )}
                                 <button
                                    onClick={() => onEdit(user)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
                                    title="Edit"
                                 >
                                    <Edit2 className="w-3.5 h-3.5 text-brand" />
                                 </button>
                                 <button
                                    onClick={() => onDelete(user)}
                                    className="p-1.5 hover:bg-slate-700 rounded-lg"
                                    title="Delete"
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
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={onPageChange}
               itemsPerPage={itemsPerPage}
               totalItems={totalItems}
            />
         )}
      </div>
   );
}
