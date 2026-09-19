import { useEffect, useState } from "react";
import { clubsApi } from "../api/clubs";
import { usersApi } from "../api/users";
import { sortClubs } from "../lib/clubOrder";
import type { Club, ClubType, Handedness, PrimaryGoal, User } from "../types";

const EXTRA_CLUB_OPTIONS: { name: string; type: ClubType }[] = [
  { name: "2i", type: "iron" },
  { name: "3i", type: "iron" },
  { name: "7W", type: "wood" },
  { name: "3H", type: "hybrid" },
  { name: "4H", type: "hybrid" },
  { name: "5H", type: "hybrid" },
  { name: "6H", type: "hybrid" },
  { name: "50°", type: "wedge" },
  { name: "52°", type: "wedge" },
  { name: "54°", type: "wedge" },
  { name: "56°", type: "wedge" },
  { name: "58°", type: "wedge" },
  { name: "60°", type: "wedge" },
];

const GOAL_OPTIONS: { value: PrimaryGoal; label: string }[] = [
  { value: "lower_scores", label: "Lower my scores" },
  { value: "full_swing", label: "Fix my full swing" },
  { value: "short_game", label: "Improve my short game" },
  { value: "putting", label: "Improve my putting" },
];

const SKILL_AREAS: { key: "skill_driving" | "skill_irons" | "skill_short_game" | "skill_putting"; label: string }[] = [
  { key: "skill_driving", label: "Driving" },
  { key: "skill_irons", label: "Iron play" },
  { key: "skill_short_game", label: "Short game" },
  { key: "skill_putting", label: "Putting" },
];

export function OnboardingPage({ user, onComplete }: { user: User; onComplete: (user: User) => void }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [bagClubIds, setBagClubIds] = useState<Set<number>>(new Set());
  const [extraClubNames, setExtraClubNames] = useState<Set<string>>(new Set());
  const [handicap, setHandicap] = useState("");
  const [handedness, setHandedness] = useState<Handedness>("right");
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [skills, setSkills] = useState<Record<string, number | null>>({
    skill_driving: null,
    skill_irons: null,
    skill_short_game: null,
    skill_putting: null,
  });
  const [frequency, setFrequency] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clubsApi.list().then((list) => {
      setClubs(sortClubs(list));
      setBagClubIds(new Set(list.map((c) => c.id)));
    });
  }, []);

  function toggleClub(id: number) {
    setBagClubIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExtraClub(name: string) {
    setExtraClubNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const removedClubs = clubs.filter((c) => !bagClubIds.has(c.id));
      await Promise.all(removedClubs.map((c) => clubsApi.remove(c.id)));

      const extras = EXTRA_CLUB_OPTIONS.filter((c) => extraClubNames.has(c.name));
      await Promise.all(extras.map((c) => clubsApi.create({ name: c.name, type: c.type })));

      const { user: updated } = await usersApi.completeOnboarding({
        handicap: handicap.trim() === "" ? null : Number(handicap),
        handedness,
        primary_goal: primaryGoal,
        skill_driving: skills.skill_driving,
        skill_irons: skills.skill_irons,
        skill_short_game: skills.skill_short_game,
        skill_putting: skills.skill_putting,
        practice_frequency_per_week: frequency.trim() === "" ? null : Number(frequency),
        practice_session_minutes: sessionMinutes.trim() === "" ? null : Number(sessionMinutes),
      });
      onComplete(updated);
    } catch {
      setError("Failed to save your profile. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="page" style={{ paddingTop: 32 }}>
      <h1 className="page-title" style={{ marginBottom: 4 }}>Welcome, {user.display_name ?? "there"}</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 28 }}>
        A few quick questions to set up your practice tracker.
      </p>

      <section className="section">
        <h3 className="section-label">Which hand do you play from?</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className={`chip${handedness === "right" ? " is-active" : ""}`} style={{ flex: 1 }} onClick={() => setHandedness("right")}>
            Right-handed
          </button>
          <button type="button" className={`chip${handedness === "left" ? " is-active" : ""}`} style={{ flex: 1 }} onClick={() => setHandedness("left")}>
            Left-handed
          </button>
        </div>
      </section>

      <section className="section">
        <h3 className="section-label">Handicap (optional)</h3>
        <input
          id="handicap"
          type="number"
          step="0.1"
          placeholder="e.g. 14.2"
          value={handicap}
          onChange={(e) => setHandicap(e.target.value)}
          className="input"
        />
      </section>

      <section className="section">
        <h3 className="section-label">What's your main goal right now? (optional)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`chip${primaryGoal === opt.value ? " is-active" : ""}`}
              style={{ textAlign: "left" }}
              onClick={() => setPrimaryGoal(primaryGoal === opt.value ? null : opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h3 className="section-label">Rate your skill level (optional, 1-5)</h3>
        <div className="stack">
          {SKILL_AREAS.map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, width: 84, flexShrink: 0 }}>{label}</span>
              <div style={{ display: "flex", gap: 6, flex: 1 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`chip${skills[key] === n ? " is-active" : ""}`}
                    style={{ flex: 1, padding: "8px 0" }}
                    onClick={() => setSkills((s) => ({ ...s, [key]: s[key] === n ? null : n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h3 className="section-label">How often do you practice? (optional)</h3>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="number"
            min={0}
            placeholder="Times / week"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="input"
          />
          <input
            type="number"
            min={0}
            placeholder="Minutes / session"
            value={sessionMinutes}
            onChange={(e) => setSessionMinutes(e.target.value)}
            className="input"
          />
        </div>
      </section>

      <section className="section">
        <h3 className="section-label">Which clubs are in your bag?</h3>
        <div className="card" style={{ padding: 6 }}>
          {clubs.map((club, i) => (
            <label
              key={club.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 15,
                padding: "9px 8px",
                borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
              }}
            >
              <input type="checkbox" checked={bagClubIds.has(club.id)} onChange={() => toggleClub(club.id)} />
              {club.name}
            </label>
          ))}
        </div>
      </section>

      <section className="section">
        <h3 className="section-label">Add more clubs (optional)</h3>
        <div className="card" style={{ padding: 6 }}>
          {EXTRA_CLUB_OPTIONS.map((club, i) => (
            <label
              key={club.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 15,
                padding: "9px 8px",
                borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
              }}
            >
              <input
                type="checkbox"
                checked={extraClubNames.has(club.name)}
                onChange={() => toggleExtraClub(club.name)}
              />
              {club.name}
            </label>
          ))}
        </div>
      </section>

      <button type="button" className="btn btn-primary btn-lg btn-block" onClick={handleSubmit} disabled={saving}>
        {saving ? "Saving..." : "Get started"}
      </button>

      {error && <p style={{ color: "var(--color-danger)", fontSize: 14, marginTop: 12 }}>{error}</p>}
    </div>
  );
}
