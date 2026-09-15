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
        <button type="button" onClick={() => onChange(null)} style={{ marginTop: 8, fontSize: 13, color: "#666", background: "none", border: "none" }}>
          Clear
        </button>
      )}
    </div>
  );
}
