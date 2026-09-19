import { ChoiceGrid } from "./ChoiceGrid";
import type { Contact } from "../../types";

const OPTIONS: { value: Contact; label: string }[] = [
  { value: "flush", label: "Flush" },
  { value: "thin", label: "Thin" },
  { value: "fat", label: "Fat" },
  { value: "toe", label: "Toe" },
  { value: "heel", label: "Heel" },
];

export function ContactPicker({ value, onChange }: { value: Contact | null; onChange: (v: Contact | null) => void }) {
  return (
    <div>
      <ChoiceGrid options={OPTIONS} value={value} onChange={onChange} columns={5} />
      {value && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)} style={{ marginTop: 6, padding: "4px 6px" }}>
          Clear
        </button>
      )}
    </div>
  );
}
