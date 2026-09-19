import { http } from "./http";
import type { User } from "../types";

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

export const authApi = {
  status: () => http.get<AuthStatus>("/auth/status"),
  google: (credential: string) => http.post<AuthStatus>("/auth/google", { credential }),
  logout: () => http.post<AuthStatus>("/auth/logout"),
};
