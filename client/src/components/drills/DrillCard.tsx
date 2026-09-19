import type { Drill } from "../../types";

const CATEGORY_LABELS: Record<Drill["category"], string> = {
  full_swing: "Full swing",
  short_game: "Short game",
  putting: "Putting",
};

export function DrillCard({
  drill,
  completed,
  onToggleCompleted,
}: {
  drill: Drill;
  completed?: boolean;
  onToggleCompleted?: (completed: boolean) => void;
}) {
  return (
    <div className="card" style={{ opacity: completed ? 0.6 : 1, display: "flex", gap: 12 }}>
      {onToggleCompleted && (
        <input
          type="checkbox"
          checked={completed ?? false}
          onChange={(e) => onToggleCompleted(e.target.checked)}
          style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0, accentColor: "var(--color-accent)" }}
        />
      )}
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, textDecoration: completed ? "line-through" : "none" }}>
          {drill.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "3px 0 8px" }}>
          {CATEGORY_LABELS[drill.category]} &middot; {drill.est_duration_min} min &middot; difficulty {drill.difficulty}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.4 }}>{drill.description}</div>
        <div style={{ fontSize: 11, color: "var(--color-accent-text)", marginTop: 8, fontWeight: 600 }}>
          Helps with: {drill.targets_miss_pattern.split(",").join(", ").replace(/_/g, " ")}
        </div>
      </div>
    </div>
  );
}
