import { useState } from "react";
import { ClubPicker } from "../pickers/ClubPicker";
import { ShotTypePicker } from "../pickers/ShotTypePicker";
import { TargetLinePicker } from "../pickers/TargetLinePicker";
import { ContactPicker } from "../pickers/ContactPicker";
import { MissCompass } from "../compass/MissCompass";
import { shotsApi } from "../../api/shots";
import type { Club, Contact, Lie, MissDirection, ShotType, TargetLine } from "../../types";

const LIE_OPTIONS: { value: Lie; label: string }[] = [
  { value: "range_mat", label: "Mat" },
  { value: "tee", label: "Tee" },
  { value: "fairway", label: "Fairway" },
  { value: "rough", label: "Rough" },
  { value: "sand", label: "Sand" },
];

export function ShotLogForm({ clubs, sessionId }: { clubs: Club[]; sessionId: number | null }) {
  const [clubId, setClubId] = useState<number | null>(null);
  const [shotType, setShotType] = useState<ShotType | null>(null);
  const [targetLine, setTargetLine] = useState<TargetLine>("straight");
  const [missDirection, setMissDirection] = useState<MissDirection | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [lie, setLie] = useState<Lie>("range_mat");
  const [saving, setSaving] = useState(false);
  const [loggedCount, setLoggedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const canSave = clubId !== null && shotType !== null && missDirection !== null && !saving;

  async function handleSave() {
    if (!canSave || clubId === null || shotType === null || missDirection === null) return;
    setSaving(true);
    setError(null);
    try {
      await shotsApi.create({
        session_id: sessionId,
        club_id: clubId,
        shot_type: shotType,
        target_line: targetLine,
        miss_direction: missDirection,
        miss_distance_yds: null,
        contact,
        lie,
        distance_to_target_yds: null,
        confidence_pre_shot: null,
        notes: null,
      });
      setLoggedCount((c) => c + 1);
      setMissDirection(null);
      setContact(null);
    } catch {
      setError("Failed to save shot");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Club</h3>
        <ClubPicker clubs={clubs} value={clubId} onChange={setClubId} />
      </section>

      <section>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Shot type</h3>
        <ShotTypePicker value={shotType} onChange={setShotType} />
      </section>

      <section>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Miss direction</h3>
        <MissCompass value={missDirection ?? "straight"} onChange={setMissDirection} />
      </section>

      <details>
        <summary style={{ fontSize: 13, color: "#666", cursor: "pointer" }}>More options (target line, contact, lie)</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
          <div>
            <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Target line</h3>
            <TargetLinePicker value={targetLine} onChange={setTargetLine} />
          </div>
          <div>
            <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Contact (optional)</h3>
            <ContactPicker value={contact} onChange={setContact} />
          </div>
          <div>
            <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Lie</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LIE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLie(opt.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: lie === opt.value ? "2px solid #2f8f4e" : "1px solid #ccc",
                    background: lie === opt.value ? "#e6f4ea" : "#fff",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </details>

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
        {saving ? "Saving..." : "Save shot"}
      </button>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}
      <p style={{ fontSize: 13, color: "#666" }}>Logged this session: {loggedCount}</p>
    </div>
  );
}
