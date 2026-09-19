import { useEffect, useState } from "react";
import { patternsApi } from "../api/patterns";
import type { ShotPatterns, PuttPatterns } from "../api/patterns";
import { SessionTypeFilter } from "../components/patterns/SessionTypeFilter";
import { ShotPatternSummary, PuttPatternSummary } from "../components/patterns/PatternSummary";
import type { SessionType } from "../types";

export function PatternsPage() {
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [shotPatterns, setShotPatterns] = useState<ShotPatterns | null>(null);
  const [puttPatterns, setPuttPatterns] = useState<PuttPatterns | null>(null);

  useEffect(() => {
    patternsApi.shots({ sessionType }).then(setShotPatterns);
    patternsApi.putts({ sessionType }).then(setPuttPatterns);
  }, [sessionType]);

  return (
    <div className="page">
      <h1 className="page-title" style={{ marginBottom: 12 }}>Patterns</h1>

      <SessionTypeFilter value={sessionType} onChange={setSessionType} />
      <p className="hint" style={{ margin: "8px 0 24px" }}>
        Range and course shots are combined by default (v1) for a larger sample size — use the filter above to isolate one.
      </p>

      <h2 className="section-label">Full swing — result</h2>
      {shotPatterns ? <ShotPatternSummary clubs={shotPatterns.result} /> : <p className="empty-state">Loading...</p>}

      <h2 className="section-label" style={{ marginTop: 26 }}>Putting</h2>
      {puttPatterns ? <PuttPatternSummary data={puttPatterns} /> : <p className="empty-state">Loading...</p>}
    </div>
  );
}
