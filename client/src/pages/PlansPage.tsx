import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { practicePlansApi } from "../api/practicePlans";
import { PracticePlanList } from "../components/plans/PracticePlanList";
import type { PracticePlan } from "../types";

export function PlansPage() {
  const [plans, setPlans] = useState<PracticePlan[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    practicePlansApi.list().then(setPlans);
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const plan = await practicePlansApi.generate();
      navigate(`/plans/${plan.id}`);
    } catch {
      setError("Failed to generate a plan — log a few more shots or putts first.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Practice plans</h1>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate plan"}
        </button>
      </div>
      {error && <p style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <PracticePlanList plans={plans} />
    </div>
  );
}
