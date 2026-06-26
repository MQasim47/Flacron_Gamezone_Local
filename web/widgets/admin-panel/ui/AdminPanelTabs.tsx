'use client';

import { Activity, Trophy, Users, Calendar, Play, UserCog } from 'lucide-react';
import { cn } from '@/shared/lib';

export type AdminTab =
   | 'overview'
   | 'leagues'
   | 'teams'
   | 'matches'
   | 'streams'
   | 'users';

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
   { id: 'overview', label: 'Overview', icon: Activity },
   { id: 'leagues', label: 'Leagues', icon: Trophy },
   { id: 'teams', label: 'Teams', icon: Users },
   { id: 'matches', label: 'Matches', icon: Calendar },
   { id: 'streams', label: 'Streams', icon: Play },
   { id: 'users', label: 'Users', icon: UserCog },
];

interface Props {
   active: AdminTab;
   onChange: (tab: AdminTab) => void;
}

export function AdminPanelTabs({ active, onChange }: Props) {
   return (
      <div className="flex overflow-x-auto border-b border-slate-700/50 gap-1 pb-px scrollbar-none">
         {TABS.map(({ id, label, icon: Icon }) => (
            <button
               key={id}
               onClick={() => onChange(id)}
               className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative flex-shrink-0',
                  active === id
                     ? 'text-brand'
                     : 'text-slate-400 hover:text-slate-200'
               )}
            >
               <Icon className="w-4 h-4" />
               {label}
               {active === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand to-brand-dark rounded-t" />
               )}
            </button>
         ))}
      </div>
   );
}
