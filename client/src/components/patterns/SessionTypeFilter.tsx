import type { SessionType } from "../../types";

const OPTIONS: { value: SessionType | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "range", label: "Range" },
  { value: "course", label: "Course" },
  { value: "putting_green", label: "Putting green" },
];

export function SessionTypeFilter({
  value,
  onChange,
}: {
  value: SessionType | null;
  onChange: (v: SessionType | null) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.label}
          type="button"
          className={`chip chip-pill${value === opt.value ? " is-active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
