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
    <div className="page">
      <Link to="/plans" style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>
        &larr; All plans
      </Link>
      <h1 className="page-title" style={{ margin: "10px 0 18px" }}>Practice plan</h1>
      <PracticePlanView plan={plan} />
    </div>
  );
}
