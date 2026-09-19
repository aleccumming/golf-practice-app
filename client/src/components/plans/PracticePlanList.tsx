import { Link } from "react-router-dom";
import type { PracticePlan } from "../../types";

export function PracticePlanList({ plans }: { plans: PracticePlan[] }) {
  if (plans.length === 0) {
    return <p className="empty-state">No practice plans generated yet.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {plans.map((plan) => (
        <li key={plan.id}>
          <Link to={`/plans/${plan.id}`} className="card card-link" style={{ display: "block" }}>
            <div style={{ fontSize: 12, color: "var(--color-text-faint)" }}>{plan.generated_at}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{plan.based_on_pattern ?? "Mixed practice"}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{plan.total_duration_min} min</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
