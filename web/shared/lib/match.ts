import type { Match, MatchResult } from "../types";

export function getMatchResult(match: Match, teamName: string): MatchResult | null {
  if (!match.score || match.status !== "FINISHED") return null;
  const [home, away] = match.score.split("-").map(Number);
  const isHome = match.homeTeam.name === teamName;
  const teamScore = isHome ? home : away;
  const opponentScore = isHome ? away : home;
  if (teamScore > opponentScore) return "W";
  if (teamScore < opponentScore) return "L";
  return "D";
}

export function parseScore(score: string): [number, number] | null {
  const parts = score.split("-").map(Number);
  if (parts.length !== 2 || parts.some(isNaN)) return null;
  return [parts[0], parts[1]];
}

export function isLive(status: string): boolean {
  return status === "LIVE";
}

export function isFinished(status: string): boolean {
  return status === "FINISHED";
}

export function isUpcoming(status: string): boolean {
  return status === "UPCOMING";
}