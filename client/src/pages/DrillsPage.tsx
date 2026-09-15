import { useEffect, useState } from "react";
import { drillsApi } from "../api/drills";
import { DrillLibrary } from "../components/drills/DrillLibrary";
import type { Drill } from "../types";

export function DrillsPage() {
  const [drills, setDrills] = useState<Drill[]>([]);

  useEffect(() => {
    drillsApi.list().then(setDrills);
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 18, margin: "0 0 16px" }}>Drill library</h1>
      <DrillLibrary drills={drills} />
    </div>
  );
}
