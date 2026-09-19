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

export function PuttLogForm({ ensureSession }: { ensureSession: () => Promise<number | null> }) {
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
      const sessionId = await ensureSession();
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
    <div>
      <section className="section">
        <h3 className="section-label">Distance (ft)</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DISTANCE_CHIPS.map((d) => (
            <button
              key={d}
              type="button"
              className={`chip${distance === d ? " is-active" : ""}`}
              style={{ minWidth: 46, padding: "12px 14px" }}
              onClick={() => {
                setDistance(d);
                setCustomDistance("");
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
            className="input"
            style={{ width: 76 }}
          />
        </div>
      </section>

      <section className="section">
        <h3 className="section-label">Break</h3>
        <ChoiceGrid<PuttBreak> options={BREAK_OPTIONS} value={breakDir} onChange={setBreakDir} columns={3} />
      </section>

      <section className="section">
        <h3 className="section-label">Slope</h3>
        <ChoiceGrid<PuttSlope> options={SLOPE_OPTIONS} value={slope} onChange={setSlope} columns={3} />
      </section>

      <section className="section">
        <h3 className="section-label">Result</h3>
        <ChoiceGrid<PuttResult> options={RESULT_OPTIONS} value={result} onChange={setResult} columns={2} />
      </section>

      <button type="button" className="btn btn-primary btn-lg btn-block" onClick={handleSave} disabled={!canSave}>
        {saving ? "Saving..." : "Save putt"}
      </button>

      {error && <p style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 10 }}>{error}</p>}
      <p className="hint" style={{ marginTop: 10 }}>Logged this session: {loggedCount}</p>
    </div>
  );
}
