import { ChoiceGrid } from "./ChoiceGrid";
import type { ShotType } from "../../types";

const OPTIONS: { value: ShotType; label: string }[] = [
  { value: "tee", label: "Tee" },
  { value: "approach", label: "Approach" },
  { value: "chip", label: "Chip" },
  { value: "punch", label: "Punch" },
];

export function ShotTypePicker({ value, onChange }: { value: ShotType | null; onChange: (v: ShotType) => void }) {
  return <ChoiceGrid options={OPTIONS} value={value} onChange={onChange} columns={4} />;
}
