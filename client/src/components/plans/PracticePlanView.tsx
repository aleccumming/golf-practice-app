import { useState } from "react";
import { DrillCard } from "../drills/DrillCard";
import { practicePlansApi } from "../../api/practicePlans";
import type { PracticePlanDetail } from "../../api/practicePlans";
import { ProgressView } from "./ProgressView";

export function PracticePlanView({ plan: initialPlan }: { plan: PracticePlanDetail }) {
  const [plan, setPlan] = useState(initialPlan);

  async function toggleDrill(planDrillId: number, completed: boolean) {
    await practicePlansApi.setDrillCompleted(planDrillId, completed);
    setPlan((p) => ({
      ...p,
      drills: p.drills.map((d) => (d.id === planDrillId ? { ...d, completed } : d)),
    }));
  }

  const doneCount = plan.drills.filter((d) => d.completed).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        {plan.based_on_pattern && <p style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>{plan.based_on_pattern}</p>}
        <p style={{ fontSize: 12, color: "#999", margin: 0 }}>
          {plan.total_duration_min} min &middot; {doneCount}/{plan.drills.length} done
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {plan.drills.map((pd) => (
          <DrillCard key={pd.id} drill={pd.drill} completed={pd.completed} onToggleCompleted={(c) => toggleDrill(pd.id, c)} />
        ))}
      </div>

      {doneCount > 0 && (
        <div>
          <h2 style={{ fontSize: 14, margin: "8px 0 10px" }}>Progress since this plan</h2>
          <ProgressView planId={plan.id} />
        </div>
      )}
    </div>
  );
}
