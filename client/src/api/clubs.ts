import { http } from "./http";
import type { Club, ClubType } from "../types";

export const clubsApi = {
  list: () => http.get<Club[]>("/clubs"),
  create: (input: { name: string; type: ClubType }) => http.post<Club>("/clubs", input),
  remove: (id: number) => http.delete<void>(`/clubs/${id}`),
};
