import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sessionsApi } from "../../api/sessions";
import { shotsApi } from "../../api/shots";
import { puttsApi } from "../../api/putts";
import { clubsApi } from "../../api/clubs";
import { SessionTypeBadge } from "./SessionList";
import type { Club, Putt, SessionDetail as SessionDetailModel, SessionType, ShotResult, Shot } from "../../types";

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "range", label: "Range" },
  { value: "course", label: "Course" },
  { value: "putting_green", label: "Putting green" },
];

const RESULT_COLORS: Record<ShotResult, string> = {
  good: "var(--color-accent)",
  pull: "var(--color-warning)",
  push: "var(--color-warning)",
  hook: "var(--color-danger)",
  slice: "var(--color-danger)",
};

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sessionId = Number(id);
  const [session, setSession] = useState<SessionDetailModel | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [putts, setPutts] = useState<Putt[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<SessionType>("range");
  const [editDuration, setEditDuration] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    sessionsApi.get(sessionId).then(setSession);
    shotsApi.list({ session_id: sessionId }).then(setShots);
    puttsApi.list({ session_id: sessionId }).then(setPutts);
    clubsApi.list().then(setClubs);
  }, [sessionId]);

  if (!session) return <div style={{ padding: 16 }}>Loading...</div>;

  const clubName = (clubId: number) => clubs.find((c) => c.id === clubId)?.name ?? `#${clubId}`;

  async function handleDelete() {
    if (!confirm("Delete this session? This also deletes all shots and putts logged in it. This can't be undone.")) return;
    setDeleting(true);
    await sessionsApi.delete(sessionId);
    navigate("/sessions");
  }

  async function deleteShot(id: number) {
    await shotsApi.delete(id);
    setShots((s) => s.filter((shot) => shot.id !== id));
  }

  async function deletePutt(id: number) {
    await puttsApi.delete(id);
    setPutts((p) => p.filter((putt) => putt.id !== id));
  }

  function startEdit() {
    if (!session) return;
    setEditName(session.name ?? "");
    setEditDate(session.date);
    setEditType(session.type);
    setEditDuration(session.duration_min != null ? String(session.duration_min) : "");
    setEditNotes(session.notes ?? "");
    setEditing(true);
  }

  async function saveEdit() {
    setSavingEdit(true);
    try {
      const updated = await sessionsApi.update(sessionId, {
        name: editName.trim() === "" ? null : editName.trim(),
        date: editDate,
        type: editType,
        duration_min: editDuration.trim() === "" ? null : Number(editDuration),
        notes: editNotes.trim() === "" ? null : editNotes,
      });
      setSession({ ...updated, counts: session!.counts });
      setEditing(false);
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="page">
      <Link to="/sessions" style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>
        &larr; All sessions
      </Link>

      {editing ? (
        <div className="card stack" style={{ margin: "14px 0" }}>
          <input
            type="text"
            placeholder="Session name (optional)"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="input"
          />
          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="input" />
          <div style={{ display: "flex", gap: 6 }}>
            {SESSION_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`chip chip-pill${editType === t.value ? " is-active" : ""}`}
                style={{ flex: 1 }}
                onClick={() => setEditType(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={editDuration}
            onChange={(e) => setEditDuration(e.target.value)}
            className="input"
          />
          <textarea
            placeholder="Notes"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={3}
            className="textarea"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit} disabled={savingEdit}>
              {savingEdit ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 4px" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{session.name ?? session.date}</h1>
            <SessionTypeBadge type={session.type} />
          </div>

          {session.name && <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 10 }}>{session.date}</p>}
          {session.notes && <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 6 }}>{session.notes}</p>}
          {session.duration_min != null && (
            <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 10 }}>{session.duration_min} min</p>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={startEdit}>
              Edit details
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete session"}
            </button>
          </div>
        </>
      )}

      <h2 className="section-label" style={{ marginTop: 24 }}>Shots ({shots.length})</h2>
      {shots.length === 0 ? (
        <p className="empty-state">No shots logged.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {shots.map((shot) => (
            <li key={shot.id} className="card" style={{ padding: 10, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span>
                <strong>{clubName(shot.club_id)}</strong> {shot.shot_type} &mdash; aimed {shot.target_line}
                {shot.contact ? ` (${shot.contact})` : ""}{" "}
                <span style={{ fontWeight: 700, color: RESULT_COLORS[shot.shot_result] }}>
                  {shot.shot_result === "good" ? "Good shot" : shot.shot_result}
                </span>
              </span>
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)", flexShrink: 0 }} onClick={() => deleteShot(shot.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="section-label" style={{ marginTop: 24 }}>Putts ({putts.length})</h2>
      {putts.length === 0 ? (
        <p className="empty-state">No putts logged.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {putts.map((putt) => (
            <li key={putt.id} className="card" style={{ padding: 10, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span>
                {putt.distance_ft}ft &mdash; {putt.result}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)", flexShrink: 0 }} onClick={() => deletePutt(putt.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
