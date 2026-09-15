import type { CSSProperties } from "react";
import type { Club } from "../../types";

const pillStyle = (active: boolean): CSSProperties => ({
  flex: "0 0 auto",
  padding: "14px 18px",
  borderRadius: 10,
  border: active ? "2px solid #2f8f4e" : "1px solid #ccc",
  background: active ? "#e6f4ea" : "#fff",
  fontWeight: active ? 700 : 500,
  fontSize: 16,
  minWidth: 56,
  textAlign: "center",
});

export function ClubPicker({
  clubs,
  value,
  onChange,
}: {
  clubs: Club[];
  value: number | null;
  onChange: (clubId: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {clubs.map((club) => (
        <button
          key={club.id}
          type="button"
          style={pillStyle(value === club.id)}
          onClick={() => onChange(club.id)}
        >
          {club.name}
        </button>
      ))}
    </div>
  );
}
