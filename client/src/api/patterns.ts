import { http } from "./http";
import type { SessionType } from "../types";

export interface ClubMissBreakdown {
  club_id: number;
  club_name: string;
  total: number;
  breakdown: { value: string; count: number; pct: number }[];
  flagged: { value: string; count: number; pct: number } | null;
}

export interface ShotPatterns {
  missDirection: ClubMissBreakdown[];
  contact: ClubMissBreakdown[];
}

export interface PuttDistanceBucket {
  bucket: string;
  total: number;
  made: number;
  make_pct: number;
}

export interface PuttBreakBias {
  break: string;
  total: number;
  missed_left: number;
  missed_right: number;
  missed_short: number;
  missed_long: number;
}

export interface PuttPatterns {
  distanceBuckets: PuttDistanceBucket[];
  breakBias: PuttBreakBias[];
  flagged: { tag: string; count: number; total: number; pct: number }[];
}

function qs(filters: { window?: number; sessionType?: SessionType | null }) {
  const params = new URLSearchParams();
  if (filters.window) params.set("window", String(filters.window));
  if (filters.sessionType) params.set("session_type", filters.sessionType);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const patternsApi = {
  shots: (filters: { window?: number; sessionType?: SessionType | null } = {}) =>
    http.get<ShotPatterns>(`/patterns/shots${qs(filters)}`),
  putts: (filters: { window?: number; sessionType?: SessionType | null } = {}) =>
    http.get<PuttPatterns>(`/patterns/putts${qs(filters)}`),
};
