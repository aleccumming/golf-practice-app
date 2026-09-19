import { useCallback, useEffect, useState } from "react";
import { authApi } from "../api/auth";
import type { User } from "../types";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authApi
      .status()
      .then((r) => {
        setAuthenticated(r.authenticated);
        setUser(r.user ?? null);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const r = await authApi.google(credential);
    setAuthenticated(r.authenticated);
    setUser(r.user ?? null);
    return r.authenticated;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setAuthenticated(false);
    setUser(null);
  }, []);

  return { authenticated, user, loginWithGoogle, logout, setUser };
}
