import { http } from "./http";
import type { Club } from "../types";

export const clubsApi = {
  list: () => http.get<Club[]>("/clubs"),
};
