import { MissBar } from "./MissBar";
import type { ClubMissBreakdown, PuttPatterns } from "../../api/patterns";

export function ShotPatternSummary({ clubs }: { clubs: ClubMissBreakdown[] }) {
  if (clubs.length === 0) {
    return <p style={{ color: "#999", fontSize: 13 }}>Not enough shot data yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {clubs.map((club) => (
        <div key={club.club_id}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
            {club.club_name}
            {club.flagged && (
              <span style={{ fontSize: 12, color: "#c0392b", fontWeight: 500 }}>
                {" "}
                — {Math.round(club.flagged.pct * 100)}% {club.flagged.value} over last {club.total}
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {club.breakdown.map((b) => (
              <MissBar key={b.value} label={b.value} pct={b.pct} flagged={club.flagged?.value === b.value} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PuttPatternSummary({ data }: { data: PuttPatterns }) {
  const hasData = data.distanceBuckets.length > 0;
  if (!hasData) {
    return <p style={{ color: "#999", fontSize: 13 }}>Not enough putt data yet.</p>;
  }

  const flaggedTags = new Set(data.flagged.map((f) => f.tag));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Make% by distance</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {data.distanceBuckets.map((b) => (
            <MissBar
              key={b.bucket}
              label={b.bucket}
              pct={b.make_pct / 100}
              flagged={flaggedTags.has("short_putts_miss") && (b.bucket === "0-3ft" || b.bucket === "4-6ft") && b.make_pct < 80}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 13, color: "#666", margin: "0 0 6px" }}>Miss bias by break</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.breakBias.map((b) => (
            <div key={b.break}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, textTransform: "capitalize" }}>
                {b.break.replace(/_/g, " ")} ({b.total})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <MissBar label="left" pct={b.missed_left / b.total} flagged={flaggedTags.has("right_to_left_putts") && b.break === "right_to_left"} />
                <MissBar label="right" pct={b.missed_right / b.total} flagged={flaggedTags.has("left_to_right_putts") && b.break === "left_to_right"} />
                <MissBar label="short" pct={b.missed_short / b.total} />
                <MissBar label="long" pct={b.missed_long / b.total} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
