import { http } from "./http";
import type { Drill, DrillCategory } from "../types";

export const drillsApi = {
  list: (filters: { category?: DrillCategory } = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    const qs = params.toString();
    return http.get<Drill[]>(`/drills${qs ? `?${qs}` : ""}`);
  },
};
