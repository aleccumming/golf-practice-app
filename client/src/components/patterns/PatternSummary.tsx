import { MissBar } from "./MissBar";
import type { ClubMissBreakdown, PuttPatterns } from "../../api/patterns";

export function ShotPatternSummary({ clubs }: { clubs: ClubMissBreakdown[] }) {
  if (clubs.length === 0) {
    return <p className="empty-state">Not enough shot data yet.</p>;
  }

  return (
    <div className="stack" style={{ gap: 10 }}>
      {clubs.map((club) => (
        <div key={club.club_id} className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
            {club.club_name}
            {club.flagged && (
              <span style={{ fontSize: 12, color: "var(--color-danger)", fontWeight: 500 }}>
                {" "}
                — {Math.round(club.flagged.pct * 100)}% {club.flagged.value} over last {club.total}
              </span>
            )}
          </div>
          <div className="stack" style={{ gap: 6 }}>
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
    return <p className="empty-state">Not enough putt data yet.</p>;
  }

  const flaggedTags = new Set(data.flagged.map((f) => f.tag));

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="card">
        <h3 className="section-label">Make% by distance</h3>
        <div className="stack" style={{ gap: 6 }}>
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

      <div className="card">
        <h3 className="section-label">Miss bias by break</h3>
        <div className="stack" style={{ gap: 14 }}>
          {data.breakBias.map((b) => (
            <div key={b.break}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, textTransform: "capitalize" }}>
                {b.break.replace(/_/g, " ")} ({b.total})
              </div>
              <div className="stack" style={{ gap: 4 }}>
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
