import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { offlineQueue } from "../../offline/db";
import { onQueueChanged } from "../../offline/syncManager";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  flex: 1,
  textAlign: "center" as const,
  padding: "10px 0",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: isActive ? 700 : 500,
  color: isActive ? "#2f8f4e" : "#666",
});

function PendingSyncBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    function refresh() {
      offlineQueue.count().then((c) => {
        if (!cancelled) setCount(c);
      });
    }
    refresh();
    const unsubscribe = onQueueChanged(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  if (count === 0) return null;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        maxWidth: 480,
        margin: "0 auto",
        background: "#b8860b",
        color: "#fff",
        fontSize: 12,
        textAlign: "center",
        padding: "4px 0",
        zIndex: 11,
      }}
    >
      {count} {count === 1 ? "entry" : "entries"} queued — will sync when back online
    </div>
  );
}

export function NavBar() {
  return (
    <>
      <PendingSyncBadge />
      <nav
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          borderBottom: "1px solid #eee",
          background: "#fff",
          maxWidth: 480,
          margin: "0 auto",
          zIndex: 10,
        }}
      >
        <NavLink to="/" end style={linkStyle}>
          Log
        </NavLink>
        <NavLink to="/sessions" style={linkStyle}>
          Sessions
        </NavLink>
        <NavLink to="/patterns" style={linkStyle}>
          Patterns
        </NavLink>
        <NavLink to="/plans" style={linkStyle}>
          Plans
        </NavLink>
        <NavLink to="/drills" style={linkStyle}>
          Drills
        </NavLink>
      </nav>
    </>
  );
}
