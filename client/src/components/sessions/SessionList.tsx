import { Link } from "react-router-dom";
import type { Session } from "../../types";

const TYPE_LABELS: Record<Session["type"], string> = {
  range: "Range",
  course: "Course",
  putting_green: "Putting green",
};

const TYPE_COLORS: Record<Session["type"], string> = {
  range: "#2f8f4e",
  course: "#b8860b",
  putting_green: "#3b6fd6",
};

export function SessionTypeBadge({ type }: { type: Session["type"] }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#fff",
        background: TYPE_COLORS[type],
        padding: "2px 8px",
        borderRadius: 999,
      }}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <p style={{ color: "#666", fontSize: 14 }}>No sessions logged yet.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {sessions.map((session) => (
        <li key={session.id}>
          <Link
            to={`/sessions/${session.id}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 14,
              borderRadius: 10,
              border: "1px solid #ddd",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span>
              <div style={{ fontWeight: 600 }}>{session.date}</div>
              {session.notes && <div style={{ fontSize: 12, color: "#666" }}>{session.notes}</div>}
            </span>
            <SessionTypeBadge type={session.type} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
