import type { Drill } from "../../types";
import { DrillCard } from "./DrillCard";

const CATEGORY_ORDER: Drill["category"][] = ["full_swing", "short_game", "putting"];
const CATEGORY_LABELS: Record<Drill["category"], string> = {
  full_swing: "Full swing",
  short_game: "Short game",
  putting: "Putting",
};

export function DrillLibrary({ drills }: { drills: Drill[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {CATEGORY_ORDER.map((category) => {
        const inCategory = drills.filter((d) => d.category === category);
        if (inCategory.length === 0) return null;
        return (
          <div key={category}>
            <h2 className="section-label">{CATEGORY_LABELS[category]}</h2>
            <div className="stack">
              {inCategory.map((drill) => (
                <DrillCard key={drill.id} drill={drill} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
