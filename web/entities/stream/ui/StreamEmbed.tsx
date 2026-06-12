'use client';

import { useEffect, useState } from 'react';
import {
   Play,
   Tv,
   AlertTriangle,
   Youtube,
   RefreshCw,
   Volume2,
   Maximize2,
   ChevronLeft,
   ChevronRight,
} from 'lucide-react';
import { apiGet } from '@/shared/api/client';
import type { StreamData, MatchStatus } from '@/shared/types';

interface StreamStatusResponse {
   found: boolean;
   stream: {
      url: string;
      youtubeVideoId: string | null;
      streamTitle: string | null;
      sources?: string[];
   } | null;
}

interface Props {
   stream: StreamData | null;
   matchStatus: MatchStatus;
   homeTeam: string;
   awayTeam: string;
   matchId: string;
}

export default function StreamEmbed({
   stream: initialStream,
   matchStatus,
   homeTeam,
   awayTeam,
   matchId,
}: Props) {
   const [stream, setStream] = useState<StreamData | null>(initialStream);
   const [sources, setSources] = useState<string[]>([]);
   const [activeSourceIndex, setActiveSourceIndex] = useState(0);
   const [showEmbed, setShowEmbed] = useState(false);
   const [embedError, setEmbedError] = useState(false);
   const [checking, setChecking] = useState(false);

   const pollStatus = async () => {
      try {
         const data = await apiGet<StreamStatusResponse>(
            `/api/streams/${matchId}/status`
         );
         if (data.found && data.stream) {
            setStream({
               type: 'EMBED',
               provider: stream?.provider ?? 'sportsrc',
               url: data.stream.url,
               isActive: true,
               youtubeVideoId: data.stream.youtubeVideoId,
               streamTitle: data.stream.streamTitle,
            });
            // Store redundant sources if provided
            if (data.stream.sources?.length) {
               setSources(data.stream.sources);
            }
         }
      } catch {}
   };

   useEffect(() => {
      if (matchStatus !== 'LIVE' || (stream?.isActive && stream?.url)) return;
      pollStatus();
      const interval = setInterval(pollStatus, 60_000);
      return () => clearInterval(interval);
   }, [matchId, matchStatus, stream?.isActive, stream?.url]);

   const handleCheck = async () => {
      setChecking(true);
      await pollStatus();
      setTimeout(() => setChecking(false), 1500);
   };

   // Active URL — use sources array if available, else fall back to stream.url
   const activeUrl =
      sources.length > 0 ? sources[activeSourceIndex] : (stream?.url ?? null);

   const noStream = !stream || stream.type === 'NONE' || !stream.isActive;

   if (noStream) {
      return (
         <div className="bg-slate-900/90 border-2 border-slate-700/50 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-slate-800/70 rounded-2xl flex items-center justify-center mx-auto mb-4">
               {matchStatus === 'LIVE' ? (
                  <Youtube className="w-10 h-10 text-slate-600" />
               ) : (
                  <Tv className="w-10 h-10 text-slate-600" />
               )}
            </div>
            {matchStatus === 'LIVE' ? (
               <>
                  <h3 className="text-xl font-black text-white mb-2 uppercase">
                     Searching for Stream…
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                     Auto-checking every 60 seconds.
                  </p>
                  <button
                     onClick={handleCheck}
                     disabled={checking}
                     className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
                  >
                     <RefreshCw
                        className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`}
                     />
                     {checking ? 'Checking…' : 'Check Now'}
                  </button>
               </>
            ) : (
               <>
                  <h3 className="text-xl font-black text-white mb-2 uppercase">
                     Score-Only Mode
                  </h3>
                  <p className="text-sm text-slate-400">
                     No video stream available. Follow live score updates above.
                  </p>
               </>
            )}
         </div>
      );
   }

   if (!showEmbed) {
      const title = stream.streamTitle
         ? stream.streamTitle.length > 55
            ? stream.streamTitle.slice(0, 55) + '…'
            : stream.streamTitle
         : (stream.provider ?? 'Live Stream');

      return (
         <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-cyan-900/30 border-2 border-cyan-500/30 rounded-2xl p-8 text-center shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
               <Play className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase">
               Live Stream Available
            </h3>
            <p className="text-sm text-cyan-300 font-semibold mb-2">
               {homeTeam} vs {awayTeam}
            </p>
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 rounded-lg px-4 py-2 mb-2">
               {stream.provider === 'youtube' ? (
                  <Youtube className="w-4 h-4 text-red-400" />
               ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
               )}
               <span className="text-sm font-bold text-cyan-400">{title}</span>
            </div>
            {/* Show source count if multiple sources available */}
            {sources.length > 1 && (
               <p className="text-xs text-slate-400 mb-4">
                  {sources.length} stream sources available — switch if one goes
                  down
               </p>
            )}
            <div className="space-y-3 max-w-md mx-auto mt-4">
               <button
                  onClick={() => {
                     setShowEmbed(true);
                     setEmbedError(false);
                  }}
                  className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:via-blue-500 hover:to-cyan-500 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-cyan-500/40 transition-all hover:scale-105 uppercase tracking-wide"
               >
                  <Play className="w-6 h-6" />
                  Watch Live Stream
                  <Maximize2 className="w-5 h-5" />
               </button>
            </div>
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-left">
               <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300/80 font-medium">
                     Streams are provided by licensed broadcasters via SportSRC.
                     We do not host or distribute unauthorized content.
                  </p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="relative overflow-hidden bg-slate-900/95 border-2 border-cyan-500/30 rounded-2xl shadow-2xl">
         {/* Header */}
         <div className="flex items-center justify-between p-4 bg-slate-950/50 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
               </span>
               <div>
                  <div className="text-sm font-black text-white uppercase">
                     Live Stream
                  </div>
                  <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                     {stream.provider === 'youtube' && (
                        <Youtube className="w-3 h-3 text-red-400" />
                     )}
                     {stream.streamTitle
                        ? stream.streamTitle.slice(0, 40)
                        : (stream.provider ?? 'SportSRC')}
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
               {stream.youtubeVideoId && (
                  <a
                     href={`https://www.youtube.com/watch?v=${stream.youtubeVideoId}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                  >
                     YouTube ↗
                  </a>
               )}
               <button
                  onClick={() => setShowEmbed(false)}
                  className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all"
               >
                  Close
               </button>
            </div>
         </div>

         {/* Player */}
         <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
            {embedError ? (
               <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="text-center p-8">
                     <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                     <h4 className="text-lg font-black text-white mb-2">
                        Stream Ended
                     </h4>
                     <p className="text-sm text-slate-400 mb-4">
                        {sources.length > 1
                           ? 'Try switching to another source below.'
                           : 'The stream may have ended or been removed.'}
                     </p>
                  </div>
               </div>
            ) : activeUrl ? (
               <iframe
                  key={activeUrl}
                  src={activeUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  onError={() => setEmbedError(true)}
                  title={`${homeTeam} vs ${awayTeam} - Live Stream`}
               />
            ) : null}
         </div>

         {/* Multi-source switcher */}
         {sources.length > 1 && (
            <div className="p-4 bg-slate-950/50 border-t border-cyan-500/20">
               <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                     Stream Sources ({activeSourceIndex + 1}/{sources.length})
                  </span>
                  <div className="flex gap-2">
                     <button
                        onClick={() => {
                           setActiveSourceIndex((i) => Math.max(0, i - 1));
                           setEmbedError(false);
                        }}
                        disabled={activeSourceIndex === 0}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg transition-all"
                     >
                        <ChevronLeft className="w-4 h-4 text-slate-300" />
                     </button>
                     {sources.map((_, i) => (
                        <button
                           key={i}
                           onClick={() => {
                              setActiveSourceIndex(i);
                              setEmbedError(false);
                           }}
                           className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              i === activeSourceIndex
                                 ? 'bg-cyan-600 text-white'
                                 : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                           }`}
                        >
                           {i + 1}
                        </button>
                     ))}
                     <button
                        onClick={() => {
                           setActiveSourceIndex((i) =>
                              Math.min(sources.length - 1, i + 1)
                           );
                           setEmbedError(false);
                        }}
                        disabled={activeSourceIndex === sources.length - 1}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg transition-all"
                     >
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Footer */}
         <div className="p-4 bg-slate-950/50 border-t border-cyan-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="font-semibold">
                     {homeTeam} vs {awayTeam}
                  </span>
               </div>
               <span>
                  Status: <span className="text-cyan-400">{matchStatus}</span>
               </span>
            </div>
         </div>
      </div>
   );
}
