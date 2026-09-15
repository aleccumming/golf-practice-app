import { http, ApiError } from "./http";
import { enqueueForSync } from "../offline/syncManager";
import type { Shot } from "../types";

export type CreateShotInput = Omit<Shot, "id" | "created_at">;

export const shotsApi = {
  list: (filters: { club_id?: number; session_id?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (filters.club_id) params.set("club_id", String(filters.club_id));
    if (filters.session_id) params.set("session_id", String(filters.session_id));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return http.get<Shot[]>(`/shots${qs ? `?${qs}` : ""}`);
  },
  create: async (input: CreateShotInput): Promise<Shot & { _queued?: boolean }> => {
    try {
      return await http.post<Shot>("/shots", input);
    } catch (err) {
      if (err instanceof ApiError) throw err; // server responded — a real rejection, don't queue
      await enqueueForSync("shot", input);
      return { ...input, id: -1, created_at: new Date().toISOString(), _queued: true };
    }
  },
  delete: (id: number) => http.delete<void>(`/shots/${id}`),
};
