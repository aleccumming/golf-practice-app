import { http, ApiError } from "./http";
import { enqueueForSync } from "../offline/syncManager";
import type { Putt } from "../types";

export type CreatePuttInput = Omit<Putt, "id" | "created_at">;

export const puttsApi = {
  list: (filters: { session_id?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (filters.session_id) params.set("session_id", String(filters.session_id));
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return http.get<Putt[]>(`/putts${qs ? `?${qs}` : ""}`);
  },
  create: async (input: CreatePuttInput): Promise<Putt & { _queued?: boolean }> => {
    try {
      return await http.post<Putt>("/putts", input);
    } catch (err) {
      if (err instanceof ApiError) throw err; // server responded — a real rejection, don't queue
      await enqueueForSync("putt", input);
      return { ...input, id: -1, created_at: new Date().toISOString(), _queued: true };
    }
  },
  delete: (id: number) => http.delete<void>(`/putts/${id}`),
};
