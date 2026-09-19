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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Sessions</h1>
        <Link to="/" className="btn btn-secondary btn-sm">
          Log new
        </Link>
      </div>
      <SessionList sessions={sessions} />
    </div>
  );
}
