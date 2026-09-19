import { Link } from "react-router-dom";
import type { Session } from "../../types";

const TYPE_LABELS: Record<Session["type"], string> = {
  range: "Range",
  course: "Course",
  putting_green: "Putting green",
};

const TYPE_COLORS: Record<Session["type"], string> = {
  range: "var(--color-accent)",
  course: "var(--color-warning)",
  putting_green: "var(--color-info)",
};

export function SessionTypeBadge({ type }: { type: Session["type"] }) {
  return (
    <span className="badge" style={{ background: TYPE_COLORS[type] }}>
      {TYPE_LABELS[type]}
    </span>
  );
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <p className="empty-state">No sessions logged yet.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {sessions.map((session) => (
        <li key={session.id}>
          <Link to={`/sessions/${session.id}`} className="card card-link" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              <div style={{ fontWeight: 600 }}>{session.name ?? session.date}</div>
              {session.name && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{session.date}</div>}
              {session.notes && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{session.notes}</div>}
            </span>
            <SessionTypeBadge type={session.type} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
