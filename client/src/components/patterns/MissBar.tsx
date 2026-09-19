export function MissBar({ label, pct, flagged }: { label: string; pct: number; flagged?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
      <span style={{ width: 66, flexShrink: 0, textTransform: "capitalize", color: "var(--color-text-muted)" }}>{label}</span>
      <div className="meter-track" style={{ flex: 1 }}>
        <div
          className="meter-fill"
          style={{
            width: `${Math.round(pct * 100)}%`,
            background: flagged ? "var(--color-danger)" : "var(--color-accent)",
          }}
        />
      </div>
      <span style={{ width: 36, textAlign: "right", flexShrink: 0, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}
