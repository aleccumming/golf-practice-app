import { useEffect, useState } from "react";
import { practicePlansApi } from "../../api/practicePlans";
import type { ProgressEntry } from "../../api/practicePlans";

export function ProgressView({ planId }: { planId: number }) {
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);

  useEffect(() => {
    practicePlansApi.progress(planId).then(setEntries);
  }, [planId]);

  if (!entries) return <p style={{ fontSize: 13, color: "#999" }}>Loading progress...</p>;
  if (entries.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {entries.map((entry) => (
        <div key={`${entry.tag}-${entry.club_id ?? "none"}`} style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}>
          <div style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{entry.tag.replace(/_/g, " ")}</div>
          {entry.insufficient_data ? (
            <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
              Not enough new data yet ({entry.sample_size} logged since this plan) &mdash; baseline was{" "}
              {Math.round(entry.baseline_pct * 100)}%
            </div>
          ) : (
            <div style={{ fontSize: 12, marginTop: 4 }}>
              <span style={{ color: "#666" }}>Baseline {Math.round(entry.baseline_pct * 100)}%</span>
              {" -> "}
              <span style={{ fontWeight: 700 }}>Now {Math.round((entry.current_pct ?? 0) * 100)}%</span>
              <span
                style={{
                  marginLeft: 8,
                  fontWeight: 700,
                  color: (entry.delta ?? 0) <= 0 ? "#2f8f4e" : "#c0392b",
                }}
              >
                {(entry.delta ?? 0) <= 0 ? "▼" : "▲"} {Math.abs(Math.round((entry.delta ?? 0) * 100))}pt
              </span>
              <span style={{ color: "#999" }}> ({entry.sample_size} new)</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
