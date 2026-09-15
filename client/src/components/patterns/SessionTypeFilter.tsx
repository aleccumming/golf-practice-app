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
          onClick={() => onChange(opt.value)}
          style={{
            fontSize: 12,
            padding: "6px 10px",
            borderRadius: 999,
            border: value === opt.value ? "2px solid #2f8f4e" : "1px solid #ccc",
            background: value === opt.value ? "#e6f4ea" : "#fff",
            fontWeight: value === opt.value ? 700 : 500,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
