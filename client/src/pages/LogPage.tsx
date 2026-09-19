import { useEffect, useState } from "react";
import { clubsApi } from "../api/clubs";
import { sessionsApi } from "../api/sessions";
import { sortClubs } from "../lib/clubOrder";
import { ShotLogForm } from "../components/logging/ShotLogForm";
import { PuttLogForm } from "../components/logging/PuttLogForm";
import type { useActiveSession } from "../hooks/useActiveSession";
import type { Club, Session, SessionType } from "../types";

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "range", label: "Range" },
  { value: "course", label: "Course" },
  { value: "putting_green", label: "Putting green" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function LogPage({ activeSessionState }: { activeSessionState: ReturnType<typeof useActiveSession> }) {
  const { activeSession, setActiveSession, startSession, ensureSession } = activeSessionState;
  const [clubs, setClubs] = useState<Club[]>([]);
  const [tab, setTab] = useState<"shot" | "putt">("shot");
  const [starting, setStarting] = useState(false);
  const [resumableSession, setResumableSession] = useState<Session | null>(null);

  useEffect(() => {
    clubsApi.list().then((list) => setClubs(sortClubs(list)));
  }, []);

  async function openStartPanel() {
    setStarting(true);
    const sessions = await sessionsApi.list({ limit: 1 });
    const mostRecent = sessions[0];
    setResumableSession(mostRecent && mostRecent.date === todayIso() ? mostRecent : null);
  }

  function resumeSession(session: Session) {
    setActiveSession(session);
    setStarting(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Log</h1>
        {activeSession ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveSession(null)}>
            {activeSession.name ?? `${activeSession.type} session`} &middot; End
          </button>
        ) : starting ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {resumableSession && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => resumeSession(resumableSession)}
                style={{ background: "var(--color-accent-soft)", borderColor: "var(--color-accent)", color: "var(--color-accent-text)" }}
              >
                Resume {resumableSession.name ?? `${resumableSession.type} session`}
              </button>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              {SESSION_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    startSession(t.value);
                    setStarting(false);
                  }}
                >
                  New {t.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm" onClick={openStartPanel}>
            Start session
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "var(--color-surface-sunken)", borderRadius: "var(--radius-md)", padding: 4 }}>
        <button
          type="button"
          onClick={() => setTab("shot")}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: tab === "shot" ? "var(--color-surface)" : "transparent",
            color: tab === "shot" ? "var(--color-text)" : "var(--color-text-muted)",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: tab === "shot" ? "var(--shadow-xs)" : "none",
            cursor: "pointer",
          }}
        >
          Shot
        </button>
        <button
          type="button"
          onClick={() => setTab("putt")}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: tab === "putt" ? "var(--color-surface)" : "transparent",
            color: tab === "putt" ? "var(--color-text)" : "var(--color-text-muted)",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: tab === "putt" ? "var(--shadow-xs)" : "none",
            cursor: "pointer",
          }}
        >
          Putt
        </button>
      </div>

      {tab === "shot" ? (
        <ShotLogForm clubs={clubs} ensureSession={() => ensureSession("range")} />
      ) : (
        <PuttLogForm ensureSession={() => ensureSession("putting_green")} />
      )}
    </div>
  );
}
