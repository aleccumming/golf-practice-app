import { useEffect, useState } from "react";
import { clubsApi } from "../api/clubs";
import { sessionsApi } from "../api/sessions";
import { ShotLogForm } from "../components/logging/ShotLogForm";
import { PuttLogForm } from "../components/logging/PuttLogForm";
import type { Club, Session, SessionType } from "../types";

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "range", label: "Range" },
  { value: "course", label: "Course" },
  { value: "putting_green", label: "Putting green" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function LogPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [tab, setTab] = useState<"shot" | "putt">("shot");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    clubsApi.list().then(setClubs);
  }, []);

  async function startSession(type: SessionType) {
    const session = await sessionsApi.create({ date: todayIso(), type });
    setActiveSession(session);
    setStarting(false);
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>Log</h1>
        {activeSession ? (
          <button
            type="button"
            onClick={() => setActiveSession(null)}
            style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
          >
            {activeSession.type} session — end
          </button>
        ) : starting ? (
          <div style={{ display: "flex", gap: 6 }}>
            {SESSION_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => startSession(t.value)}
                style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setStarting(true)}
            style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
          >
            Start session
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setTab("shot")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: tab === "shot" ? "#2f8f4e" : "#eee",
            color: tab === "shot" ? "#fff" : "#333",
            fontWeight: 600,
          }}
        >
          Shot
        </button>
        <button
          type="button"
          onClick={() => setTab("putt")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: tab === "putt" ? "#2f8f4e" : "#eee",
            color: tab === "putt" ? "#fff" : "#333",
            fontWeight: 600,
          }}
        >
          Putt
        </button>
      </div>

      {tab === "shot" ? (
        <ShotLogForm clubs={clubs} sessionId={activeSession?.id ?? null} />
      ) : (
        <PuttLogForm sessionId={activeSession?.id ?? null} />
      )}
    </div>
  );
}
