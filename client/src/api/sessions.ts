import { http } from "./http";
import type { Session, SessionDetail, SessionType } from "../types";

export const sessionsApi = {
  list: (filters: { type?: SessionType; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return http.get<Session[]>(`/sessions${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => http.get<SessionDetail>(`/sessions/${id}`),
  create: (input: { date: string; type: SessionType; name?: string | null; duration_min?: number | null; notes?: string | null }) =>
    http.post<Session>("/sessions", input),
  update: (
    id: number,
    input: Partial<{ date: string; type: SessionType; name: string | null; duration_min: number | null; notes: string | null }>
  ) => http.patch<Session>(`/sessions/${id}`, input),
  delete: (id: number) => http.delete<void>(`/sessions/${id}`),
};
