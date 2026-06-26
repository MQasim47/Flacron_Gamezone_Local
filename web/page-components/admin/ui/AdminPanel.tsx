'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAdminGuard } from '@/shared/hooks';
import { useLeagueAdmin } from '@/features/admin-leagues/hooks/useLeagueAdmin';
import { useTeamAdmin } from '@/features/admin-teams/hooks/useTeamAdmin';
import { useMatchAdmin } from '@/features/admin-matches/hooks/useMatchAdmin';
import { useStreamAdmin } from '@/features/admin-streams/hooks/useStreamAdmin';
import { useUserAdmin } from '@/features/admin-users/hooks/useUserAdmin';
import {
   AdminPanelTabs,
   type AdminTab,
} from '@/widgets/admin-panel/ui/AdminPanelTabs';
import { StatsCards } from '@/widgets/stats-cards/ui/StatsCards';
import { AlertMessage } from '@/shared/ui/AlertMessage';
import { LoadingState } from '@/shared/ui/LoadingErrorStates';
import { DeleteConfirmModal } from '@/shared/ui/DeleteConfirmModal';
import { LeagueTab } from './tabs/LeagueTab';
import { TeamTab } from './tabs/TeamTab';
import { MatchTab } from './tabs/MatchTab';
import { StreamTab } from './tabs/StreamTab';
import { UserTab } from './tabs/UserTab';

export function AdminPanel() {
   const { isChecking } = useAdminGuard();
   const [activeTab, setActiveTab] = useState<AdminTab>('overview');

   const leagueAdmin = useLeagueAdmin();
   const teamAdmin = useTeamAdmin();
   const matchAdmin = useMatchAdmin();
   const streamAdmin = useStreamAdmin();
   const userAdmin = useUserAdmin();

   const [deleteModal, setDeleteModal] = useState<{
      open: boolean;
      title: string;
      message: string;
      onConfirm: () => Promise<boolean>;
   }>({ open: false, title: '', message: '', onConfirm: async () => false });
   const [deleting, setDeleting] = useState(false);

   const confirmDelete = (
      title: string,
      message: string,
      onConfirm: () => Promise<boolean>
   ) => {
      setDeleteModal({ open: true, title, message, onConfirm });
   };

   const handleConfirm = async () => {
      setDeleting(true);
      await deleteModal.onConfirm();
      setDeleting(false);
      setDeleteModal((d) => ({ ...d, open: false }));
   };

   if (isChecking) return <LoadingState message="Loading admin panel…" />;

   const activeAlert =
      leagueAdmin.alert ||
      teamAdmin.alert ||
      matchAdmin.alert ||
      streamAdmin.alert ||
      userAdmin.alert;

   const stats = {
      leagues: leagueAdmin.leagues.length,
      teams: teamAdmin.teams.length,
      matches: matchAdmin.total,
      streams: streamAdmin.liveMatches.filter((m) => m.stream?.isActive).length,
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
         <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center shadow-lg shadow-brand/30">
                  <Shield className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                  <p className="text-sm text-slate-400">
                     Manage your football platform
                  </p>
               </div>
            </div>

            {activeAlert && <AlertMessage message={activeAlert} />}

            <AdminPanelTabs active={activeTab} onChange={setActiveTab} />

            <div>
               {activeTab === 'overview' && <StatsCards stats={stats} />}
               {activeTab === 'leagues' && (
                  <LeagueTab
                     admin={leagueAdmin}
                     onConfirmDelete={confirmDelete}
                  />
               )}
               {activeTab === 'teams' && (
                  <TeamTab
                     admin={teamAdmin}
                     leagues={leagueAdmin.leagues}
                     onConfirmDelete={confirmDelete}
                  />
               )}
               {activeTab === 'matches' && (
                  <MatchTab
                     admin={matchAdmin}
                     leagues={leagueAdmin.leagues}
                     teams={teamAdmin.teams}
                     onConfirmDelete={confirmDelete}
                  />
               )}
               {activeTab === 'streams' && <StreamTab admin={streamAdmin} />}
               {activeTab === 'users' && (
                  <UserTab admin={userAdmin} onConfirmDelete={confirmDelete} />
               )}
            </div>
         </div>

         <DeleteConfirmModal
            isOpen={deleteModal.open}
            title={deleteModal.title}
            message={deleteModal.message}
            onConfirm={handleConfirm}
            onCancel={() => setDeleteModal((d) => ({ ...d, open: false }))}
            isDeleting={deleting}
         />
      </div>
   );
}
