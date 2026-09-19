import { useState } from "react";
import { ClubPicker } from "../pickers/ClubPicker";
import { ShotTypePicker } from "../pickers/ShotTypePicker";
import { TargetLinePicker } from "../pickers/TargetLinePicker";
import { ContactPicker } from "../pickers/ContactPicker";
import { ShotResultPicker } from "../pickers/ShotResultPicker";
import { shotsApi } from "../../api/shots";
import type { Club, Contact, Lie, ShotResult, ShotType, TargetLine } from "../../types";

const LIE_OPTIONS: { value: Lie; label: string }[] = [
  { value: "range_mat", label: "Mat" },
  { value: "tee", label: "Tee" },
  { value: "fairway", label: "Fairway" },
  { value: "rough", label: "Rough" },
  { value: "sand", label: "Sand" },
];

export function ShotLogForm({
  clubs,
  ensureSession,
}: {
  clubs: Club[];
  ensureSession: () => Promise<number | null>;
}) {
  const [clubId, setClubId] = useState<number | null>(null);
  const [shotType, setShotType] = useState<ShotType | null>(null);
  const [targetLine, setTargetLine] = useState<TargetLine>("straight");
  const [shotResult, setShotResult] = useState<ShotResult | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [lie, setLie] = useState<Lie>("range_mat");
  const [saving, setSaving] = useState(false);
  const [loggedCount, setLoggedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const canSave = clubId !== null && shotType !== null && shotResult !== null && !saving;

  async function handleSave() {
    if (!canSave || clubId === null || shotType === null || shotResult === null) return;
    setSaving(true);
    setError(null);
    try {
      const sessionId = await ensureSession();
      await shotsApi.create({
        session_id: sessionId,
        club_id: clubId,
        shot_type: shotType,
        target_line: targetLine,
        shot_result: shotResult,
        miss_distance_yds: null,
        contact,
        lie,
        distance_to_target_yds: null,
        confidence_pre_shot: null,
        notes: null,
      });
      setLoggedCount((c) => c + 1);
      setShotResult(null);
      setContact(null);
    } catch {
      setError("Failed to save shot");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <section className="section">
        <h3 className="section-label">Club</h3>
        <ClubPicker clubs={clubs} value={clubId} onChange={setClubId} />
      </section>

      <section className="section">
        <h3 className="section-label">Shot type</h3>
        <ShotTypePicker value={shotType} onChange={setShotType} />
      </section>

      <section className="section">
        <h3 className="section-label">What were you trying to hit?</h3>
        <TargetLinePicker value={targetLine} onChange={setTargetLine} />
      </section>

      <section className="section">
        <h3 className="section-label">Result</h3>
        <ShotResultPicker value={shotResult} onChange={setShotResult} />
      </section>

      <details className="section">
        <summary style={{ fontSize: 13, color: "var(--color-text-muted)", cursor: "pointer", fontWeight: 600 }}>
          More options (contact, lie)
        </summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 14 }}>
          <div>
            <h3 className="section-label">Contact (optional)</h3>
            <ContactPicker value={contact} onChange={setContact} />
          </div>
          <div>
            <h3 className="section-label">Lie</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LIE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip chip-pill${lie === opt.value ? " is-active" : ""}`}
                  onClick={() => setLie(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </details>

      <button type="button" className="btn btn-primary btn-lg btn-block" onClick={handleSave} disabled={!canSave}>
        {saving ? "Saving..." : "Save shot"}
      </button>

      {error && <p style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 10 }}>{error}</p>}
      <p className="hint" style={{ marginTop: 10 }}>Logged this session: {loggedCount}</p>
    </div>
  );
}
