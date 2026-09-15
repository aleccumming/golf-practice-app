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
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        border: "1px solid #ddd",
        opacity: completed ? 0.6 : 1,
        display: "flex",
        gap: 10,
      }}
    >
      {onToggleCompleted && (
        <input
          type="checkbox"
          checked={completed ?? false}
          onChange={(e) => onToggleCompleted(e.target.checked)}
          style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }}
        />
      )}
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, textDecoration: completed ? "line-through" : "none" }}>
          {drill.name}
        </div>
        <div style={{ fontSize: 11, color: "#666", margin: "2px 0 6px" }}>
          {CATEGORY_LABELS[drill.category]} &middot; {drill.est_duration_min} min &middot; difficulty {drill.difficulty}
        </div>
        <div style={{ fontSize: 13, color: "#444" }}>{drill.description}</div>
      </div>
    </div>
  );
}
