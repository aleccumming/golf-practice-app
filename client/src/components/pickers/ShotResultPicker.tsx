import { ChoiceGrid } from "./ChoiceGrid";
import type { ShotResult } from "../../types";

const OPTIONS: { value: ShotResult; label: string }[] = [
  { value: "good", label: "Good shot" },
  { value: "pull", label: "Pull" },
  { value: "push", label: "Push" },
  { value: "hook", label: "Hook" },
  { value: "slice", label: "Slice" },
];

export function ShotResultPicker({ value, onChange }: { value: ShotResult | null; onChange: (v: ShotResult) => void }) {
  return <ChoiceGrid options={OPTIONS} value={value} onChange={onChange} columns={3} />;
}
