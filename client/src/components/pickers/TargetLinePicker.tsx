import { ChoiceGrid } from "./ChoiceGrid";
import type { TargetLine } from "../../types";

const OPTIONS: { value: TargetLine; label: string }[] = [
  { value: "straight", label: "Straight" },
  { value: "draw", label: "Draw" },
  { value: "fade", label: "Fade" },
];

export function TargetLinePicker({ value, onChange }: { value: TargetLine; onChange: (v: TargetLine) => void }) {
  return <ChoiceGrid options={OPTIONS} value={value} onChange={onChange} columns={3} />;
}
