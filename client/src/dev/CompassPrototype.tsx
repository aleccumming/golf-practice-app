import { useState } from "react";
import { MissCompass } from "../components/compass/MissCompass";
import type { MissDirection } from "../components/compass/compassMath";

export function CompassPrototype() {
  const [value, setValue] = useState<MissDirection>("straight");
  const [lastTap, setLastTap] = useState<{ x: number; y: number; angle: number; dist: number } | null>(null);
  const [tally, setTally] = useState<Record<MissDirection, number>>({
    straight: 0,
    push: 0,
    right: 0,
    slice: 0,
    hook: 0,
    left: 0,
    pull: 0,
  });

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 420, margin: "0 auto" }}>
      <h1 style={{ fontSize: 18 }}>Compass Prototype</h1>
      <p style={{ color: "#666", fontSize: 13 }}>
        Tap anywhere on the compass. Verify each of the 6 wedges + center all select correctly, including on a
        real phone via touch (Chrome DevTools device toolbar).
      </p>

      <div style={{ position: "relative", margin: "24px 0" }}>
        <MissCompass
          value={value}
          size={280}
          onChange={(next) => {
            setValue(next);
            setTally((t) => ({ ...t, [next]: t[next] + 1 }));
          }}
          onDebugTap={setLastTap}
        />
        {lastTap && (
          <div
            style={{
              position: "absolute",
              left: lastTap.x - 5,
              top: lastTap.y - 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "red",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      <p>
        Selected: <strong>{value}</strong>
      </p>
      {lastTap && (
        <p style={{ fontSize: 12, color: "#666" }}>
          last tap: ({lastTap.x.toFixed(0)}, {lastTap.y.toFixed(0)}) angle={lastTap.angle.toFixed(0)}deg dist=
          {lastTap.dist.toFixed(0)}px
        </p>
      )}

      <h2 style={{ fontSize: 14, marginTop: 24 }}>Tap tally</h2>
      <ul style={{ fontSize: 13 }}>
        {Object.entries(tally).map(([dir, count]) => (
          <li key={dir}>
            {dir}: {count}
          </li>
        ))}
      </ul>
    </div>
  );
}
