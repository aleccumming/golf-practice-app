import { http } from "./http";
import type { User } from "../types";

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

export const authApi = {
  status: () => http.get<AuthStatus>("/auth/status"),
  signup: (email: string, password: string, display_name?: string) =>
    http.post<AuthStatus>("/auth/signup", { email, password, display_name }),
  login: (email: string, password: string) => http.post<AuthStatus>("/auth/login", { email, password }),
  logout: () => http.post<AuthStatus>("/auth/logout"),
};
