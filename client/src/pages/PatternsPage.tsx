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
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 18, margin: "0 0 12px" }}>Patterns</h1>

      <SessionTypeFilter value={sessionType} onChange={setSessionType} />
      <p style={{ fontSize: 11, color: "#999", margin: "6px 0 20px" }}>
        Range and course shots are combined by default (v1) for a larger sample size — use the filter above to isolate one.
      </p>

      <h2 style={{ fontSize: 15, margin: "0 0 10px" }}>Full swing — miss direction</h2>
      {shotPatterns ? <ShotPatternSummary clubs={shotPatterns.missDirection} /> : <p>Loading...</p>}

      <h2 style={{ fontSize: 15, margin: "24px 0 10px" }}>Putting</h2>
      {puttPatterns ? <PuttPatternSummary data={puttPatterns} /> : <p>Loading...</p>}
    </div>
  );
}
