import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sessionsApi } from "../api/sessions";
import { SessionList } from "../components/sessions/SessionList";
import type { Session } from "../types";

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    sessionsApi.list().then(setSessions);
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>Sessions</h1>
        <Link to="/" style={{ fontSize: 13 }}>
          Log new
        </Link>
      </div>
      <SessionList sessions={sessions} />
    </div>
  );
}
