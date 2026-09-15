import { useState } from "react";
import { ChoiceGrid } from "../pickers/ChoiceGrid";
import { puttsApi } from "../../api/putts";
import type { PuttBreak, PuttResult, PuttSlope } from "../../types";

const DISTANCE_CHIPS = [2, 3, 5, 8, 10, 15, 20, 30];

const BREAK_OPTIONS: { value: PuttBreak; label: string }[] = [
  { value: "straight", label: "Straight" },
  { value: "left_to_right", label: "L to R" },
  { value: "right_to_left", label: "R to L" },
];

const SLOPE_OPTIONS: { value: PuttSlope; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "uphill", label: "Uphill" },
  { value: "downhill", label: "Downhill" },
];

const RESULT_OPTIONS: { value: PuttResult; label: string }[] = [
  { value: "made", label: "Made" },
  { value: "missed_left", label: "Missed left" },
  { value: "missed_right", label: "Missed right" },
  { value: "missed_short", label: "Missed short" },
  { value: "missed_long", label: "Missed long" },
];

export function PuttLogForm({ sessionId }: { sessionId: number | null }) {
  const [distance, setDistance] = useState<number | null>(null);
  const [customDistance, setCustomDistance] = useState("");
  const [breakDir, setBreakDir] = useState<PuttBreak>("straight");
  const [slope, setSlope] = useState<PuttSlope>("flat");
  const [result, setResult] = useState<PuttResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggedCount, setLoggedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const effectiveDistance = distance ?? (customDistance ? Number(customDistance) : null);
  const canSave = effectiveDistance !== null && effectiveDistance > 0 && result !== null && !saving;

  async function handleSave() {
    if (!canSave || effectiveDistance === null || result === null) return;
    setSaving(true);
    setError(null);
    try {
      await puttsApi.create({
        session_id: sessionId,
        distance_ft: effectiveDistance,
        break: breakDir,
        slope,
        result,
      });
      setLoggedCount((c) => c + 1);
      setResult(null);
    } catch {
      setError("Failed to save putt");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Distance (ft)</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DISTANCE_CHIPS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDistance(d);
                setCustomDistance("");
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: distance === d ? "2px solid #2f8f4e" : "1px solid #ccc",
                background: distance === d ? "#e6f4ea" : "#fff",
                fontWeight: distance === d ? 700 : 500,
              }}
            >
              {d}
            </button>
          ))}
          <input
            type="number"
            placeholder="other"
            value={customDistance}
            onChange={(e) => {
              setCustomDistance(e.target.value);
              setDistance(null);
            }}
            style={{ width: 70, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>
      </section>

      <section>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Break</h3>
        <ChoiceGrid<PuttBreak> options={BREAK_OPTIONS} value={breakDir} onChange={setBreakDir} columns={3} />
      </section>

      <section>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Slope</h3>
        <ChoiceGrid<PuttSlope> options={SLOPE_OPTIONS} value={slope} onChange={setSlope} columns={3} />
      </section>

      <section>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Result</h3>
        <ChoiceGrid<PuttResult> options={RESULT_OPTIONS} value={result} onChange={setResult} columns={2} />
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        style={{
          fontSize: 18,
          padding: 16,
          borderRadius: 10,
          background: canSave ? "#2f8f4e" : "#aaa",
          color: "#fff",
          border: "none",
        }}
      >
        {saving ? "Saving..." : "Save putt"}
      </button>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}
      <p style={{ fontSize: 13, color: "#666" }}>Logged this session: {loggedCount}</p>
    </div>
  );
}
