import type { Club } from "../../types";

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
          className={`chip${value === club.id ? " is-active" : ""}`}
          style={{ flex: "0 0 auto", minWidth: 52, padding: "13px 16px", fontSize: 15 }}
          onClick={() => onChange(club.id)}
        >
          {club.name}
        </button>
      ))}
    </div>
  );
}
