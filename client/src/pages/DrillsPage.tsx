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
    <div className="page">
      <h1 className="page-title" style={{ marginBottom: 18 }}>Drill library</h1>
      <DrillLibrary drills={drills} />
    </div>
  );
}
