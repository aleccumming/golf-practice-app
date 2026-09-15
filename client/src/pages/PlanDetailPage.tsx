import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { practicePlansApi } from "../api/practicePlans";
import type { PracticePlanDetail } from "../api/practicePlans";
import { PracticePlanView } from "../components/plans/PracticePlanView";

export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<PracticePlanDetail | null>(null);

  useEffect(() => {
    practicePlansApi.get(Number(id)).then(setPlan);
  }, [id]);

  if (!plan) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <Link to="/plans" style={{ fontSize: 13, color: "#666" }}>
        &larr; All plans
      </Link>
      <h1 style={{ fontSize: 18, margin: "8px 0 16px" }}>Practice plan</h1>
      <PracticePlanView plan={plan} />
    </div>
  );
}
