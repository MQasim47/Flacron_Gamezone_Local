import type { DeepTab } from './matchDetail.types';

export const DEEP_TABS: { id: DeepTab; label: string }[] = [
   { id: 'lineups', label: 'Lineups' },
   { id: 'stats', label: 'Stats' },
   { id: 'incidents', label: 'Incidents' },
   { id: 'odds', label: 'Odds' },
   { id: 'votes', label: 'Votes' },
   { id: 'h2h', label: 'H2H' },
];

export const SCROLLBAR_STYLES = `
   .custom-scrollbar::-webkit-scrollbar { width: 6px; }
   .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15,23,42,0.5); border-radius: 10px; }
   .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, rgb(6,182,212), rgb(59,130,246)); border-radius: 10px; }
   .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, rgb(8,145,178), rgb(37,99,235)); border-radius: 10px; }
   @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
`;
