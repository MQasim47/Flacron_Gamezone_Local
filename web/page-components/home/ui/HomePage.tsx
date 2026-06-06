"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet } from "@/shared/api/base";
import {
  Search,
  Trophy,
  Play,
  Clock,
  Zap,
  ChevronRight,
  Sparkles,
  Globe,
  Users,
  Calendar,
} from "lucide-react";
import { ScrollToTop } from "@/shared/ui/ScrollToTop";

interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string;
}

interface Team {
  id: string;
  name: string;
  logo: string | null;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: League | null;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
  venue: string | null;
}

interface SearchResults {
  leagues: League[];
  teams: Team[];
  matches: Match[];
}

interface HomePageProps {
  initialFeaturedLeagues: League[];
  initialLiveMatches: Match[];
  initialUpcomingMatches: Match[];
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`relative overflow-hidden bg-slate-800/60 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-slate-700/40 before:to-transparent ${className}`}
  />
);

export default function HomePage({
  initialFeaturedLeagues,
  initialLiveMatches,
  initialUpcomingMatches,
}: HomePageProps) {
  const [featuredLeagues, setFeaturedLeagues] = useState<League[]>(
    initialFeaturedLeagues,
  );
  const [liveMatches, setLiveMatches] = useState<Match[]>(
    initialLiveMatches.slice(0, 4),
  );
  const [totalLiveMatches, setTotalLiveMatches] = useState<number>(
    initialLiveMatches.length,
  );
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>(
    initialUpcomingMatches,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [loading] = useState(false);

  const liveMatchCountRef = useRef(initialLiveMatches.length);

  useEffect(() => {
    liveMatchCountRef.current = totalLiveMatches || liveMatches.length;
  }, [totalLiveMatches, liveMatches.length]);

  const refreshLiveMatches = useCallback(async () => {
    try {
      const liveRes = await apiGet<Match[]>("/api/matches/live");
      const all = Array.isArray(liveRes) ? liveRes : [];
      setLiveMatches(all.slice(0, 4));
      setTotalLiveMatches(all.length);
    } catch (error) {
      console.error("Error refreshing live matches:", error);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (liveMatchCountRef.current > 0) {
        refreshLiveMatches();
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [refreshLiveMatches]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function performSearch() {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const results = await apiGet<SearchResults>(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            LIVE
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Clock className="w-3 h-3" />
            UPCOMING
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-12">
      <ScrollToTop />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.3) 1px,transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-blue-500/20" />
          </div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative p-8 md:p-16">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-400">
                  {totalLiveMatches} Live Matches Now
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                  Football Universe
                </span>
                <br />
                <span className="text-slate-400 text-3xl md:text-5xl">
                  Discover • Watch • Connect
                </span>
              </h1>

              <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-2xl">
                Your ultimate destination for live football matches,
                comprehensive league coverage, and real-time updates from around
                the globe.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/live">
                  <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-3">
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Watch Live
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/leagues">
                  <button className="group bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Browse Leagues
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl">
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {featuredLeagues.length}+
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Leagues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {totalLiveMatches}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Live Now</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {upcomingMatches.length}+
                  </div>
                  <div className="text-sm text-slate-400 mt-1">Upcoming</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>
      </div>

      {/* Global Search */}
      <div className="relative">
        <div className="relative max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams, leagues, or matches..."
              aria-label="Search teams, leagues, or matches"
              className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
            />
            {isSearching && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {searchResults && searchQuery && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-h-[500px] overflow-y-auto z-50">
              {searchResults.leagues.length > 0 && (
                <div className="p-4 border-b border-slate-700/50">
                  <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    LEAGUES
                  </div>
                  <div className="space-y-2">
                    {searchResults.leagues.map((league) => (
                      <Link
                        key={league.id}
                        href={`/leagues/${league.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                        onClick={() => setSearchQuery("")}
                      >
                        <img
                          src={league.logo}
                          alt={league.name}
                          className="w-8 h-8 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {league.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {league.country}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.teams.length > 0 && (
                <div className="p-4 border-b border-slate-700/50">
                  <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    TEAMS
                  </div>
                  <div className="space-y-2">
                    {searchResults.teams.map((team) => (
                      <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                        onClick={() => setSearchQuery("")}
                      >
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold">
                            {team.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="font-medium text-sm truncate">
                          {team.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.matches.length > 0 && (
                <div className="p-4">
                  <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    MATCHES
                  </div>
                  <div className="space-y-2">
                    {searchResults.matches.map((match) => (
                      <Link
                        key={match.id}
                        href={`/match/${match.id}`}
                        className="block p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                        onClick={() => setSearchQuery("")}
                      >
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate">
                            {match.homeTeam.name}
                          </span>
                          <span className="text-slate-500">vs</span>
                          <span className="truncate">
                            {match.awayTeam.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(match.status)}
                          <span className="text-xs text-slate-500">
                            {new Date(match.kickoffTime).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.leagues.length === 0 &&
                searchResults.teams.length === 0 &&
                searchResults.matches.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 blur-xl" />
            <div className="relative bg-gradient-to-br from-red-900/50 via-orange-900/40 to-red-900/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl blur-md" />
                    <div className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl md:text-3xl font-black text-white">
                        Live Matches
                      </h2>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                        <span className="text-xs font-black text-red-400 uppercase tracking-wide">
                          {totalLiveMatches} LIVE NOW
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-red-300 font-medium mt-1">
                      ⚡ Happening right now • Auto-updating every 45s
                    </p>
                  </div>
                </div>
                <Link
                  href="/live"
                  className="hidden md:flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 font-bold px-5 py-2.5 rounded-xl transition-all duration-300"
                >
                  View All Live
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {liveMatches.map((match, idx) => (
              <Link key={match.id} href={`/match/${match.id}`}>
                <div
                  className="group relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-red-500/30 hover:border-red-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-red-500/20"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${idx * 0.1}s both`,
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(239,68,68,0.1),transparent)] group-hover:bg-[radial-gradient(circle_at_30%_20%,_rgba(239,68,68,0.15),transparent)] transition-all rounded-2xl" />
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                      </span>
                      <span className="text-xs font-black text-white uppercase tracking-wide">
                        LIVE
                      </span>
                    </div>
                  </div>

                  <div className="relative space-y-4">
                    {match.league && (
                      <div className="flex items-center gap-2">
                        {match.league.logo && (
                          <img
                            src={match.league.logo}
                            alt={match.league.name}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          {match.league.name}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mt-6">
                      <div className="text-right">
                        <div className="flex justify-end mb-3">
                          {match.homeTeam.logo ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md" />
                              <img
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.name}
                                className="relative w-16 h-16 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center text-xl font-black">
                              {match.homeTeam.name.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                          {match.homeTeam.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1">
                          Home
                        </div>
                      </div>

                      <div className="text-center min-w-[90px]">
                        <div className="text-5xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                          {match.score || "0-0"}
                        </div>
                        <div className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wider">
                          Score
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="flex justify-start mb-3">
                          {match.awayTeam.logo ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-md" />
                              <img
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.name}
                                className="relative w-16 h-16 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center text-xl font-black">
                              {match.awayTeam.name.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="text-base font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                          {match.awayTeam.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1">
                          Away
                        </div>
                      </div>
                    </div>

                    {match.venue && (
                      <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <Trophy className="w-3.5 h-3.5" />
                        <span className="font-medium">{match.venue}</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
                </div>
              </Link>
            ))}
          </div>

          <Link href="/live" className="md:hidden block">
            <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
              View All {liveMatches.length} Live Matches
              <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      )}

      {/* Featured Leagues */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Featured Leagues</h2>
              <p className="text-sm text-slate-400">
                Top competitions worldwide
              </p>
            </div>
          </div>
          <Link
            href="/leagues"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-b from-slate-900/40 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6"
                >
                  <Skeleton className="w-20 h-20 rounded-xl mx-auto mb-4" />
                  <Skeleton className="h-3.5 w-3/4 mx-auto mb-2 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 mx-auto rounded-lg" />
                </div>
              ))
            : featuredLeagues.map((league, idx) => (
                <Link key={league.id} href={`/leagues/${league.id}`}>
                  <div
                    className="group bg-gradient-to-b from-slate-900/40 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both`,
                    }}
                  >
                    <div className="relative mb-4 mx-auto w-20 h-20">
                      <div className="w-20 h-20 rounded-xl bg-slate-800/50 flex items-center justify-center p-3 group-hover:scale-110 transition-transform">
                        <img
                          src={league.logo}
                          alt={league.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {league.name}
                      </h3>
                      <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                        <Globe className="w-3 h-3" />
                        <span className="line-clamp-1">{league.country}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Upcoming Matches</h2>
              <p className="text-sm text-slate-400">Don't miss these games</p>
            </div>
          </div>
          <Link
            href="/matches"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {upcomingMatches.map((match) => (
            <Link key={match.id} href={`/match/${match.id}`}>
              <div className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <div className="flex items-center justify-center mb-4">
                  {getStatusBadge(match.status)}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {match.homeTeam.logo ? (
                      <img
                        src={match.homeTeam.logo}
                        alt={match.homeTeam.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold">
                        {match.homeTeam.name.substring(0, 2)}
                      </div>
                    )}
                    <span className="font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">
                      {match.homeTeam.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {match.awayTeam.logo ? (
                      <img
                        src={match.awayTeam.logo}
                        alt={match.awayTeam.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold">
                        {match.awayTeam.name.substring(0, 2)}
                      </div>
                    )}
                    <span className="font-semibold text-sm truncate group-hover:text-purple-400 transition-colors">
                      {match.awayTeam.name}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(match.kickoffTime).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </div>
                    <div>
                      {new Date(match.kickoffTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {match.league && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                      <Trophy className="w-3 h-3" />
                      {match.league.name}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
        <div className="relative bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Ready for Premium Experience?
            </h2>
            <p className="text-slate-300 mb-8">
              Unlock exclusive features, HD streaming, and advanced analytics
              with our premium plans.
            </p>
            <Link href="/pricing">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105">
                View Pricing Plans
              </button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
