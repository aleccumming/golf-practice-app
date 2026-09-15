import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { sessionsApi } from "../../api/sessions";
import { shotsApi } from "../../api/shots";
import { puttsApi } from "../../api/putts";
import { clubsApi } from "../../api/clubs";
import { SessionTypeBadge } from "./SessionList";
import type { Club, Putt, SessionDetail as SessionDetailModel, Shot } from "../../types";

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const [session, setSession] = useState<SessionDetailModel | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [putts, setPutts] = useState<Putt[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    sessionsApi.get(sessionId).then(setSession);
    shotsApi.list({ session_id: sessionId }).then(setShots);
    puttsApi.list({ session_id: sessionId }).then(setPutts);
    clubsApi.list().then(setClubs);
  }, [sessionId]);

  if (!session) return <div style={{ padding: 16 }}>Loading...</div>;

  const clubName = (clubId: number) => clubs.find((c) => c.id === clubId)?.name ?? `#${clubId}`;

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <Link to="/sessions" style={{ fontSize: 13, color: "#666" }}>
        &larr; All sessions
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 16px" }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>{session.date}</h1>
        <SessionTypeBadge type={session.type} />
      </div>

      {session.notes && <p style={{ color: "#666", fontSize: 14 }}>{session.notes}</p>}

      <h2 style={{ fontSize: 14, marginTop: 20 }}>Shots ({shots.length})</h2>
      {shots.length === 0 ? (
        <p style={{ color: "#999", fontSize: 13 }}>No shots logged.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {shots.map((shot) => (
            <li key={shot.id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 8, fontSize: 13 }}>
              <strong>{clubName(shot.club_id)}</strong> {shot.shot_type} &mdash; {shot.miss_direction}
              {shot.contact ? ` (${shot.contact})` : ""}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ fontSize: 14, marginTop: 20 }}>Putts ({putts.length})</h2>
      {putts.length === 0 ? (
        <p style={{ color: "#999", fontSize: 13 }}>No putts logged.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {putts.map((putt) => (
            <li key={putt.id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 8, fontSize: 13 }}>
              {putt.distance_ft}ft &mdash; {putt.result}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
