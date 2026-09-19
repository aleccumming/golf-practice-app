import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { offlineQueue } from "../../offline/db";
import { onQueueChanged } from "../../offline/syncManager";

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
        background: "var(--color-warning)",
        color: "#fff",
        fontSize: 12,
        fontWeight: 600,
        textAlign: "center",
        padding: "6px 0",
        zIndex: 11,
      }}
    >
      {count} {count === 1 ? "entry" : "entries"} queued — will sync when back online
    </div>
  );
}

const NAV_ITEMS: { to: string; label: string; end?: boolean; icon: (active: boolean) => ReactElement }[] = [
  {
    to: "/",
    label: "Log",
    end: true,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: "/sessions",
    label: "Sessions",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/patterns",
    label: "Patterns",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
        <path d="M7 16l3.5-5 3 3L18 7" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/plans",
    label: "Plans",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 3.5h9l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinejoin="round" />
        <path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/drills",
    label: "Drills",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      </svg>
    ),
  },
];

export function NavBar() {
  return (
    <>
      <PendingSyncBadge />
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          boxShadow: "0 -2px 10px rgba(32,31,28,0.04)",
          zIndex: 10,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div style={{ display: "flex", width: "100%", maxWidth: 480 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={{ flex: 1, textDecoration: "none" }}
            >
              {({ isActive }) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    padding: "9px 0 8px",
                    color: isActive ? "var(--color-accent)" : "var(--color-text-faint)",
                  }}
                >
                  {item.icon(isActive)}
                  <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
