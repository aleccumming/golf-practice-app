export function MissBar({ label, pct, flagged }: { label: string; pct: number; flagged?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <span style={{ width: 70, flexShrink: 0, textTransform: "capitalize" }}>{label}</span>
      <div style={{ flex: 1, background: "#eee", borderRadius: 6, height: 16, overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.round(pct * 100)}%`,
            background: flagged ? "#c0392b" : "#2f8f4e",
            height: "100%",
          }}
        />
      </div>
      <span style={{ width: 40, textAlign: "right", flexShrink: 0 }}>{Math.round(pct * 100)}%</span>
    </div>
  );
}
