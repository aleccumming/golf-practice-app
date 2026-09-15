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
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>Practice plans</h1>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          style={{ fontSize: 13, padding: "8px 14px", borderRadius: 8, border: "none", background: "#2f8f4e", color: "#fff" }}
        >
          {generating ? "Generating..." : "Generate plan"}
        </button>
      </div>
      {error && <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>}
      <PracticePlanList plans={plans} />
    </div>
  );
}
