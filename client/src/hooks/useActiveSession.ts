import { useCallback, useState } from "react";
import { sessionsApi } from "../api/sessions";
import type { Session, SessionType } from "../types";

const STORAGE_KEY = "golf.activeSession";

function loadStored(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function persist(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // private browsing / storage disabled — session just won't survive a reload
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Lives at the App level (not inside a route's page component) so the active
// session survives navigating between tabs, and in localStorage so it survives reloads.
export function useActiveSession() {
  const [activeSession, setActiveSessionState] = useState<Session | null>(loadStored);

  const setActiveSession = useCallback((session: Session | null) => {
    setActiveSessionState(session);
    persist(session);
  }, []);

  const startSession = useCallback(
    async (type: SessionType) => {
      const session = await sessionsApi.create({ date: todayIso(), type });
      setActiveSession(session);
      return session;
    },
    [setActiveSession]
  );

  const ensureSession = useCallback(
    async (defaultType: SessionType): Promise<number | null> => {
      if (activeSession) return activeSession.id;
      try {
        const session = await sessionsApi.create({ date: todayIso(), type: defaultType });
        setActiveSession(session);
        return session.id;
      } catch {
        return null; // offline — the shot/putt itself still queues fine unsessioned
      }
    },
    [activeSession, setActiveSession]
  );

  return { activeSession, setActiveSession, startSession, ensureSession };
}
