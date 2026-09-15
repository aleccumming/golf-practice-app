import { Link } from "react-router-dom";
import type { PracticePlan } from "../../types";

export function PracticePlanList({ plans }: { plans: PracticePlan[] }) {
  if (plans.length === 0) {
    return <p style={{ color: "#999", fontSize: 13 }}>No practice plans generated yet.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {plans.map((plan) => (
        <li key={plan.id}>
          <Link
            to={`/plans/${plan.id}`}
            style={{ display: "block", padding: 14, borderRadius: 10, border: "1px solid #ddd", textDecoration: "none", color: "inherit" }}
          >
            <div style={{ fontSize: 12, color: "#999" }}>{plan.generated_at}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{plan.based_on_pattern ?? "Mixed practice"}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{plan.total_duration_min} min</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
