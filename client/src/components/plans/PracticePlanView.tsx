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
    <div>
      <div className="card" style={{ marginBottom: 20, background: "var(--color-accent-soft)", border: "none" }}>
        {plan.based_on_pattern && <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent-text)", marginBottom: 4 }}>{plan.based_on_pattern}</p>}
        <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {plan.total_duration_min} min &middot; {doneCount}/{plan.drills.length} done
        </p>
      </div>

      <div className="stack" style={{ marginBottom: 20 }}>
        {plan.drills.map((pd) => (
          <DrillCard key={pd.id} drill={pd.drill} completed={pd.completed} onToggleCompleted={(c) => toggleDrill(pd.id, c)} />
        ))}
      </div>

      {plan.targets.length > 0 && (
        <div>
          <h2 className="section-label">Progress since this plan</h2>
          <ProgressView planId={plan.id} />
        </div>
      )}
    </div>
  );
}
